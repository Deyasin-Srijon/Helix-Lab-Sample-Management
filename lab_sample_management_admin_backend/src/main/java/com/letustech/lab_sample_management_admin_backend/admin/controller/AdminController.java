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
