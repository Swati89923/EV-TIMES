package com.swati.evtimebackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "Name cannot be empty")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Invalid email format")
        @Size(max = 190, message = "Email must be at most 190 characters")
        String email,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, max = 72, message = "Password must be between 6 and 72 characters")
        String password) {
}
