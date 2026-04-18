package com.book.BookStore.controller;

import jakarta.validation.Valid;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.BookStore.DTO.LoginRequest;
import com.book.BookStore.DTO.RegisterRequest;
import com.book.BookStore.Response.Response;
import com.book.BookStore.service.AuthService;

@RestController
@RequestMapping("/api")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<Response<Void>> register(@Valid @RequestBody RegisterRequest req) {
        logger.info("User registration attempt for email: {}", req.getEmail());
        service.register(req);
        logger.info("User registered successfully for email: {}", req.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new Response<>(true, "User registered successfully", null));

    }

    @PostMapping("/login")
    public ResponseEntity<Response<Map<String, String>>> login(@Valid @RequestBody LoginRequest req) {
        logger.info("Login attempt for email: {}", req.getEmail());
        String token = service.login(req);
        logger.info("Login successful for email: {}", req.getEmail());
        // System.out.println(token);
        return ResponseEntity.ok(
                new Response<>(true, "Login success", Map.of("token", token)));
    }

}
