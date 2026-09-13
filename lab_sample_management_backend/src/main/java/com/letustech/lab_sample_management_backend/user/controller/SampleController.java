package com.letustech.lab_sample_management_backend.user.controller;

import com.letustech.lab_sample_management_backend.user.dto.SampleRequest;
import com.letustech.lab_sample_management_backend.user.dto.SampleResponse;
import com.letustech.lab_sample_management_backend.user.dto.SampleUpdateRequest;
import com.letustech.lab_sample_management_backend.user.exception.UserNotLoggedInException;
import com.letustech.lab_sample_management_backend.user.service.SampleService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/samples")
public class SampleController {

    private final SampleService sampleService;

    public SampleController(
            SampleService sampleService
    ) {
        this.sampleService = sampleService;
    }


    private Long getLoggedInUserId(
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("userId");

        if (userId == null) {

            throw new UserNotLoggedInException(
                    "User is not logged in"
            );
        }

        return userId;
    }


    // ADD SAMPLE
    @PostMapping
    public ResponseEntity<SampleResponse> addSample(
            @Valid @RequestBody SampleRequest request,
            HttpSession session
    ) {

        Long userId =
                getLoggedInUserId(session);

        SampleResponse response =
                sampleService.addSample(
                        request,
                        userId
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // VIEW ALL LOGGED-IN USER'S SAMPLES
    @GetMapping
    public ResponseEntity<List<SampleResponse>>
    getSamples(
            HttpSession session
    ) {

        Long userId =
                getLoggedInUserId(session);

        List<SampleResponse> response =
                sampleService.getSamples(userId);

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }


    // VIEW SPECIFIC SAMPLE
    @GetMapping("/{sampleId}")
    public ResponseEntity<SampleResponse>
    getSampleById(
            @PathVariable Long sampleId,
            HttpSession session
    ) {

        Long userId =
                getLoggedInUserId(session);

        SampleResponse response =
                sampleService.getSampleById(
                        sampleId,
                        userId
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }


    // UPDATE SAMPLE
    @PutMapping("/{sampleId}")
    public ResponseEntity<SampleResponse>
    updateSample(
            @PathVariable Long sampleId,
            @Valid @RequestBody SampleUpdateRequest request,
            HttpSession session
    ) {

        Long userId =
                getLoggedInUserId(session);

        SampleResponse response =
                sampleService.updateSample(
                        sampleId,
                        request,
                        userId
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }


    // DELETE SAMPLE
    @DeleteMapping("/{sampleId}")
    public ResponseEntity<String>
    deleteSample(
            @PathVariable Long sampleId,
            HttpSession session
    ) {

        Long userId =
                getLoggedInUserId(session);

        String response =
                sampleService.deleteSample(
                        sampleId,
                        userId
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

}