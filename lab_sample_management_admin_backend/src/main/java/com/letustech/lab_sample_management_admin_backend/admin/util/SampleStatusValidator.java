package com.letustech.lab_sample_management_admin_backend.admin.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Validates sample statuses in the Admin Backend.
 *
 * Both the User Backend and Admin Backend must use
 * the same three allowed status values.
 *
 * This prevents administrators from accidentally
 * saving an unsupported sample status.
 */
public class SampleStatusValidator {

    /**
     * Validates the status and returns its standard format.
     */
    public static String normalize(String status) {

        // Reject missing status values.
        if (status == null || status.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sample status is required"
            );
        }

        // Remove leading/trailing spaces.
        String value = status.trim();

        // Accept different letter cases but return
        // the exact format used by the existing application.
        if (value.equalsIgnoreCase("Created")) {
            return "Created";
        }

        if (value.equalsIgnoreCase("In Progress")) {
            return "In Progress";
        }

        if (value.equalsIgnoreCase("Completed")) {
            return "Completed";
        }

        // Reject all other status values.
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid sample status. Allowed values: Created, In Progress, Completed"
        );
    }
}
