package com.letustech.lab_sample_management_backend.user.exception;

public class SampleIdAlreadyExistsException
        extends RuntimeException {

    public SampleIdAlreadyExistsException(String message) {
        super(message);
    }

}