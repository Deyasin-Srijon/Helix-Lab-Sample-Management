package com.letustech.lab_sample_management_mcp_server.tools;

import com.letustech.lab_sample_management_mcp_server.client.BackendApiClient;
import com.letustech.lab_sample_management_mcp_server.dto.SampleRequest;
import com.letustech.lab_sample_management_mcp_server.dto.SampleUpdateRequest;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * MCP tools for operations available to normal lab users.
 *
 * These tools only call the User Backend.
 *
 * The User Backend is responsible for:
 * - Identifying the authenticated user from the HTTP session.
 * - Enforcing ownership of lab samples.
 * - Validating database operations.
 *
 * This class must NEVER accept a userId and use it to decide
 * whose records should be accessed.
 *
 * The sessionId is supplied by the trusted Python application.
 * The Python application must replace any model-generated value
 * with the session belonging to the authenticated chat user.
 */
@Component
public class UserSampleTools {

    // Shared client used to communicate with the User Backend.
    private final BackendApiClient backendApiClient;

    /**
     * Constructor injection.
     *
     * Spring automatically injects BackendApiClient.
     */
    public UserSampleTools(BackendApiClient backendApiClient) {
        this.backendApiClient = backendApiClient;
    }

    // =========================================================
    // TOOL 1: CREATE SAMPLE
    // =========================================================

