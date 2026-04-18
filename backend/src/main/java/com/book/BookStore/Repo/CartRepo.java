package com.book.BookStore.Repo;

import com.book.BookStore.entity.Cart;
import com.book.BookStore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}