package com.letustech.lab_sample_management_admin_backend.admin.service;

import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginRequest;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminSampleResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.SampleUpdateRequest;
import com.letustech.lab_sample_management_admin_backend.user.entity.Sample;
import com.letustech.lab_sample_management_admin_backend.user.repository.SampleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public AdminSampleResponse updateSample(
            Long sampleId,
            SampleUpdateRequest request
    ) {
        Optional<Sample> optionalSample = sampleRepository.findById(sampleId);

        if (optionalSample.isEmpty()) {
            throw new RuntimeException("Sample not found");
        }

        Sample sample = optionalSample.get();
        sample.setDescription(request.getDescription());
        sample.setStatus(request.getStatus());

        Sample updatedSample = sampleRepository.save(sample);

        return convertToResponse(updatedSample, "Sample updated successfully");
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
