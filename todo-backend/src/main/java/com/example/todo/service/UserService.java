package com.example.todo.service;

import com.example.todo.model.User;
import com.example.todo.model.Subscription;
import com.example.todo.repository.UserRepository;
import com.example.todo.request.LoginRequest;
import com.example.todo.request.RegisterRequest;
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

@Service
public class UserService implements UserDetailsService {

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
        if (userRepository.findByEmail(email).isPresent()) {
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

        return userRepository.save(user);
    }

    public User registerTenant(String email, String password, String name, Subscription.SubscriptionTier tier) {
        User user = registerUser(email, password, name, false);
        return upgradeSubscription(user.getId(), tier);
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        
        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (user.isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    public User upgradeSubscription(Long userId, Subscription.SubscriptionTier newTier) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Subscription subscription = user.getSubscription();
        subscription.setTier(newTier);
        
        // Set subscription period based on tier
        subscription.setStartDate(LocalDateTime.now());
        if (newTier == Subscription.SubscriptionTier.FREE) {
            subscription.setEndDate(LocalDateTime.now().plusYears(100));
        } else {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        }

        return userRepository.save(user);
    }

    // Create initial admin user if none exists
    public void createInitialAdminIfNeeded() {
        if (userRepository.count() == 0) {
            registerUser(defaultAdminEmail, defaultAdminPassword, defaultAdminName, true);
        }
    }
}
