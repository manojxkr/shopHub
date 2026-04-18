package com.book.BookStore.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

    @Bean
    public ConcurrentHashMap<String, Bucket> rateLimitCache() {
        return new ConcurrentHashMap<>();
    }

    @Bean
    public Bandwidth defaultBandwidth() {
        // 10 requests per minute per IP
        return Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
    }
}