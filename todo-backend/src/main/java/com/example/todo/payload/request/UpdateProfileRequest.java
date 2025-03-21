package com.example.todo.payload.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private String position;
}
