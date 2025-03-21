package com.example.todo.payload.request;

import com.example.todo.model.Subscription.SubscriptionTier;
import lombok.Data;

@Data
public class CreateTenantRequest {
    private String email;
    private String password;
    private String name;
    private SubscriptionTier subscriptionTier;
}
