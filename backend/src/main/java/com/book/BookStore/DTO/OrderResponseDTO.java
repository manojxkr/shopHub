package com.book.BookStore.DTO;

import java.time.LocalDateTime;
import java.util.List;

import com.book.BookStore.entity.OrderStatus;

import lombok.Data;
@Data
public class OrderResponseDTO {
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private OrderStatus status;
    private String paymentStatus;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;

}
