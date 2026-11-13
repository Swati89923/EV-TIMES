package com.swati.evtimebackend.security;

/** Claims we trust after a Google ID token has been verified. */
public record GoogleIdentity(String email, String name, String picture) {
}
