package com.letustech.lab_sample_management_mcp_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * This class reads the backend configuration from application.properties.
 *
 * @Component tells Spring to create and manage an object of this class.
 *
 * Instead of hardcoding backend URLs inside our tools,
 * we can inject these values wherever they are needed.
 */
@Component
public class BackendConfig {

    // URL of the existing User Backend.
    @Value("${lab.backend.user.url}")
    private String userBackendUrl;

    // URL of the existing Admin Backend.
    @Value("${lab.backend.admin.url}")
    private String adminBackendUrl;

    // Connection timeout in seconds.
    @Value("${lab.backend.connect-timeout-seconds:5}")
    private int connectTimeoutSeconds;

    // Response timeout in seconds.
    @Value("${lab.backend.read-timeout-seconds:15}")
    private int readTimeoutSeconds;


    /**
     * Returns the User Backend base URL.
     *
     * Example:
     * http://localhost:8080
     */
    public String getUserBackendUrl() {
        return userBackendUrl;
    }


    /**
     * Returns the Admin Backend base URL.
     *
     * Example:
     * http://localhost:8081
     */
    public String getAdminBackendUrl() {
        return adminBackendUrl;
    }


    /**
     * Returns the maximum time allowed to establish
     * a connection with a backend.
     */
    public int getConnectTimeoutSeconds() {
        return connectTimeoutSeconds;
    }


    /**
     * Returns the maximum time allowed for the
     * backend to respond.
     */
    public int getReadTimeoutSeconds() {
        return readTimeoutSeconds;
    }
}