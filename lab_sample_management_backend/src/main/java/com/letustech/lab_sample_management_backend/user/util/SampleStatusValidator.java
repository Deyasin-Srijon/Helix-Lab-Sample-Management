
package com.letustech.lab_sample_management_backend.user.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * This class validates sample statuses.
 *
 * Why do we need this?
 *
 * The application should accept only three sample statuses:
 * 1. Created
 * 2. In Progress
 * 3. Completed
 *
 * Users can enter these values in different letter cases.
 * For example, "created", "CREATED", and "Created".
 *
 * This class converts valid input into the exact format
 * already used by your existing React frontend and database.
 */
public class SampleStatusValidator {

    /**
     * Checks the supplied status and returns its standard value.
     *
     * Example:
     * Input:  "created"
     * Output: "Created"
     *
     * Input:  "IN PROGRESS"
     * Output: "In Progress"
     *
     * If the status is invalid, the method returns an HTTP 400 error.
     */
    public static String normalize(String status) {

        // Reject null or empty status values.
        if (status == null || status.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Sample status is required"
            );
        }

        // Remove unnecessary spaces and ignore letter case.
        String value = status.trim();

        // Convert valid input into the existing application format.
        if (value.equalsIgnoreCase("Created")) {
            return "Created";
        }

        if (value.equalsIgnoreCase("In Progress")) {
            return "In Progress";
        }

        if (value.equalsIgnoreCase("Completed")) {
            return "Completed";
        }

        // Any other value is not allowed.
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid sample status. Allowed values: Created, In Progress, Completed"
        );
    }
}
