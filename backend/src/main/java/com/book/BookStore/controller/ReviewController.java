package com.book.BookStore.controller;

import com.book.BookStore.Response.Response;
import com.book.BookStore.entity.Review;
import com.book.BookStore.entity.User;
import com.book.BookStore.service.CustomUserDetailsService;
import com.book.BookStore.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewService reviewService;
    private final CustomUserDetailsService userDetailsService;

    public ReviewController(ReviewService reviewService, CustomUserDetailsService userDetailsService) {
        this.reviewService = reviewService;
        this.userDetailsService = userDetailsService;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userDetailsService.getUserByEmail(authentication.getName());
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<Response<List<Review>>> getReviewsForBook(@PathVariable @NonNull Long bookId) {
        logger.info("Fetching reviews for book: {}", bookId);
        List<Review> reviews = reviewService.getReviewsForBook(bookId);
        return ResponseEntity.ok(new Response<>(true, "Reviews retrieved successfully", reviews));
    }

    @GetMapping("/book/{bookId}/stats")
    public ResponseEntity<Response<Map<String, Object>>> getBookReviewStats(@PathVariable @NonNull Long bookId) {
        logger.info("Fetching review stats for book: {}", bookId);
        Double averageRating = reviewService.getAverageRatingForBook(bookId);
        Long reviewCount = reviewService.getReviewCountForBook(bookId);

        Map<String, Object> stats = Map.of(
                "averageRating", averageRating != null ? averageRating : 0.0,
                "reviewCount", reviewCount);

        return ResponseEntity.ok(new Response<>(true, "Review stats retrieved successfully", stats));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<Response<List<Review>>> getMyReviews(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Fetching reviews for user: {}", user.getEmail());
        List<Review> reviews = reviewService.getReviewsByUser(user);
        return ResponseEntity.ok(new Response<>(true, "User reviews retrieved successfully", reviews));
    }

    @PostMapping("/book/{bookId}")
    public ResponseEntity<Response<Review>> addReview(
            Authentication authentication,
            @PathVariable @NonNull Long bookId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Adding review for book {} by user: {}", bookId, user.getEmail());
        Review review = reviewService.addReview(user, bookId, rating, comment);
        return ResponseEntity.ok(new Response<>(true, "Review added successfully", review));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Response<Review>> updateReview(
            Authentication authentication,
            @PathVariable @NonNull Long reviewId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Updating review {} by user: {}", reviewId, user.getEmail());
        Review review = reviewService.updateReview(user, reviewId, rating, comment);
        return ResponseEntity.ok(new Response<>(true, "Review updated successfully", review));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Response<Void>> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable @NonNull Long reviewId) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Deleting review {} by user: {}", reviewId, user.getEmail());
        reviewService.deleteReview(user, reviewId);
        return ResponseEntity.ok(new Response<>(true, "Review deleted successfully", null));
    }
}