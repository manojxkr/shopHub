package com.book.BookStore.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.book.BookStore.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);


}