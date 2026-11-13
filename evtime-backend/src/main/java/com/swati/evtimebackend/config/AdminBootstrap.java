package com.swati.evtimebackend.config;

import com.swati.evtimebackend.entity.Role;
import com.swati.evtimebackend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD
 * (only if both are set and the account does not exist yet).
 */
@Component
@Order(1)
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AuthService authService;
    private final String email;
    private final String password;

    public AdminBootstrap(
            AuthService authService,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password) {
        this.authService = authService;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank()) {
            log.info("ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin bootstrap");
            return;
        }
        authService.createIfMissing("Administrator", email, password, Role.ADMIN);
        log.info("Administrator account ensured for {}", email);
    }
}
