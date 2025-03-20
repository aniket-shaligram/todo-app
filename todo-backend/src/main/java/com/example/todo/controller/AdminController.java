package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.model.Subscription;
import com.example.todo.service.UserService;
import com.example.todo.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;

    public AdminController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        List<TenantResponse> tenants = userRepository.findAll().stream()
            .map(user -> new TenantResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSubscription().getTier(),
                user.getSubscription().isActive()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(tenants);
    }

    @PostMapping("/tenants")
    public ResponseEntity<TenantResponse> createTenant(@RequestBody CreateTenantRequest request) {
        User user = userService.registerTenant(
            request.getEmail(),
            request.getPassword(),
            request.getName(),
            request.getSubscriptionTier()
        );

        return ResponseEntity.ok(new TenantResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getSubscription().getTier(),
            user.getSubscription().isActive()
        ));
    }

    @PutMapping("/tenants/{id}/subscription")
    public ResponseEntity<TenantResponse> updateTenantSubscription(
            @PathVariable Long id,
            @RequestBody UpdateSubscriptionRequest request) {
        
        User user = userService.upgradeSubscription(id, request.getSubscriptionTier());
        
        return ResponseEntity.ok(new TenantResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getSubscription().getTier(),
            user.getSubscription().isActive()
        ));
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<?> deleteTenant(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

@Data
class CreateTenantRequest {
    private String email;
    private String password;
    private String name;
    private Subscription.SubscriptionTier subscriptionTier;
}

@Data
class UpdateSubscriptionRequest {
    private Subscription.SubscriptionTier subscriptionTier;
}

@Data
class TenantResponse {
    private Long id;
    private String email;
    private String name;
    private Subscription.SubscriptionTier subscriptionTier;
    private boolean active;

    public TenantResponse(Long id, String email, String name, Subscription.SubscriptionTier subscriptionTier, boolean active) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.subscriptionTier = subscriptionTier;
        this.active = active;
    }
}
