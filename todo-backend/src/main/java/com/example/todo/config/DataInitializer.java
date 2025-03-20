package com.example.todo.config;

import com.example.todo.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initData(UserService userService) {
        return args -> {
            userService.createInitialAdminIfNeeded();
        };
    }
}
