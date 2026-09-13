package com.letustech.lab_sample_management_backend.user.exception;

public class SampleNotFoundException
        extends RuntimeException {

    public SampleNotFoundException(String message) {
        super(message);
    }

}