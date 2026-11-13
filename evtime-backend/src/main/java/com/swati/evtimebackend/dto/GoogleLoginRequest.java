package com.swati.evtimebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GoogleLoginRequest(
        @NotBlank(message = "Google credential is required")
        @Size(max = 4096, message = "Invalid Google credential")
        String credential) {
}
