package com.letustech.lab_sample_management_backend.user.service;

import com.letustech.lab_sample_management_backend.user.dto.LoginRequest;
import com.letustech.lab_sample_management_backend.user.dto.LoginResponse;
import com.letustech.lab_sample_management_backend.user.dto.RegisterRequest;
import com.letustech.lab_sample_management_backend.user.entity.User;
import com.letustech.lab_sample_management_backend.user.exception.EmailAlreadyExistsException;
import com.letustech.lab_sample_management_backend.user.exception.InvalidCredentialsException;
import com.letustech.lab_sample_management_backend.user.repository.UserRepository;
import com.letustech.lab_sample_management_backend.user.util.PasswordValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER USER
    // =========================
    public LoginResponse registerUser(
            RegisterRequest request
    ) {

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new EmailAlreadyExistsException(
                    "Email already exists"
            );
        }

        PasswordValidator.validatePassword(
                request.getPassword()
        );

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone()
        );

        User savedUser =
                userRepository.save(user);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                "Registration successful"
        );
    }


    // =========================
    // LOGIN USER
    // =========================
    public LoginResponse loginUser(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or password"
                                )
                        );

        if (!user.getPassword().equals(
                request.getPassword()
        )) {

            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                "Login successful"
        );
    }

}
