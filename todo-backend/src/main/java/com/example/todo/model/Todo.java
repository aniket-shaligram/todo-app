package com.example.todo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private boolean completed;
    
    private LocalDateTime dueDate;
    
    private boolean overdue;

    @Enumerated(EnumType.STRING)
    private com.example.todo.model.Priority priority = com.example.todo.model.Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    private com.example.todo.model.Status status = com.example.todo.model.Status.NOT_STARTED;

    @Column(length = 1000)
    private String imageUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        updateOverdueStatus();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateOverdueStatus();
    }
    
    private void updateOverdueStatus() {
        if (dueDate != null && !completed) {
            overdue = LocalDateTime.now().isAfter(dueDate);
        } else {
            overdue = false;
        }

        // Update status based on completion
        if (completed) {
            status = com.example.todo.model.Status.COMPLETED;
        } else if (status == com.example.todo.model.Status.COMPLETED) {
            status = com.example.todo.model.Status.IN_PROGRESS;
        }
    }
}
