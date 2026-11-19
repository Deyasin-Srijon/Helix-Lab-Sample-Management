package com.letustech.lab_sample_management_mcp_server.dto;

/**
 * Request DTO used when updating an existing lab sample.
 *
 * Both the User Backend and Admin Backend expect:
 * - description
 * - status
 *
 * The sample ID is provided in the REST API URL, not in this body.
 */
public class SampleUpdateRequest {

    // Updated sample description.
    private String description;

    // Updated sample status.
    private String status;

    /**
     * Default constructor required for JSON serialization support.
     */
    public SampleUpdateRequest() {
    }

    /**
     * Constructor for creating an update request easily.
     */
    public SampleUpdateRequest(String description, String status) {
        this.description = description;
        this.status = status;
    }

    // Getter and setter for description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter and setter for status
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}