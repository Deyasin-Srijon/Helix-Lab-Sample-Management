package com.letustech.lab_sample_management_backend.user.dto;

import jakarta.validation.constraints.NotBlank;

public class SampleUpdateRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    public SampleUpdateRequest() {
    }

    public SampleUpdateRequest(
            String description,
            String status
    ) {
        this.description = description;
        this.status = status;
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

}