package com.letustech.lab_sample_management_backend.user.service;

import com.letustech.lab_sample_management_backend.user.dto.SampleRequest;
import com.letustech.lab_sample_management_backend.user.dto.SampleResponse;
import com.letustech.lab_sample_management_backend.user.dto.SampleUpdateRequest;
import com.letustech.lab_sample_management_backend.user.entity.Sample;
import com.letustech.lab_sample_management_backend.user.entity.User;
import com.letustech.lab_sample_management_backend.user.exception.SampleIdAlreadyExistsException;
import com.letustech.lab_sample_management_backend.user.exception.SampleNotFoundException;
import com.letustech.lab_sample_management_backend.user.exception.UserNotFoundException;
import com.letustech.lab_sample_management_backend.user.repository.SampleRepository;
import com.letustech.lab_sample_management_backend.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
// import java.util.stream.Collectors;

@Service
public class SampleService {

    private final SampleRepository sampleRepository;
    private final UserRepository userRepository;

    @Autowired
    public SampleService(
            SampleRepository sampleRepository,
            UserRepository userRepository
    ) {
        this.sampleRepository = sampleRepository;
        this.userRepository = userRepository;
    }


    // =========================
    // ADD SAMPLE
    // =========================
    public SampleResponse addSample(
            SampleRequest request,
            Long userId
    ) {

        if (sampleRepository.existsById(
                request.getId()
        )) {

            throw new SampleIdAlreadyExistsException(
                    "Sample ID already exists"
            );
        }

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                )
                        );

        Sample sample = new Sample(request.getId(), request.getDescription(), request.getStatus(), user);

        Sample savedSample =
                sampleRepository.save(sample);

        return convertToResponse(
                savedSample,
                "Sample added successfully"
        );
    }


    // =========================
    // VIEW ALL USER SAMPLES
    // =========================
    public List<SampleResponse> getSamples(
            Long userId
    ) {

        List<Sample> samples =
                sampleRepository.findByUserId(userId);

        /*
            samples
               ↓
            ┌───────────────┐
            │ Sample #101   │ ──→ convertToResponse() ──→ SampleResponse #101
            ├───────────────┤
            │ Sample #102   │ ──→ convertToResponse() ──→ SampleResponse #102
            ├───────────────┤
            │ Sample #103   │ ──→ convertToResponse() ──→ SampleResponse #103
            └───────────────┘
                                                  ↓
                                          collect into List
                                                  ↓
                                          List<SampleResponse>
        */

//        return samples.stream()
//                .map(sample ->
//                        convertToResponse(
//                                sample,
//                                "Sample found"
//                        )
//                )
//                .collect(Collectors.toList());

        List<SampleResponse> responses = new ArrayList<>();

        for (Sample sample : samples) {

            SampleResponse response =
                    convertToResponse(
                            sample,
                            "Sample found"
                    );

            responses.add(response);
        }

        return responses;
    }


    // =========================
    // VIEW SPECIFIC SAMPLE
    // =========================
    public SampleResponse getSampleById(
            Long sampleId,
            Long userId
    ) {

        Sample sample =
                sampleRepository
                        .findByIdAndUserId(
                                sampleId,
                                userId
                        )
                        .orElseThrow(() ->
                                new SampleNotFoundException(
                                        "Sample not found"
                                )
                        );

        return convertToResponse(
                sample,
                "Sample found"
        );
    }


    // =========================
    // UPDATE SAMPLE
    // =========================
    public SampleResponse updateSample(
            Long sampleId,
            SampleUpdateRequest request,
            Long userId
    ) {

        Sample sample =
                sampleRepository
                        .findByIdAndUserId(
                                sampleId,
                                userId
                        )
                        .orElseThrow(() ->
                                new SampleNotFoundException(
                                        "Sample not found"
                                )
                        );

        sample.setDescription(
                request.getDescription()
        );

        sample.setStatus(
                request.getStatus()
        );

        Sample updatedSample =
                sampleRepository.save(sample);

        return convertToResponse(
                updatedSample,
                "Sample updated successfully"
        );
    }


    // =========================
    // DELETE SAMPLE
    // =========================
    public String deleteSample(
            Long sampleId,
            Long userId
    ) {

        Sample sample =
                sampleRepository
                        .findByIdAndUserId(
                                sampleId,
                                userId
                        )
                        .orElseThrow(() ->
                                new SampleNotFoundException(
                                        "Sample not found"
                                )
                        );

        sampleRepository.delete(sample);

        return "Sample deleted successfully";
    }


    // =========================
    // CONVERT ENTITY TO RESPONSE
    // =========================
    private SampleResponse convertToResponse(
            Sample sample,
            String message
    ) {

        return new SampleResponse(
                sample.getId(),
                sample.getDescription(),
                sample.getStatus(),
                sample.getCreatedDate(),
                sample.getCreatedTime(),
                sample.getUser().getUsername(),
                message
        );
    }

}
