package com.letustech.lab_sample_management_backend.user.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================
    // PASSWORD VALIDATION ERROR
    // =========================
    @ExceptionHandler(PasswordValidationException.class)
    public ResponseEntity<Map<String, String>>
    handlePasswordValidationException(PasswordValidationException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST
        );
    }


    // =========================
    // VALIDATION ERROR
    // =========================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>>
    handleValidationException(MethodArgumentNotValidException exception) {

        Map<String, String> response = new HashMap<>();

        // Get validation results → extract each field error → get the field name and error message
        // → store them as field:error pairs in the response map.
        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        response.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }


    // =========================
    // EMAIL ALREADY EXISTS
    // =========================
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>>
    handleEmailAlreadyExistsException(EmailAlreadyExistsException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT
        );
    }


    // =========================
    // INVALID LOGIN CREDENTIALS
    // =========================
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>>
    handleInvalidCredentialsException(InvalidCredentialsException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.UNAUTHORIZED
        );
    }


    // =========================
    // USER NOT LOGGED IN
    // =========================
    @ExceptionHandler(UserNotLoggedInException.class)
    public ResponseEntity<Map<String, String>>
    handleUserNotLoggedInException(UserNotLoggedInException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.UNAUTHORIZED
        );
    }


    // =========================
    // USER NOT FOUND
    // =========================
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    handleUserNotFoundException(UserNotFoundException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }


    // =========================
    // SAMPLE NOT FOUND
    // =========================
    @ExceptionHandler(SampleNotFoundException.class)
    public ResponseEntity<Map<String, String>>
    handleSampleNotFoundException(SampleNotFoundException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND
        );
    }


    // =========================
    // DUPLICATE SAMPLE ID
    // =========================
    @ExceptionHandler(SampleIdAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>>
    handleSampleIdAlreadyExistsException(SampleIdAlreadyExistsException exception) {

        return createResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT
        );
    }


    // =========================
    // DATABASE CONSTRAINT ERROR
    // =========================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>>
    handleDataIntegrityViolationException(DataIntegrityViolationException exception) {

        return createResponse(
                "Database constraint violation",
                HttpStatus.CONFLICT
        );
    }


    // =========================
    // DATABASE OPERATION ERROR
    // =========================
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>>
    handleDataAccessException(DataAccessException exception) {

        return createResponse(
                "Database operation failed",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }


    private ResponseEntity<Map<String, String>>
    createResponse(
            String message,
            HttpStatus status) {

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "message",
                message
        );

        return new ResponseEntity<>(
                response,
                status
        );
    }

}