package com.example.todo.payload.response;

import com.example.todo.model.Subscription;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionStatus {
    private Subscription.SubscriptionTier tier;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;

    public SubscriptionStatus(
        Subscription.SubscriptionTier tier,
        LocalDateTime startDate,
        LocalDateTime endDate,
        boolean active
    ) {
        this.tier = tier;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
    }
}
