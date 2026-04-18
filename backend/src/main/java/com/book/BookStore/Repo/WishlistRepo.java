package com.book.BookStore.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.book.BookStore.entity.WishlistItem;

public interface WishlistRepo extends JpaRepository<WishlistItem, Long> {

    @Query("SELECT w FROM WishlistItem w JOIN FETCH w.book WHERE w.user.id = :userId ORDER BY w.id DESC")
    List<WishlistItem> findAllByUserIdWithBooks(@Param("userId") long userId);

    boolean existsByUser_IdAndBook_Id(long userId, long bookId);

    Optional<WishlistItem> findByUser_IdAndBook_Id(long userId, long bookId);

    void deleteByUser_IdAndBook_Id(long userId, long bookId);

    long deleteByBook_Id(long bookId);
}
