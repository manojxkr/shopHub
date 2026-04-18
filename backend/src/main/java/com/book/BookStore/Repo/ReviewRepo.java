package com.book.BookStore.Repo;

import com.book.BookStore.entity.Book;
import com.book.BookStore.entity.Review;
import com.book.BookStore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByBook(Book book);

    List<Review> findByUser(User user);

    Optional<Review> findByBookAndUser(Book book, User user);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book = :book")
    Double findAverageRatingByBook(Book book);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.book = :book")
    Long countByBook(Book book);

    long deleteByBook(Book book);
}