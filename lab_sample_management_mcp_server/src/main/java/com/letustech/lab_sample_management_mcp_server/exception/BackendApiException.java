package com.letustech.lab_sample_management_mcp_server.exception;

/**
 * A custom exception used when communication with an
 * existing Spring Boot backend fails.
 *
 * For example:
 *
 * - The backend returns HTTP 404.
 * - The backend returns HTTP 401.
 * - The backend returns HTTP 400.
 * - The backend is unavailable.
 *
 * Instead of losing the original error, we keep it
 * so the MCP tool can return a meaningful message.
 */
public class BackendApiException extends RuntimeException {

    // Stores the HTTP status code returned by the backend.
    private final int statusCode;


    /**
     * Creates a new backend exception.
     *
     * @param statusCode HTTP status code
     * @param message    error message returned by backend
     */
    public BackendApiException(
            int statusCode,
            String message
    ) {

        // Pass the error message to the parent RuntimeException.
        super(message);

        // Save the HTTP status code for later use.
        this.statusCode = statusCode;
    }


    /**
     * Returns the HTTP status code associated
     * with the backend error.
     */
    public int getStatusCode() {
        return statusCode;
    }
}