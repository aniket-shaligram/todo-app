package com.example.todo.payload.request;

import com.example.todo.model.Subscription.SubscriptionTier;
import lombok.Data;

@Data
public class UpdateSubscriptionRequest {
    private SubscriptionTier subscriptionTier;
}
