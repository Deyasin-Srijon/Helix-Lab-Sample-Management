package com.letustech.lab_sample_management_backend.user.exception;

public class PasswordValidationException extends RuntimeException {

    public PasswordValidationException(String message) {
        super(message);
    }
}