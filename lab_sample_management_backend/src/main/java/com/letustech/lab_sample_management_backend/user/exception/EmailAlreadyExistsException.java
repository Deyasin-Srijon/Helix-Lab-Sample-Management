package com.letustech.lab_sample_management_backend.user.exception;

public class EmailAlreadyExistsException
        extends RuntimeException {

    public EmailAlreadyExistsException(String message) {
        super(message);
    }

}
