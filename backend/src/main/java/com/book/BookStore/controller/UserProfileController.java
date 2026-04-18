package com.book.BookStore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.BookStore.DTO.UpdateProfileRequest;
import com.book.BookStore.DTO.UserProfileDTO;
import com.book.BookStore.Response.Response;
import com.book.BookStore.service.UserService;

@RestController
@RequestMapping("/api")
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Response<UserProfileDTO>> me(Authentication authentication) {
        UserProfileDTO profile = userService.getProfile(authentication.getName());
        return ResponseEntity.ok(new Response<>(true, "Profile", profile));
    }

    @PatchMapping("/me")
    public ResponseEntity<Response<UserProfileDTO>> updateMe(Authentication authentication,
            @RequestBody UpdateProfileRequest body) {
        UserProfileDTO updated = userService.updateProfile(authentication.getName(), body);
        return ResponseEntity.ok(new Response<>(true, "Profile updated", updated));
    }
}
