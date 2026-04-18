package com.book.BookStore.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.book.BookStore.entity.Order;
import com.book.BookStore.entity.OrderStatus;
import com.book.BookStore.entity.User;

public interface OrderRepo extends JpaRepository<Order, Long> {
  List<Order> findByUserId(Long userid);

  List<Order> findByUser(User user);

  long countByOrderStatus(OrderStatus status);

  // Page<Order> findAll(Pageable pageable);

}
