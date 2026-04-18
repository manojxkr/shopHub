package com.book.BookStore.service;

import com.book.BookStore.Repo.ReviewRepo;
import com.book.BookStore.entity.Book;
import com.book.BookStore.entity.Review;
import com.book.BookStore.entity.User;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private final ReviewRepo reviewRepo;
    private final BookService bookService;

    public ReviewService(ReviewRepo reviewRepo, BookService bookService) {
        this.reviewRepo = reviewRepo;
        this.bookService = bookService;
    }

    @Cacheable(value = "bookReviews", key = "#bookId")
    public List<Review> getReviewsForBook(@NonNull Long bookId) {
        Book book = bookService.getBookById(bookId);
        return reviewRepo.findByBook(book);
    }

    @Cacheable(value = "userReviews", key = "#user.id")
    public List<Review> getReviewsByUser(User user) {
        return reviewRepo.findByUser(user);
    }

    public Double getAverageRatingForBook(@NonNull Long bookId) {
        Book book = bookService.getBookById(bookId);
        return reviewRepo.findAverageRatingByBook(book);
    }

    public Long getReviewCountForBook(@NonNull Long bookId) {
        Book book = bookService.getBookById(bookId);
        return reviewRepo.countByBook(book);
    }

    @Transactional
    @CacheEvict(value = { "bookReviews", "userReviews" }, allEntries = true)
    public Review addReview(@NonNull User user, @NonNull Long bookId, Integer rating, String comment) {
        Book book = bookService.getBookById(bookId);

        // Check if user already reviewed this book
        Optional<Review> existingReview = reviewRepo.findByBookAndUser(book, user);
        if (existingReview.isPresent()) {
            throw new RuntimeException("User has already reviewed this book");
        }

        Review review = new Review();
        review.setBook(book);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepo.save(review);
    }

    @Transactional
    @CacheEvict(value = { "bookReviews", "userReviews" }, allEntries = true)
    public Review updateReview(@NonNull User user, @NonNull Long reviewId, Integer rating, String comment) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Check if user owns this review
        if (review.getUser().getId() != user.getId()) {
            throw new RuntimeException("User can only update their own reviews");
        }

        review.setRating(rating);
        review.setComment(comment);

        return reviewRepo.save(review);
    }

    @Transactional
    @CacheEvict(value = { "bookReviews", "userReviews" }, allEntries = true)
    public void deleteReview(@NonNull User user, @NonNull Long reviewId) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Check if user owns this review
        if (review.getUser().getId() != user.getId()) {
            throw new RuntimeException("User can only delete their own reviews");
        }

        reviewRepo.delete(review);
    }
}