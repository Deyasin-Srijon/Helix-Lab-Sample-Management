
package com.letustech.lab_sample_management_mcp_server.client;

import com.letustech.lab_sample_management_mcp_server.config.BackendConfig;
import com.letustech.lab_sample_management_mcp_server.exception.BackendApiException;

import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

/**
 * Shared HTTP client for communicating with the existing
 * User Backend and Admin Backend.
 *
 * Responsibilities:
 * 1. Send REST requests to the correct backend.
 * 2. Forward the correct backend session cookie.
 * 3. Apply configured connection/read timeouts.
 * 4. Preserve backend HTTP errors.
 * 5. Convert network failures into meaningful exceptions.
 *
 * IMPORTANT:
 * This class does not access MySQL.
 * It communicates exclusively with the existing REST APIs.
 */
@Component
public class BackendApiClient {

    private final RestClient restClient;
    private final BackendConfig backendConfig;

    /**
     * Constructor injection.
     *
     * BackendConfig contains backend URLs and timeout settings.
     */
    public BackendApiClient(BackendConfig backendConfig) {

        this.backendConfig = backendConfig;

        // Create an HTTP request factory so we can configure timeouts.
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        // Prevent requests from hanging indefinitely while connecting.
        requestFactory.setConnectTimeout(
                Duration.ofSeconds(
                        backendConfig.getConnectTimeoutSeconds()
                )
        );

        // Prevent requests from hanging indefinitely while waiting
        // for a backend response.
        requestFactory.setReadTimeout(
                Duration.ofSeconds(
                        backendConfig.getReadTimeoutSeconds()
                )
        );

        // Build a reusable HTTP client with the configured timeouts.
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    // =========================================================
    // USER BACKEND METHODS
    // =========================================================

    public String userGet(String path, String sessionId) {

        return executeGet(
                backendConfig.getUserBackendUrl(),
                path,
                "JSESSIONID",
                sessionId
        );
    }

    public String userPost(
            String path,
            Object requestBody,
            String sessionId
    ) {

        return executePost(
                backendConfig.getUserBackendUrl(),
                path,
                requestBody,
                "JSESSIONID",
                sessionId
        );
    }

    public String userPut(
            String path,
            Object requestBody,
            String sessionId
    ) {

        return executePut(
                backendConfig.getUserBackendUrl(),
                path,
                requestBody,
                "JSESSIONID",
                sessionId
        );
    }

    public String userDelete(String path, String sessionId) {

        return executeDelete(
                backendConfig.getUserBackendUrl(),
                path,
                "JSESSIONID",
                sessionId
        );
    }

    // =========================================================
    // ADMIN BACKEND METHODS
    // =========================================================

    public String adminGet(String path, String sessionId) {

        return executeGet(
                backendConfig.getAdminBackendUrl(),
                path,
                "ADMINSESSIONID",
                sessionId
        );
    }

    public String adminPut(
            String path,
            Object requestBody,
            String sessionId
    ) {

        return executePut(
                backendConfig.getAdminBackendUrl(),
                path,
                requestBody,
                "ADMINSESSIONID",
                sessionId
        );
    }

    public String adminDelete(String path, String sessionId) {

        return executeDelete(
                backendConfig.getAdminBackendUrl(),
                path,
                "ADMINSESSIONID",
                sessionId
        );
    }

    // =========================================================
    // HTTP GET
    // =========================================================

    private String executeGet(
            String baseUrl,
            String path,
            String cookieName,
            String sessionId
    ) {

        URI uri = buildUri(baseUrl, path);

        validateSessionId(sessionId);

        try {

            return restClient.get()
                    .uri(uri)
                    .header(
                            "Cookie",
                            cookieName + "=" + sessionId
                    )
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException exception) {

            // The backend returned an HTTP error such as 401, 404 or 400.
            throw convertBackendException(exception);

        } catch (RestClientException exception) {

            // The request failed before a valid HTTP response arrived.
            throw new BackendApiException(
                    503,
                    "Unable to communicate with the backend service."
            );
        }
    }

    // =========================================================
    // HTTP POST
    // =========================================================

    private String executePost(
            String baseUrl,
            String path,
            Object requestBody,
            String cookieName,
            String sessionId
    ) {

        URI uri = buildUri(baseUrl, path);

        validateSessionId(sessionId);

        try {

            return restClient.post()
                    .uri(uri)
                    .header(
                            "Cookie",
                            cookieName + "=" + sessionId
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException exception) {

            throw convertBackendException(exception);

        } catch (RestClientException exception) {

            throw new BackendApiException(
                    503,
                    "Unable to communicate with the backend service."
            );
        }
    }

    // =========================================================
    // HTTP PUT
    // =========================================================

    private String executePut(
            String baseUrl,
            String path,
            Object requestBody,
            String cookieName,
            String sessionId
    ) {

        URI uri = buildUri(baseUrl, path);

        validateSessionId(sessionId);

        try {

            return restClient.put()
                    .uri(uri)
                    .header(
                            "Cookie",
                            cookieName + "=" + sessionId
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException exception) {

            throw convertBackendException(exception);

        } catch (RestClientException exception) {

            throw new BackendApiException(
                    503,
                    "Unable to communicate with the backend service."
            );
        }
    }

    // =========================================================
    // HTTP DELETE
    // =========================================================

    private String executeDelete(
            String baseUrl,
            String path,
            String cookieName,
            String sessionId
    ) {

        URI uri = buildUri(baseUrl, path);

        validateSessionId(sessionId);

        try {

            return restClient.delete()
                    .uri(uri)
                    .header(
                            "Cookie",
                            cookieName + "=" + sessionId
                    )
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException exception) {

            throw convertBackendException(exception);

        } catch (RestClientException exception) {

            throw new BackendApiException(
                    503,
                    "Unable to communicate with the backend service."
            );
        }
    }

    // =========================================================
    // URI BUILDING
    // =========================================================

    /**
     * Builds a URI from a backend base URL and an API path.
     *
     * Encoding is important for path values such as:
     *
     * /api/admin/samples/status/In Progress
     *
     * The space must be safely encoded when sent over HTTP.
     */
    private URI buildUri(String baseUrl, String path) {

        return UriComponentsBuilder
                .fromUriString(baseUrl)
                .path(path)
                .build()
                .encode()
                .toUri();
    }

    // =========================================================
    // SESSION VALIDATION
    // =========================================================

    /**
     * Reject missing or suspicious cookie values.
     *
     * Session IDs must never contain CR/LF characters or semicolons,
     * which could alter the HTTP header structure.
     */
    private void validateSessionId(String sessionId) {

        if (sessionId == null || sessionId.isBlank()) {

            throw new BackendApiException(
                    401,
                    "A valid authenticated session is required."
            );
        }

        if (
                sessionId.contains("\r")
                        || sessionId.contains("\n")
                        || sessionId.contains(";")
        ) {

            throw new BackendApiException(
                    400,
                    "Invalid session identifier."
            );
        }
    }

    // =========================================================
    // BACKEND ERROR CONVERSION
    // =========================================================

    /**
     * Converts an HTTP error response from the backend into
     * BackendApiException.
     *
     * The original status code and response body are retained
     * so the chatbot can explain the actual backend failure.
     */
    private BackendApiException convertBackendException(
            RestClientResponseException exception
    ) {

        String responseBody =
                exception.getResponseBodyAsString();

        if (responseBody == null || responseBody.isBlank()) {

            responseBody = exception.getStatusText();
        }

        return new BackendApiException(
                exception.getStatusCode().value(),
                responseBody
        );
    }
}
