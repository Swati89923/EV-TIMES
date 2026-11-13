package com.swati.evtimebackend.exception;

import org.springframework.http.HttpStatus;

/** Business error carrying the HTTP status it should be reported with. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
