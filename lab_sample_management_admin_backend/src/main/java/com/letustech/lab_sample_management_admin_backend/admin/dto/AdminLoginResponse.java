package com.letustech.lab_sample_management_admin_backend.admin.dto;

public class AdminLoginResponse {

    private Long adminId;
    private String username;
    private String message;

    public AdminLoginResponse() {
    }

    public AdminLoginResponse(Long adminId, String username, String message) {
        this.adminId = adminId;
        this.username = username;
        this.message = message;
    }

    public Long getAdminId() {
        return adminId;
    }

    public String getUsername() {
        return username;
    }

    public String getMessage() {
        return message;
    }
}
