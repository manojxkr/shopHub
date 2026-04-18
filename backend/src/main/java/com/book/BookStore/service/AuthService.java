package com.book.BookStore.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.book.BookStore.DTO.LoginRequest;
import com.book.BookStore.DTO.RegisterRequest;
import com.book.BookStore.Repo.UserRepo;

import com.book.BookStore.component.jwtUtil;
import com.book.BookStore.entity.Role;
import com.book.BookStore.entity.User;

@Service
public class AuthService {
    private final UserRepo repo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final jwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepo repo, PasswordEncoder encoder, AuthenticationManager authManager, jwtUtil jwtUtil,
            EmailService emailService) {
        this.repo = repo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;

    }

    public void register(RegisterRequest req) {
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(Role.valueOf(req.getRole().toUpperCase()));

        repo.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());
    }

    // public String login(LoginRequest req) {
    // try {
    // authManager.authenticate(
    // new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
    // } catch (UsernameNotFoundException ex) {
    // throw new RuntimeException("User not found");
    // } catch (Exception ex) {
    // throw new RuntimeException("Invalid credentials");
    // }
    // return jwtUtil.generateToken(req.getEmail());

    // }
    public String login(LoginRequest req) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (UsernameNotFoundException ex) {
            throw new RuntimeException("User not found");

        } catch (Exception ex) {
            throw new RuntimeException("Invalid Credentials");
        }
        return jwtUtil.generateToken(req.getEmail());
    }

}
