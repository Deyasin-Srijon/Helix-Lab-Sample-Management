package com.letustech.lab_sample_management_mcp_server.tools;

import com.letustech.lab_sample_management_mcp_server.client.BackendApiClient;
import com.letustech.lab_sample_management_mcp_server.dto.SampleUpdateRequest;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * MCP tools available to authenticated administrators.
 *
 * These tools communicate only with the Admin Backend.
 *
 * The Admin Backend is responsible for:
 * - Verifying the administrator's session.
 * - Enforcing admin authorization.
 * - Retrieving and modifying sample data.
 * - Performing database operations.
 *
 * The MCP server must not connect directly to MySQL.
 *
 * IMPORTANT SECURITY NOTE:
 * adminSessionId must be injected by the trusted application.
 * It must never be chosen or invented by the AI model.
 */
@Component
public class AdminSampleTools {

    // Shared HTTP client for communication with the Admin Backend.
    private final BackendApiClient backendApiClient;

    /**
     * Constructor injection.
     *
     * Spring automatically injects BackendApiClient.
     */
    public AdminSampleTools(BackendApiClient backendApiClient) {
        this.backendApiClient = backendApiClient;
    }

    // =========================================================
    // TOOL 1: GET ALL SAMPLES
    // =========================================================

    /**
     * Retrieves all lab samples from the Admin Backend.
     *
     * Endpoint:
     * GET /api/admin/samples
     *
     * This operation is available to administrators only.
     */
    @McpTool(
            name = "get_all_samples",
            description = """
                    Retrieve all lab samples across all users.
                    This tool is intended for authenticated administrators only.
                    """
    )
    public String getAllSamples(
            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Call the Admin Backend to retrieve all samples.
        String response = backendApiClient.adminGet(
                "/api/admin/samples",
                adminSessionId
        );

        // Return the backend response.
        return responseOrMessage(
                response,
                "The backend returned no sample data."
        );
    }

    // =========================================================
    // TOOL 2: GET SAMPLE BY ID
    // =========================================================

    /**
     * Retrieves any sample by its ID.
     *
     * Endpoint:
     * GET /api/admin/samples/{sampleId}
     *
     * Unlike a User tool, the Admin Backend permits administrators
     * to retrieve samples belonging to any user.
     */
    @McpTool(
            name = "get_sample_by_id",
            description = """
                    Retrieve any lab sample by its unique sample ID.
                    This tool is available to authenticated administrators.
                    """
    )
    public String getSampleById(
            @McpToolParam(
                    description = "Unique ID of the lab sample",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Reject invalid IDs before sending an HTTP request.
        validateSampleId(sampleId);

        // Build the sample-specific API endpoint.
        String endpoint = "/api/admin/samples/" + sampleId;

        // Send the GET request using the authenticated admin session.
        String response = backendApiClient.adminGet(
                endpoint,
                adminSessionId
        );

        return responseOrMessage(
                response,
                "The backend returned no sample data."
        );
    }

    // =========================================================
    // TOOL 3: UPDATE SAMPLE
    // =========================================================

    /**
     * Updates a sample's description and status.
     *
     * Endpoint:
     * PUT /api/admin/samples/{sampleId}
     *
     * Admins may update any sample.
     * Only description and status are exposed as editable fields.
     */
    @McpTool(
            name = "update_sample",
            description = """
                    Update the description and status of any lab sample.
                    Only description and status can be modified.
                    Allowed status values: Created, In Progress, Completed.
                    This tool is intended for authenticated administrators.
                    """
    )
    public String updateSample(
            @McpToolParam(
                    description = "ID of the sample to update",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "New sample description",
                    required = false
            )
            String description,

            @McpToolParam(
                    description = "New status: Created, In Progress, or Completed",
                    required = false
            )
            String status,

            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Validate sample ID.
        validateSampleId(sampleId);

        // Ensure at least one field is provided for update.
        if ((description == null || description.isBlank())
                && (status == null || status.isBlank())) {
            throw new IllegalArgumentException(
                    "Please provide either a new description or a new status."
            );
        }

        // Validate description only when it is provided.
        if (description != null && description.isBlank()) {
            throw new IllegalArgumentException(
                    "Sample description cannot be blank."
            );
        }

        // Validate status only when it is provided.
        String normalizedStatus = null;

        if (status != null && !status.isBlank()) {
            normalizedStatus = normalizeStatus(status);
        }

        // Fetch the existing sample before updating.
        String existingSampleResponse = backendApiClient.adminGet(
                "/api/admin/samples/" + sampleId,
                adminSessionId
        );

        // Parse the existing sample JSON.
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode existingSample;

        try {
            existingSample = objectMapper.readTree(existingSampleResponse);
        } catch (tools.jackson.core.JacksonException exception) {
            throw new IllegalStateException(
                    "Unable to read the existing sample details."
            );
        }

        // Preserve existing values when fields are not provided.
        String existingDescription =
                existingSample.get("description").asString();

        String existingStatus =
                existingSample.get("status").asString();

        // Merge provided values with existing values.
        String finalDescription =
                description != null
                        ? description.trim()
                        : existingDescription;

        String finalStatus =
                normalizedStatus != null
                        ? normalizedStatus
                        : existingStatus;

        // Construct the complete DTO expected by the Admin Backend.
        SampleUpdateRequest request = new SampleUpdateRequest(
                finalDescription,
                finalStatus
        );

        // Build the update endpoint.
        String endpoint = "/api/admin/samples/" + sampleId;

        // Perform the update.
        String response = backendApiClient.adminPut(
                endpoint,
                request,
                adminSessionId
        );

        // Return success only if the backend request succeeds.
        return buildSuccessMessage(
                "Sample update",
                response
        );
    }

    // =========================================================
    // TOOL 4: DELETE SAMPLE
    // =========================================================

    /**
     * Deletes any sample by ID.
     *
     * Endpoint:
     * DELETE /api/admin/samples/{sampleId}
     *
     * This operation is destructive.
     * The trusted chatbot application must obtain explicit
     * confirmation before executing this tool.
     */
    @McpTool(
            name = "delete_sample",
            description = """
                    Delete any lab sample by its ID.
                    This is a destructive administrator operation.
                    The trusted application must obtain explicit
                    user confirmation before calling this tool.
                    """
    )
    public String deleteSample(
            @McpToolParam(
                    description = "ID of the sample to delete",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "Must be true only after explicit deletion confirmation in the trusted application",
                    required = true
            )
            Boolean confirmed,

            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Validate sample ID.
        validateSampleId(sampleId);

        // Do not allow deletion without confirmation.
        if (!Boolean.TRUE.equals(confirmed)) {
            throw new IllegalStateException(
                    "Sample deletion was not confirmed by the user."
            );
        }

        // Construct the deletion endpoint.
        String endpoint = "/api/admin/samples/" + sampleId;

        // Execute the DELETE request through the Admin Backend.
        String response = backendApiClient.adminDelete(
                endpoint,
                adminSessionId
        );

        // Report success only after the backend succeeds.
        return buildSuccessMessage(
                "Sample deletion",
                response
        );
    }

    // =========================================================
    // TOOL 5: FILTER SAMPLES BY STATUS
    // =========================================================

    /**
     * Retrieves samples matching a specified status.
     *
     * Endpoint:
     * GET /api/admin/samples/status/{status}
     *
     * Supported statuses:
     * Created
     * In Progress
     * Completed
     */
    @McpTool(
            name = "filter_samples_by_status",
            description = """
                    Retrieve lab samples filtered by status.
                    Allowed statuses: Created, In Progress, Completed.
                    Use this tool when an administrator asks to find samples
                    with a particular status.
                    """
    )
    public String filterSamplesByStatus(
            @McpToolParam(
                    description = "Status to filter by: Created, In Progress, or Completed",
                    required = true
            )
            String status,

            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Validate and normalize the status.
        String normalizedStatus = normalizeStatus(status);

        // Construct the filtering endpoint.
        //
        // BackendApiClient encodes the URI so the space in
        // "In Progress" is safely transmitted over HTTP.
        String endpoint =
                "/api/admin/samples/status/" + normalizedStatus;

        // Retrieve matching samples.
        String response = backendApiClient.adminGet(
                endpoint,
                adminSessionId
        );

        return responseOrMessage(
                response,
                "No samples were returned for status: "
                        + normalizedStatus
        );
    }

    // =========================================================
    // TOOL 6: FILTER SAMPLES BY USER
    // =========================================================

    /**
     * Retrieves all samples associated with a particular user ID.
     *
     * Endpoint:
     * GET /api/admin/samples/user/{userId}
     *
     * This is an administrator-only operation.
     */
    @McpTool(
            name = "filter_samples_by_user",
            description = """
                    Retrieve all lab samples belonging to a specified user ID.
                    This tool is intended for authenticated administrators.
                    The user ID must be provided by the administrator.
                    """
    )
    public String filterSamplesByUser(
            @McpToolParam(
                    description = "Numeric ID of the user whose samples should be retrieved",
                    required = true
            )
            Long userId,

            @McpToolParam(
                    description = "Authenticated administrator's session ID. Injected by the trusted application.",
                    required = true
            )
            String adminSessionId
    ) {

        // Validate the user ID.
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "User ID must be a positive number."
            );
        }

