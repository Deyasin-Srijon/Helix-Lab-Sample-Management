package com.letustech.lab_sample_management_backend.user.controller;

import com.letustech.lab_sample_management_backend.user.dto.LoginRequest;
import com.letustech.lab_sample_management_backend.user.dto.LoginResponse;
import com.letustech.lab_sample_management_backend.user.dto.RegisterRequest;
import com.letustech.lab_sample_management_backend.user.exception.UserNotLoggedInException;
import com.letustech.lab_sample_management_backend.user.service.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registerUser(
            @Valid @RequestBody RegisterRequest request,
            HttpSession session
    ) {

        LoginResponse response =
                userService.registerUser(request);

        session.setAttribute(
                "userId",
                response.getUserId()
        );

        session.setAttribute(
                "username",
                response.getUsername()
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }


    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @Valid @RequestBody LoginRequest request,
            HttpSession session
    ) {

        LoginResponse response =
                userService.loginUser(request);

        session.setAttribute(
                "userId",
                response.getUserId()
        );

        session.setAttribute(
                "username",
                response.getUsername()
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }


    // CURRENT LOGGED-IN USER
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("userId");

        String username =
                (String) session.getAttribute("username");

        if (userId == null) {

            throw new UserNotLoggedInException(
                    "User is not logged in"
            );
        }

        Map<String, Object> map = new HashMap<>();
        map.put("userId", userId);
        map.put("username", username);

        return new ResponseEntity<>(
                map,
                HttpStatus.OK
        );
    }


    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("userId");

        if (userId == null) {

            throw new UserNotLoggedInException(
                    "User is not logged in"
            );
        }

        session.invalidate();

        return new ResponseEntity<>(
                "Logout successful",
                HttpStatus.OK
        );
    }

}