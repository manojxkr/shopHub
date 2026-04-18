package com.book.BookStore.service;

import org.springframework.stereotype.Service;

import com.book.BookStore.DTO.UpdateProfileRequest;
import com.book.BookStore.DTO.UserProfileDTO;
import com.book.BookStore.Repo.UserRepo;
import com.book.BookStore.entity.User;

@Service
public class UserService {

    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public UserProfileDTO getProfile(String email) {
        User u = userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserProfileDTO(u.getId(), u.getName(), u.getEmail(), "ROLE_" + u.getRole().name());
    }

    public UserProfileDTO updateProfile(String email, UpdateProfileRequest req) {
        if (req == null || req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        User u = userRepo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setName(req.getName().trim());
        userRepo.save(u);
        return getProfile(email);
    }
}
