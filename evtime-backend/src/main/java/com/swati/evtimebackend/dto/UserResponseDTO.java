package com.swati.evtimebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDTO {

    private String token;
    private String email;
    private String role;
}