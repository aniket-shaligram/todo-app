package com.example.todo.controller;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TodoRequest {
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime dueDate;
    private String priority = "MEDIUM";
    private String status = "NOT_STARTED";
    private String imageUrl;
}
