package com.letustech.lab_sample_management_backend.user.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SampleResponse {

    private Long id;
    private String description;
    private String status;
    private LocalDate createdDate;
    private LocalTime createdTime;
    private String createdBy;
    private String message;

    public SampleResponse() {
    }

    public SampleResponse(
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
    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalTime getCreatedTime() {
        return createdTime;
    }
    public void setCreatedTime(LocalTime createdTime) {
        this.createdTime = createdTime;
    }

    public String getCreatedBy() {
        return createdBy;
    }
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}