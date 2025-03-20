package com.example.todo.request;

import com.example.todo.model.Subscription.SubscriptionTier;
import lombok.Data;

@Data
public class UpgradeRequest {
    private SubscriptionTier tier;
}
