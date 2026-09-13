package com.letustech.lab_sample_management_backend.user.exception;

public class UserNotLoggedInException
        extends RuntimeException {

    public UserNotLoggedInException(String message) {
        super(message);
    }

}