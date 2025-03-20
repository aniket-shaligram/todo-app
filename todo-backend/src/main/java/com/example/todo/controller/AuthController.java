package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.service.UserService;
import com.example.todo.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true", maxAge = 3600)
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.debug("Processing registration request for email: {}", request.getEmail());
            User user = userService.registerUser(request.getEmail(), request.getPassword(), request.getName());
            UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(userDetails);
            log.debug("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.debug("Processing login request for email: {}", request.getEmail());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            log.debug("User authenticated successfully: {}", request.getEmail());
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);
            
            log.debug("JWT token generated for user: {}", request.getEmail());
            
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (BadCredentialsException e) {
            log.error("Invalid credentials for user: {}", request.getEmail());
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid email or password"));
        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getEmail(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error"));
        }
    }
}
