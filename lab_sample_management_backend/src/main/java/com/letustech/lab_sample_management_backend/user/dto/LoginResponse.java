package com.letustech.lab_sample_management_backend.user.dto;

public class LoginResponse {

    private Long userId;
    private String username;
    private String message;

    // Default constructor
    public LoginResponse() {
    }

    // Parameterized constructor
    public LoginResponse(Long userId, String username, String message) {
        this.userId = userId;
        this.username = username;
        this.message = message;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}