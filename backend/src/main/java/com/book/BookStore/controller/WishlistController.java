package com.book.BookStore.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Response.Response;
import com.book.BookStore.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<List<BookResponseDTO>>> list(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(
                new Response<>(true, "Wishlist", wishlistService.listForUser(authentication.getName())));
    }

    @PostMapping("/{bookId}")
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<Void>> add(Authentication authentication, @PathVariable @NonNull Long bookId) {
        wishlistService.add(authentication.getName(), bookId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Response<>(true, "Added to wishlist", null));
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<Void>> remove(Authentication authentication, @PathVariable @NonNull Long bookId) {
        wishlistService.remove(authentication.getName(), bookId);
        return ResponseEntity.ok(new Response<>(true, "Removed from wishlist", null));
    }

    @GetMapping("/contains/{bookId}")
    @SuppressWarnings("null")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Response<Map<String, Boolean>>> contains(Authentication authentication,
            @PathVariable @NonNull Long bookId) {
        boolean inWishlist = wishlistService.contains(authentication.getName(), bookId);
        return ResponseEntity.ok(new Response<>(true, "ok", Map.of("inWishlist", inWishlist)));
    }
}
