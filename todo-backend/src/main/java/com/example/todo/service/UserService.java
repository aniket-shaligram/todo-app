package com.example.todo.service;

import com.example.todo.model.User;
import com.example.todo.model.Subscription;
import com.example.todo.repository.UserRepository;
import com.example.todo.payload.request.LoginRequest;
import com.example.todo.payload.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-name}")
    private String defaultAdminName;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String email, String password, String name) {
        return registerUser(email, password, name, false);
    }

    public User registerUser(String email, String password, String name, boolean isAdmin) {
        logger.debug("Registering user: email={}, name={}, isAdmin={}", email, name, isAdmin);
        
        if (userRepository.findByEmail(email).isPresent()) {
            logger.error("Email already registered: {}", email);
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setAdmin(isAdmin);

        // Create a free subscription
        Subscription subscription = new Subscription();
        subscription.setTier(Subscription.SubscriptionTier.FREE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusYears(100)); // Effectively unlimited for free tier
        subscription.setUser(user);
        user.setSubscription(subscription);

        logger.debug("Saving new user to database");
        return userRepository.save(user);
    }

    public User registerTenant(String email, String password, String name, Subscription.SubscriptionTier tier) {
        User user = registerUser(email, password, name, false);
        return upgradeSubscription(user.getId(), tier);
    }

    public User register(RegisterRequest request) {
        logger.debug("Processing registration request for email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.error("Email already registered: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        
        // Create a free subscription
        Subscription subscription = new Subscription();
        subscription.setTier(Subscription.SubscriptionTier.FREE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusYears(100)); // Effectively unlimited for free tier
        subscription.setUser(user);
        user.setSubscription(subscription);
        
        logger.debug("Saving new user from registration request");
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        logger.debug("Updating user: {}", user.getEmail());
        
        if (!userRepository.existsById(user.getId())) {
            logger.error("User not found: {}", user.getId());
            throw new RuntimeException("User not found");
        }
        
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        logger.debug("Getting user by email: {}", email);
        return userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.error("User not found for email: {}", email);
                return new UsernameNotFoundException("User not found");
            });
    }

    public User login(LoginRequest request) {
        logger.debug("Processing login request for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                logger.error("User not found for email: {}", request.getEmail());
                return new BadCredentialsException("Invalid email or password");
            });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.error("Invalid password for user: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        logger.debug("Login successful for user: {}", request.getEmail());
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading UserDetails for email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found for email: {}", email);
                    return new UsernameNotFoundException("User not found");
                });

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (user.isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        logger.debug("UserDetails loaded successfully for: {}", email);
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    public User upgradeSubscription(Long userId, Subscription.SubscriptionTier newTier) {
        logger.debug("Upgrading subscription for user ID: {} to tier: {}", userId, newTier);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found for ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        Subscription subscription = user.getSubscription();
        if (subscription == null) {
            subscription = new Subscription();
            subscription.setUser(user);
        }

        subscription.setTier(newTier);
        subscription.setStartDate(LocalDateTime.now());
        if (newTier == Subscription.SubscriptionTier.FREE) {
            subscription.setEndDate(LocalDateTime.now().plusYears(100));
        } else {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        }

        logger.debug("Saving user with upgraded subscription");
        return userRepository.save(user);
    }

    public List<User> getAllTenants() {
        return userRepository.findAll().stream()
                .filter(user -> !user.isAdmin())
                .collect(Collectors.toList());
    }

    public void createInitialAdminIfNeeded() {
        logger.debug("Checking if admin user needs to be created");
        
        if (!userRepository.findByEmail(defaultAdminEmail).isPresent()) {
            logger.info("Creating default admin user");
            registerUser(defaultAdminEmail, defaultAdminPassword, defaultAdminName, true);
            logger.info("Default admin user created successfully");
        } else {
            logger.debug("Admin user already exists");
        }
    }

    public void deleteTenant(Long id) {
        logger.debug("Deleting tenant with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isAdmin()) {
            logger.error("Cannot delete admin user with id: {}", id);
            throw new RuntimeException("Cannot delete admin user");
        }
        
        userRepository.delete(user);
        logger.info("Successfully deleted tenant with id: {}", id);
    }
}
