package com.swati.evtimebackend.security;

import com.swati.evtimebackend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Verifies a Google "Sign in with Google" ID token: signature (Google's public keys),
 * issuer, audience (our client id), expiry and that the email is verified.
 */
@Component
public class GoogleTokenVerifier {

    private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ISSUERS = Set.of("https://accounts.google.com", "accounts.google.com");

    private final String clientId;
    private volatile NimbusJwtDecoder decoder;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId.trim();
    }

    public boolean isConfigured() {
        return !clientId.isEmpty();
    }

    public String clientId() {
        return clientId;
    }

    public GoogleIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }
        Jwt jwt;
        try {
            jwt = decoder().decode(idToken);
        } catch (JwtException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google sign-in failed. Please try again.");
        }
        if (!Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))
                || jwt.getClaimAsString("email") == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Your Google email address is not verified.");
        }
        return new GoogleIdentity(
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("name"),
                jwt.getClaimAsString("picture"));
    }

    private NimbusJwtDecoder decoder() {
        NimbusJwtDecoder d = decoder;
        if (d == null) {
            synchronized (this) {
                if (decoder == null) {
                    NimbusJwtDecoder built = NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build();
                    OAuth2TokenValidator<Jwt> issuer = jwt -> ISSUERS.contains(jwt.getClaimAsString("iss"))
                            ? OAuth2TokenValidatorResult.success()
                            : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "bad issuer", null));
                    OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience() != null
                            && jwt.getAudience().contains(clientId)
                            ? OAuth2TokenValidatorResult.success()
                            : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "bad audience", null));
                    built.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                            new JwtTimestampValidator(), issuer, audience));
                    decoder = built;
                }
                d = decoder;
            }
        }
        return d;
    }
}
