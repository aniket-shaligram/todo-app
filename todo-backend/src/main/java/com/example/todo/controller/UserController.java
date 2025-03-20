package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.request.RegisterRequest;
import com.example.todo.request.LoginRequest;
import com.example.todo.service.UserService;
import com.example.todo.security.JwtTokenProvider;
import com.example.todo.response.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.register(request);
        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request);
        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
