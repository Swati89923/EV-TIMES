package com.swati.evtimebackend.config;

import com.swati.evtimebackend.chat.RateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LimitersConfig {

    @Bean
    public RateLimiter chatRateLimiter(
            @Value("${app.chat.rate-limit:20}") int max,
            @Value("${app.chat.window-seconds:600}") long window) {
        return new RateLimiter(max, window);
    }

    @Bean
    public RateLimiter authRateLimiter(
            @Value("${app.auth.rate-limit:10}") int max,
            @Value("${app.auth.window-seconds:300}") long window) {
        return new RateLimiter(max, window);
    }
}
