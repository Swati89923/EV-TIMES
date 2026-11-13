package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.AuthResponse;
import com.swati.evtimebackend.dto.GoogleLoginRequest;
import com.swati.evtimebackend.dto.LoginRequest;
import com.swati.evtimebackend.dto.SignupRequest;
import com.swati.evtimebackend.security.GoogleTokenVerifier;
import com.swati.evtimebackend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final GoogleTokenVerifier googleVerifier;

    public AuthController(AuthService authService, GoogleTokenVerifier googleVerifier) {
        this.authService = authService;
        this.googleVerifier = googleVerifier;
    }

    @Operation(summary = "Public sign-in settings (Google client id, if enabled)")
    @GetMapping("/config")
    public Map<String, String> config() {
        Map<String, String> map = new HashMap<>();
        map.put("googleClientId", googleVerifier.isConfigured() ? googleVerifier.clientId() : null);
        return map;
    }

    @Operation(summary = "Create an account and receive a JWT")
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @Operation(summary = "Log in and receive a JWT")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Sign in (or sign up) with a Google ID token")
    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.googleLogin(googleVerifier.verify(request.credential()));
    }
}
