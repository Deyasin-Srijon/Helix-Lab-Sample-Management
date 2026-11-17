package com.letustech.lab_sample_management_admin_backend.admin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class AdminExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException exception
    ) {
        Map<String, String> response = new HashMap<>();
        response.put("message", exception.getMessage());

        HttpStatus status = HttpStatus.BAD_REQUEST;

        if ("Administrator is not logged in".equals(exception.getMessage())) {
            status = HttpStatus.UNAUTHORIZED;
        } else if ("Invalid username/email or password".equals(exception.getMessage())) {
            status = HttpStatus.UNAUTHORIZED;
        } else if ("Sample not found".equals(exception.getMessage())) {
            status = HttpStatus.NOT_FOUND;
        }

        return new ResponseEntity<>(response, status);
    }
}
