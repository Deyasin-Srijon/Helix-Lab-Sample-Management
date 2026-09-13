package com.letustech.lab_sample_management_backend.user.util;

import com.letustech.lab_sample_management_backend.user.exception.PasswordValidationException;

public class PasswordValidator {

    public static void validatePassword(String password) {

        // Check minimum length
        if (password == null || password.length() < 8) {
            throw new PasswordValidationException(
                    "Password must contain at least 8 characters"
            );
        }

        boolean hasUppercase = false;
        boolean hasLowercase = false;
        boolean hasNumber = false;
        boolean hasSpecialCharacter = false;

        // Check every character in the password
        for (int i = 0; i < password.length(); i++) {

            char character = password.charAt(i);

            if (character >= 'A' && character <= 'Z') {
                hasUppercase = true;
            }

            else if (character >= 'a' && character <= 'z') {
                hasLowercase = true;
            }

            else if (character >= '0' && character <= '9') {
                hasNumber = true;
            }

            else if ("!@#$%^&*_".indexOf(character) != -1) {
                hasSpecialCharacter = true;
            }
        }

        // Check uppercase letter
        if (!hasUppercase) {
            throw new PasswordValidationException(
                    "Password must contain at least one uppercase letter"
            );
        }

        // Check lowercase letter
        if (!hasLowercase) {
            throw new PasswordValidationException(
                    "Password must contain at least one lowercase letter"
            );
        }

        // Check number
        if (!hasNumber) {
            throw new PasswordValidationException(
                    "Password must contain at least one number"
            );
        }

        // Check special character
        if (!hasSpecialCharacter) {
            throw new PasswordValidationException(
                    "Password must contain at least one special character"
            );
        }
    }
}