        // Construct the user-specific filtering endpoint.
        String endpoint = "/api/admin/samples/user/" + userId;

        // Retrieve samples belonging to the specified user.
        String response = backendApiClient.adminGet(
                endpoint,
                adminSessionId
        );

        return responseOrMessage(
                response,
                "No samples were returned for user ID: " + userId
        );
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    /**
     * Ensures that sample IDs are positive numeric values.
     */
    private void validateSampleId(Long sampleId) {

        if (sampleId == null || sampleId <= 0) {

            throw new IllegalArgumentException(
                    "Sample ID must be a positive number."
            );
        }
    }

    /**
     * Validates and normalizes sample status.
     *
     * Case-insensitive matching is allowed, but the value sent
     * to the backend is always in canonical form.
     */
    private String normalizeStatus(String status) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Sample status cannot be empty."
            );
        }

        String normalized = status.trim();

        if (normalized.equalsIgnoreCase("Created")) {
            return "Created";
        }

        if (normalized.equalsIgnoreCase("In Progress")) {
            return "In Progress";
        }

        if (normalized.equalsIgnoreCase("Completed")) {
            return "Completed";
        }

        throw new IllegalArgumentException(
                "Invalid sample status. Allowed values: "
                        + "Created, In Progress, Completed."
        );
    }

    // =========================================================
    // RESPONSE HELPERS
    // =========================================================

    /**
     * Builds a readable message after a successful backend operation.
     */
    private String buildSuccessMessage(
            String operation,
            String backendResponse
    ) {

        if (backendResponse == null || backendResponse.isBlank()) {

            return operation
                    + " succeeded. The backend returned HTTP success "
                    + "but no response body.";
        }

        return operation
                + " succeeded. Backend response:\n"
                + backendResponse;
    }

    /**
     * Returns backend data when present.
     * Otherwise, returns a fallback message.
     */
    private String responseOrMessage(
            String response,
            String fallbackMessage
    ) {

        if (response == null || response.isBlank()) {
            return fallbackMessage;
        }

        return response;
    }
}
