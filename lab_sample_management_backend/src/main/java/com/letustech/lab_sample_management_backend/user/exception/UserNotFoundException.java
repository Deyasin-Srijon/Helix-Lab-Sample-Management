package com.letustech.lab_sample_management_backend.user.exception;

public class UserNotFoundException
        extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }

}