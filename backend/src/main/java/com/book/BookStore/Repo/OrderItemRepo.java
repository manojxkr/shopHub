package com.book.BookStore.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.book.BookStore.entity.OrderItem;

public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
    boolean existsByBook_Id(Long bookId);

}
