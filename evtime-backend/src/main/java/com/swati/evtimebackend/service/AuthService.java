package com.swati.evtimebackend.service;

import com.swati.evtimebackend.dto.AuthResponse;
import com.swati.evtimebackend.dto.LoginRequest;
import com.swati.evtimebackend.dto.SignupRequest;
import com.swati.evtimebackend.entity.AuthProvider;
import com.swati.evtimebackend.entity.Role;
import com.swati.evtimebackend.security.GoogleIdentity;
import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.exception.ApiException;
import com.swati.evtimebackend.repository.UserRepository;
import com.swati.evtimebackend.security.JwtUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = normalize(request.email());

        if (userRepository.existsByEmail(email)) {
            throw emailTaken();
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // two signups raced past the existence check
            throw emailTaken();
        }
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return toResponse(user);
    }

    /** Signs in with a verified Google identity, creating or linking the account as needed. */
    public AuthResponse googleLogin(GoogleIdentity identity) {
        String email = normalize(identity.email());
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(identity.name() == null || identity.name().isBlank()
                    ? email.substring(0, email.indexOf('@')) : identity.name().trim());
            // Google users never type a password; store an unusable random one
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole(Role.USER);
            user.setProvider(AuthProvider.GOOGLE);
        }
        if (user.getPictureUrl() == null && identity.picture() != null
                && identity.picture().startsWith("https://")) {
            user.setPictureUrl(identity.picture());
        }
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            user = userRepository.findByEmail(email).orElseThrow(() -> e);
        }
        return toResponse(user);
    }

    /** Creates an account with a specific role unless the email already exists. */
    public void createIfMissing(String name, String email, String rawPassword, Role role) {
        String normalized = normalize(email);
        if (userRepository.existsByEmail(normalized)) {
            return;
        }
        User user = new User();
        user.setName(name);
        user.setEmail(normalized);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
    }

    private AuthResponse toResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole(), user.getPictureUrl());
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static ApiException emailTaken() {
        return new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
    }
}
