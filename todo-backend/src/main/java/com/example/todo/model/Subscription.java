package com.example.todo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionTier tier;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @OneToOne(mappedBy = "subscription", fetch = FetchType.LAZY)
    @JsonIgnore
    private User user;
    
    public enum SubscriptionTier {
        FREE,
        BASIC,
        PREMIUM,
        ENTERPRISE
    }
    
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(startDate) && now.isBefore(endDate);
    }
}
