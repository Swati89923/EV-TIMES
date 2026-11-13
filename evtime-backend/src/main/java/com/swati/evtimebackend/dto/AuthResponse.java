package com.swati.evtimebackend.dto;

import com.swati.evtimebackend.entity.Role;

public record AuthResponse(String token, String name, String email, Role role, String picture) {
}
