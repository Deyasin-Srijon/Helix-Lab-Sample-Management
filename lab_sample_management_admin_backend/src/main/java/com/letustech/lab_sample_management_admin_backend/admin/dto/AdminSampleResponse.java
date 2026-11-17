package com.letustech.lab_sample_management_admin_backend.admin.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AdminSampleResponse {

    private Long id;
    private String description;
    private String status;
    private LocalDate createdDate;
    private LocalTime createdTime;
    private String createdBy;
    private String message;

    public AdminSampleResponse(
            Long id,
            String description,
            String status,
            LocalDate createdDate,
            LocalTime createdTime,
            String createdBy,
            String message
    ) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.createdDate = createdDate;
        this.createdTime = createdTime;
        this.createdBy = createdBy;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public LocalTime getCreatedTime() {
        return createdTime;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public String getMessage() {
        return message;
    }
}