    /**
     * Creates a new sample for the currently authenticated user.
     *
     * Backend endpoint:
     * POST /api/samples
     *
     * The backend associates the sample with the user identified
     * by the authenticated session.
     *
     * The AI must not invent sample IDs. If the user hasn't
     * supplied an ID, it should ask for one.
     */
    @McpTool(
            name = "create_sample",
            description = """
                    Create a new lab sample for the authenticated user.
                    Required fields are sample ID, description, and status.
                    Allowed status values are Created, In Progress, and Completed.
                    Do not create a sample unless the user has supplied the required details.
                    """
    )
    public String createSample(
            @McpToolParam(
                    description = "Unique numeric ID for the new lab sample",
                    required = true
            )
            Long id,

            @McpToolParam(
                    description = "Description of the lab sample",
                    required = true
            )
            String description,

            @McpToolParam(
                    description = "Sample status: Created, In Progress, or Completed",
                    required = true
            )
            String status,

            @McpToolParam(
                    description = "Authenticated user's backend session ID. Injected by the trusted chatbot application, not selected by the AI.",
                    required = true
            )
            String sessionId
    ) {

        // Validate sample ID.
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Sample ID must be a positive number."
            );
        }

        // Validate description.
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException(
                    "Sample description cannot be empty."
            );
        }

        // Normalize and validate the status.
        String normalizedStatus = normalizeStatus(status);

        // Create the request DTO expected by the backend.
        SampleRequest request = new SampleRequest(
                id,
                description.trim(),
                normalizedStatus
        );

        // Send the request to the backend.
        // The backend determines which user owns the sample
        // based on the authenticated session.
        String response = backendApiClient.userPost(
                "/api/samples",
                request,
                sessionId
        );

        // Return success only after the backend request succeeds.
        return buildSuccessMessage(
                "Sample creation",
                response
        );
    }

    // =========================================================
    // TOOL 2: GET MY SAMPLES
    // =========================================================

    /**
     * Retrieves all samples owned by the authenticated user.
     *
     * Backend endpoint:
     * GET /api/samples
     *
     * The backend uses the session to identify the user.
     * No userId parameter is accepted from the AI.
     */
    @McpTool(
            name = "get_my_samples",
            description = """
                    Retrieve all lab samples belonging to the authenticated user.
                    This tool must not retrieve other users' samples.
                    """
    )
    public String getMySamples(
            @McpToolParam(
                    description = "Authenticated user's backend session ID. Injected by the trusted chatbot application.",
                    required = true
            )
            String sessionId
    ) {

        // Call the User Backend's own-samples endpoint.
        String response = backendApiClient.userGet(
                "/api/samples",
                sessionId
        );

        // Return the backend response containing the user's samples.
        return responseOrMessage(
                response,
                "No response body was returned by the backend."
        );
    }

    // =========================================================
    // TOOL 3: GET MY SAMPLE BY ID
    // =========================================================

    /**
     * Retrieves a specific sample belonging to the authenticated user.
     *
     * Backend endpoint:
     * GET /api/samples/{sampleId}
     *
     * The backend checks ownership.
     * If the sample does not belong to the logged-in user,
     * the backend should reject the request.
     */
    @McpTool(
            name = "get_my_sample_by_id",
            description = """
                    Retrieve a specific lab sample by its ID.
                    Only samples belonging to the authenticated user can be accessed.
                    Provide the sample ID specified by the user.
                    """
    )
    public String getMySampleById(
            @McpToolParam(
                    description = "ID of the sample to retrieve",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "Authenticated user's backend session ID. Injected by the trusted chatbot application.",
                    required = true
            )
            String sessionId
    ) {

        // Validate the requested sample ID.
        validateSampleId(sampleId);

        // Construct the endpoint for the requested sample.
        String endpoint = "/api/samples/" + sampleId;

        // Call the backend using the authenticated session.
        String response = backendApiClient.userGet(
                endpoint,
                sessionId
        );

        // Backend errors such as 404 or 403 are propagated by
        // BackendApiClient rather than being treated as success.
        return responseOrMessage(
                response,
                "The backend returned an empty response."
        );
    }

    // =========================================================
    // TOOL 4: UPDATE MY SAMPLE
    // =========================================================

    /**
     * Updates the description and status of the user's own sample.
     *
     * Backend endpoint:
     * PUT /api/samples/{sampleId}
     *
     * Only description and status are editable.
     * Ownership validation is performed by the backend.
     */
    @McpTool(
            name = "update_my_sample",
            description = """
                    Update the description and/or status of a lab sample
                    belonging to the authenticated user.
                    Allowed statuses: Created, In Progress, Completed.
                    Only description and status can be modified.
                    """
    )
    public String updateMySample(
            @McpToolParam(
                    description = "ID of the sample to update",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "New description for the sample (optional)",
                    required = false
            )
            String description,

            @McpToolParam(
                    description = "New status: Created, In Progress, or Completed (optional)",
                    required = false
            )
            String status,

            @McpToolParam(
                    description = "Authenticated user's backend session ID. Injected by the trusted chatbot application.",
                    required = true
            )
            String sessionId
    ) {

        // Validate the sample ID.
        validateSampleId(sampleId);

        // Ensure at least one field is provided for update.
        if ((description == null || description.isBlank())
                && (status == null || status.isBlank())) {
            throw new IllegalArgumentException(
                    "Please provide either a new description or a new status."
            );
        }

        // Validate the description only when it is provided.
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
        String existingSampleResponse = backendApiClient.userGet(
                "/api/samples/" + sampleId,
                sessionId
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

        // Create the complete update request.
        SampleUpdateRequest request = new SampleUpdateRequest(
                finalDescription,
                finalStatus
        );

        // Construct the sample-specific endpoint.
        String endpoint = "/api/samples/" + sampleId;

        // Send the PUT request to the User Backend.
        String response = backendApiClient.userPut(
                endpoint,
                request,
                sessionId
        );

        // Return success only after the backend accepts the update.
        return buildSuccessMessage(
                "Sample update",
                response
        );
    }

    // =========================================================
    // TOOL 5: DELETE MY SAMPLE
    // =========================================================

    /**
     * Deletes a sample owned by the authenticated user.
     *
     * Backend endpoint:
     * DELETE /api/samples/{sampleId}
     *
     * The chatbot must first ask the user for explicit confirmation.
     *
     * This confirmation parameter is an additional guard,
     * NOT a security boundary. The trusted Python application
     * must ensure this tool is only called after the user
     * confirms deletion.
     */
    @McpTool(
            name = "delete_my_sample",
            description = """
                    Delete a lab sample belonging to the authenticated user.
                    This is a destructive operation.
                    The trusted chatbot application must obtain explicit
                    confirmation from the user before calling this tool.
                    """
    )
    public String deleteMySample(
            @McpToolParam(
                    description = "ID of the sample to delete",
                    required = true
            )
            Long sampleId,

            @McpToolParam(
                    description = "Must be true only after explicit user confirmation in the trusted application",
                    required = true
            )
            Boolean confirmed,

            @McpToolParam(
                    description = "Authenticated user's backend session ID. Injected by the trusted chatbot application.",
                    required = true
            )
            String sessionId
    ) {

        // Validate the sample ID.
        validateSampleId(sampleId);

        // Refuse deletion unless the caller supplies confirmation.
        // The Python application must control this value.
        if (!Boolean.TRUE.equals(confirmed)) {
            throw new IllegalStateException(
                    "Sample deletion was not confirmed by the user."
            );
        }

        // Construct the delete endpoint.
        String endpoint = "/api/samples/" + sampleId;

        // Execute deletion through the backend.
        // The backend still verifies the authenticated user's ownership.
        String response = backendApiClient.userDelete(
                endpoint,
                sessionId
        );

        // Only report success after the backend request succeeds.
        return buildSuccessMessage(
                "Sample deletion",
                response
        );
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    /**
     * Validates that the sample ID is a positive number.
     */
    private void validateSampleId(Long sampleId) {

        if (sampleId == null || sampleId <= 0) {

            throw new IllegalArgumentException(
                    "Sample ID must be a positive number."
            );
        }
    }

    /**
     * Validates the status and returns its canonical value.
     *
     * The backend accepts case-insensitive status input,
     * but we normalize it to the exact application values:
     *
     * Created
     * In Progress
     * Completed
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
     * Creates a readable operation result.
     *
     * A backend exception is not caught here, so failed HTTP
     * operations remain failed MCP tool calls.
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
     * Returns the backend response when available.
     * Otherwise, returns a neutral fallback message.
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
