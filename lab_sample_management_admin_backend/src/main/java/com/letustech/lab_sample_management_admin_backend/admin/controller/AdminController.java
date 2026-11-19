package com.letustech.lab_sample_management_admin_backend.admin.controller;

import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginRequest;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminLoginResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.AdminSampleResponse;
import com.letustech.lab_sample_management_admin_backend.admin.dto.SampleUpdateRequest;
import com.letustech.lab_sample_management_admin_backend.admin.service.AdminService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ADMIN LOGIN
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpSession session
    ) {
        AdminLoginResponse response = adminService.login(request);

        session.setAttribute("adminId", response.getAdminId());
        session.setAttribute("adminUsername", response.getUsername());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // CHECK CURRENT ADMIN SESSION
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentAdmin(HttpSession session) {

        checkAdminSession(session);

        Map<String, Object> response = new HashMap<>();
        response.put("adminId", session.getAttribute("adminId"));
        response.put("username", session.getAttribute("adminUsername"));

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ADMIN LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {

        checkAdminSession(session);
        session.invalidate();

        return new ResponseEntity<>("Admin logout successful", HttpStatus.OK);
    }

    // GET ALL SAMPLES
    @GetMapping("/samples")
    public ResponseEntity<List<AdminSampleResponse>> getAllSamples(
            HttpSession session
    ) {
        checkAdminSession(session);

        return new ResponseEntity<>(
                adminService.getAllSamples(),
                HttpStatus.OK
        );
    }

    /**
     * FILTER SAMPLES BY STATUS
     *
     * Endpoint:
     * GET /api/admin/samples/status/{status}
     *
     * Example:
     * GET /api/admin/samples/status/Completed
     *
     * Only authenticated administrators can use this endpoint.
     */
    @GetMapping("/samples/status/{status}")
    public ResponseEntity<List<AdminSampleResponse>> getSamplesByStatus(

            // Read the status from the URL.
            @PathVariable String status,

            // Spring provides the current HTTP session.
            HttpSession session

    ) {

        // Check whether an administrator is logged in.
        checkAdminSession(session);

        // Ask AdminService to retrieve matching records.
        List<AdminSampleResponse> response =
                adminService.getSamplesByStatus(status);

        // Return the matching samples with HTTP 200.
        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

    /**
     * FILTER SAMPLES BY USER ID
     *
     * Endpoint:
     * GET /api/admin/samples/user/{userId}
     *
     * Example:
     * GET /api/admin/samples/user/5
     *
     * This allows an administrator to see all samples
     * created by a particular user.
     */
    @GetMapping("/samples/user/{userId}")
    public ResponseEntity<List<AdminSampleResponse>> getSamplesByUser(

            // Read the user ID from the URL.
            @PathVariable Long userId,

            // Spring provides the current HTTP session.
            HttpSession session

    ) {

        // Check whether an administrator is logged in.
        checkAdminSession(session);

        // Retrieve all samples associated with this user.
        List<AdminSampleResponse> response =
                adminService.getSamplesByUser(userId);

        // Return the matching records.
        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

    // GET ONE SAMPLE
    @GetMapping("/samples/{sampleId}")
    public ResponseEntity<AdminSampleResponse> getSampleById(
            @PathVariable Long sampleId,
            HttpSession session
    ) {
        checkAdminSession(session);

        return new ResponseEntity<>(
                adminService.getSampleById(sampleId),
                HttpStatus.OK
        );
    }

    // UPDATE SAMPLE
    @PutMapping("/samples/{sampleId}")
    public ResponseEntity<AdminSampleResponse> updateSample(
            @PathVariable Long sampleId,
            @Valid @RequestBody SampleUpdateRequest request,
            HttpSession session
    ) {
        checkAdminSession(session);

        return new ResponseEntity<>(
                adminService.updateSample(sampleId, request),
                HttpStatus.OK
        );
    }

    // DELETE SAMPLE
    @DeleteMapping("/samples/{sampleId}")
    public ResponseEntity<String> deleteSample(
            @PathVariable Long sampleId,
            HttpSession session
    ) {
        checkAdminSession(session);

        return new ResponseEntity<>(
                adminService.deleteSample(sampleId),
                HttpStatus.OK
        );
    }

    // CHECK ADMIN SESSION
    private void checkAdminSession(HttpSession session) {

        Long adminId = (Long) session.getAttribute("adminId");

        if (adminId == null) {
            throw new RuntimeException("Administrator is not logged in");
        }
    }
}
