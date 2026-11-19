package com.letustech.lab_sample_management_admin_backend.admin.service;

import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginRequest;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminSampleResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.SampleUpdateRequest;
import com.letustech.lab_sample_management_admin_backend.user.entity.Sample;
import com.letustech.lab_sample_management_admin_backend.user.repository.SampleRepository;
import com.letustech.lab_sample_management_admin_backend.admin.util.SampleStatusValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    // DEMO ONLY: Change these two values to your preferred admin credentials.
    // This deliberately follows the requested plain-text, hardcoded approach.
    // Do not use this authentication design for a public/production deployment.
    private static final String ADMIN_USERNAME = "Admin";
    private static final String ADMIN_PASSWORD = "Admin@2504";

    private final SampleRepository sampleRepository;

    public AdminService(SampleRepository sampleRepository) {
        this.sampleRepository = sampleRepository;
    }

    // ADMIN LOGIN
    public AdminLoginResponse login(AdminLoginRequest request) {

        String enteredUsername = request.getEmail().trim();
        String enteredPassword = request.getPassword();

        if (
                ADMIN_USERNAME.equalsIgnoreCase(enteredUsername)
                        && ADMIN_PASSWORD.equals(enteredPassword)
        ) {
            return new AdminLoginResponse(
                    1L,
                    ADMIN_USERNAME,
                    "Admin login successful"
            );
        }

        throw new RuntimeException("Invalid username/email or password");
    }

    // GET ALL SAMPLES FROM ALL USERS
    @Transactional(readOnly = true)
    public List<AdminSampleResponse> getAllSamples() {

        List<Sample> samples = sampleRepository.findAll();
        List<AdminSampleResponse> responses = new ArrayList<>();

        for (Sample sample : samples) {
            responses.add(convertToResponse(sample, "Sample found"));
        }

        return responses;
    }

    // GET ONE SAMPLE
    @Transactional(readOnly = true)
    public AdminSampleResponse getSampleById(Long sampleId) {

        Optional<Sample> optionalSample = sampleRepository.findById(sampleId);

        if (optionalSample.isEmpty()) {
            throw new RuntimeException("Sample not found");
        }

        return convertToResponse(optionalSample.get(), "Sample found");
    }

    // UPDATE SAMPLE DESCRIPTION AND STATUS

    /**
     * Updates an existing sample.
     *
     * Administrators can update samples belonging to any user.
     *
     * However, only two fields can be modified:
     * 1. Description
     * 2. Status
     */
    @Transactional
    public AdminSampleResponse updateSample(
            Long sampleId,
            SampleUpdateRequest request
    ) {

        // Search for the sample using its ID.
        // Unlike the user service, there is no user ownership filter.
        Optional<Sample> optionalSample =
                sampleRepository.findById(sampleId);

        // If the sample does not exist, return an error.
        if (optionalSample.isEmpty()) {

            throw new RuntimeException("Sample not found");
        }

        // Retrieve the existing database record.
        Sample sample = optionalSample.get();

        // Validate the new status.
        // Invalid status values will be rejected.
        String validStatus =
                SampleStatusValidator.normalize(request.getStatus());

        // Update only the permitted fields.
        sample.setDescription(request.getDescription());
        sample.setStatus(validStatus);

        // Save the updated sample in MySQL.
        Sample updatedSample =
                sampleRepository.save(sample);

        // Convert the saved entity into an API response.
        return convertToResponse(
                updatedSample,
                "Sample updated successfully"
        );
    }

    // DELETE SAMPLE
    @Transactional
    public String deleteSample(Long sampleId) {

        Optional<Sample> optionalSample = sampleRepository.findById(sampleId);

        if (optionalSample.isEmpty()) {
            throw new RuntimeException("Sample not found");
        }

        sampleRepository.delete(optionalSample.get());

        return "Sample deleted successfully";
    }

    /**
     * Retrieves samples matching a particular status.
     *
     * Only administrators can access this operation.
     * The AdminController checks the admin session before
     * calling this service method.
     */
    @Transactional(readOnly = true)
    public List<AdminSampleResponse> getSamplesByStatus(
            String status
    ) {

        // Validate and normalize the supplied status.
        String validStatus =
                SampleStatusValidator.normalize(status);

        // Retrieve all samples having the requested status.
        List<Sample> samples =
                sampleRepository.findByStatusIgnoreCase(validStatus);

        // Create a list to hold the API response objects.
        List<AdminSampleResponse> responses =
                new ArrayList<>();

        // Convert each database entity into a response object.
        for (Sample sample : samples) {

            responses.add(
                    convertToResponse(sample, "Sample found")
            );
        }

        return responses;
    }

    /**
     * Retrieves all samples created by a particular user.
     *
     * This operation is intended for administrators.
     *
     * Example:
     * If userId = 5, return all samples belonging to user 5.
     */
    @Transactional(readOnly = true)
    public List<AdminSampleResponse> getSamplesByUser(
            Long userId
    ) {

        // Check that the supplied user ID is valid.
        if (userId == null || userId <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid user ID is required"
            );
        }

        // Retrieve samples associated with the specified user.
        List<Sample> samples =
                sampleRepository.findByUser_Id(userId);

        // Prepare the response list.
        List<AdminSampleResponse> responses =
                new ArrayList<>();

        // Convert every sample into an API response.
        for (Sample sample : samples) {

            responses.add(
                    convertToResponse(sample, "Sample found")
            );
        }

        return responses;
    }


    // CONVERT ENTITY TO RESPONSE
    private AdminSampleResponse convertToResponse(
            Sample sample,
            String message
    ) {
        String createdBy = "Unknown";

        if (sample.getUser() != null) {
            createdBy = sample.getUser().getUsername();
        }

        return new AdminSampleResponse(
                sample.getId(),
                sample.getDescription(),
                sample.getStatus(),
                sample.getCreatedDate(),
                sample.getCreatedTime(),
                createdBy,
                message
        );
    }
}
