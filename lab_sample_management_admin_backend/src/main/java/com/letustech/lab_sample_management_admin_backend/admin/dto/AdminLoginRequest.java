package com.letustech.lab_sample_management_admin_backend.admin.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminLoginRequest {

    // The admin frontend sends the username/email in the "email" field.
    @NotBlank(message = "Username or email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public AdminLoginRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
