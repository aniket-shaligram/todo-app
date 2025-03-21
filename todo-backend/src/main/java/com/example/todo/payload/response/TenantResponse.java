package com.example.todo.payload.response;

import com.example.todo.model.Subscription.SubscriptionTier;
import lombok.Data;

@Data
public class TenantResponse {
    private Long id;
    private String email;
    private String name;
    private SubscriptionTier subscriptionTier;
    private boolean active;

    public TenantResponse(Long id, String email, String name, SubscriptionTier subscriptionTier, boolean active) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.subscriptionTier = subscriptionTier;
        this.active = active;
    }
}
