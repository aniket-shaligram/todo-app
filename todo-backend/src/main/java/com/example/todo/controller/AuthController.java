package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.request.LoginRequest;
import com.example.todo.request.RegisterRequest;
import com.example.todo.security.JwtService;
import com.example.todo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.debug("Processing registration request for email: {}", request.getEmail());
            User user = userService.register(request);
            String token = jwtService.generateToken(user);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            log.debug("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.debug("Processing login request for email: {}", request.getEmail());
            User user = userService.login(request);
            String token = jwtService.generateToken(user);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            log.debug("User authenticated successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getEmail(), e);
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
