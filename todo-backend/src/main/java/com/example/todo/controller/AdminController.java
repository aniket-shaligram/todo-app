package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.model.Subscription.SubscriptionTier;
import com.example.todo.service.UserService;
import com.example.todo.payload.request.CreateTenantRequest;
import com.example.todo.payload.request.UpdateSubscriptionRequest;
import com.example.todo.payload.response.TenantResponse;
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

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        List<User> users = userService.getAllTenants();
        
        List<TenantResponse> tenants = users.stream()
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
        userService.deleteTenant(id);
        return ResponseEntity.ok().build();
    }
}
