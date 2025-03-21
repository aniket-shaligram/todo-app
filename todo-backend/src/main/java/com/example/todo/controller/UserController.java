package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.payload.request.RegisterRequest;
import com.example.todo.payload.request.LoginRequest;
import com.example.todo.payload.request.UpdateProfileRequest;
import com.example.todo.payload.request.ChangePasswordRequest;
import com.example.todo.service.UserService;
import com.example.todo.security.JwtTokenProvider;
import com.example.todo.payload.response.AuthResponse;
import com.example.todo.payload.response.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserService userService,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            logger.info("Registering user with email: {}", request.getEmail());
            User user = userService.register(request);
            String token = jwtTokenProvider.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            logger.error("Error during registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage(), ""));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Attempting login for user: {}", request.getEmail());

            // Create authentication token
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user details
            User user = userService.getUserByEmail(request.getEmail());
            logger.debug("User found: {}", user.getEmail());

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(user);
            logger.debug("JWT token generated successfully");

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            logger.error("Error during login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password", ""));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            User user = userService.getUserByEmail(email);
            user.setName(request.getName());
            user.setContactNumber(request.getContactNumber());
            user.setPosition(request.getPosition());
            
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage(), ""));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            User user = userService.getUserByEmail(email);
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Current password is incorrect", ""));
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userService.updateUser(user);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage(), ""));
        }
    }
}
