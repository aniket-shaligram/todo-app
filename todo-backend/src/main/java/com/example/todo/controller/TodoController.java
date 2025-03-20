package com.example.todo.controller;

import com.example.todo.model.Todo;
import com.example.todo.model.User;
import com.example.todo.model.Priority;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/todos")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoController(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Todo>> getAllTodos() {
        try {
            User currentUser = getCurrentUser();
            List<Todo> todos = todoRepository.findByUser(currentUser);
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Todo> createTodo(@RequestBody TodoRequest todoRequest) {
        try {
            User currentUser = getCurrentUser();
            
            Todo todo = new Todo();
            todo.setTitle(todoRequest.getTitle());
            todo.setDescription(todoRequest.getDescription());
            todo.setCompleted(false);
            todo.setDueDate(todoRequest.getDueDate());
            todo.setPriority(Priority.valueOf(todoRequest.getPriority()));
            todo.setImageUrl(todoRequest.getImageUrl());
            todo.setUser(currentUser);
            
            Todo savedTodo = todoRepository.save(todo);
            return ResponseEntity.ok(savedTodo);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody TodoRequest todoRequest) {
        try {
            User currentUser = getCurrentUser();
            
            Todo todo = todoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Todo not found"));
            
            if (!todo.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }

            todo.setTitle(todoRequest.getTitle());
            todo.setDescription(todoRequest.getDescription());
            todo.setCompleted(todoRequest.isCompleted());
            todo.setPriority(Priority.valueOf(todoRequest.getPriority()));
            todo.setImageUrl(todoRequest.getImageUrl());
            
            if (todoRequest.getDueDate() != null) {
                todo.setDueDate(todoRequest.getDueDate());
            }

            Todo updatedTodo = todoRepository.save(todo);
            return ResponseEntity.ok(updatedTodo);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteTodo(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            
            Todo todo = todoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Todo not found"));
            
            if (!todo.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
            
            todoRepository.delete(todo);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/overdue")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Todo>> getOverdueTodos() {
        try {
            User currentUser = getCurrentUser();
            List<Todo> overdueTodos = todoRepository.findByUserAndDueDateBeforeAndCompletedFalse(currentUser, LocalDateTime.now());
            return ResponseEntity.ok(overdueTodos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

@Data
class TodoRequest {
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime dueDate;
    private String priority;
    private String imageUrl;
}
