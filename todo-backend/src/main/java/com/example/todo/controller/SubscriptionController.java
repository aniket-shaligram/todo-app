package com.example.todo.controller;

import com.example.todo.model.Subscription;
import com.example.todo.model.User;
import com.example.todo.service.UserService;
import com.example.todo.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscription")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SubscriptionController {

    private final UserService userService;
    private final UserRepository userRepository;

    public SubscriptionController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/status")
    public ResponseEntity<SubscriptionStatus> getStatus() {
        User user = getCurrentUser();
        Subscription subscription = user.getSubscription();
        
        return ResponseEntity.ok(new SubscriptionStatus(
            subscription.getTier(),
            subscription.getStartDate(),
            subscription.getEndDate(),
            subscription.isActive()
        ));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionStatus> upgrade(@RequestBody UpgradeRequest request) {
        User user = getCurrentUser();
        user = userService.upgradeSubscription(user.getId(), request.getTier());
        Subscription subscription = user.getSubscription();
        
        return ResponseEntity.ok(new SubscriptionStatus(
            subscription.getTier(),
            subscription.getStartDate(),
            subscription.getEndDate(),
            subscription.isActive()
        ));
    }
}

@Data
class UpgradeRequest {
    private Subscription.SubscriptionTier tier;
}

@Data
class SubscriptionStatus {
    private Subscription.SubscriptionTier tier;
    private java.time.LocalDateTime startDate;
    private java.time.LocalDateTime endDate;
    private boolean active;

    public SubscriptionStatus(
        Subscription.SubscriptionTier tier,
        java.time.LocalDateTime startDate,
        java.time.LocalDateTime endDate,
        boolean active
    ) {
        this.tier = tier;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
    }
}
