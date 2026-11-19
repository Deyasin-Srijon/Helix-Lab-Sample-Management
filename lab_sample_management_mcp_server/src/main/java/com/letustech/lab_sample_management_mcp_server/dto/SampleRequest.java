package com.letustech.lab_sample_management_mcp_server.dto;

/**
 * Request DTO used when creating a new lab sample.
 *
 * This object will be converted into JSON and sent to the
 * User Backend's POST /api/samples endpoint.
 *
 * The backend expects these three fields:
 * - id
 * - description
 * - status
 */
public class SampleRequest {

    // Unique ID of the lab sample.
    private Long id;

    // Description of the sample.
    private String description;

    // Sample status: Created, In Progress, or Completed.
    private String status;

    /**
     * Default constructor.
     *
     * Jackson uses this constructor when it needs to
     * deserialize JSON into this Java object.
     */
    public SampleRequest() {
    }

    /**
     * Constructor for conveniently creating a request object.
     */
    public SampleRequest(Long id, String description, String status) {
        this.id = id;
        this.description = description;
        this.status = status;
    }

    // Getter and setter for ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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