package com.swati.evtimebackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/** JSON bodies for 401 / 403 instead of Spring's default HTML error page. */
@Component
public class RestErrorHandlers {

    private final ObjectMapper mapper;

    public RestErrorHandlers(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, ex) -> write(
                response, HttpStatus.UNAUTHORIZED,
                "Authentication required. Please log in.");
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> write(
                response, HttpStatus.FORBIDDEN,
                "You do not have permission to perform this action.");
    }

    private void write(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(),
                Map.of("status", status.value(), "message", message));
    }
}
