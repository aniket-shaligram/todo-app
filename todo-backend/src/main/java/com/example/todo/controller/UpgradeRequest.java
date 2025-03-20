package com.example.todo.controller;

import com.example.todo.model.Subscription.SubscriptionTier;
import lombok.Data;

@Data
public class UpgradeRequest {
    private SubscriptionTier tier;
}
