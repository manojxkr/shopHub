package com.book.BookStore.DTO;

import com.book.BookStore.entity.OrderStatus;

import lombok.Data;

@Data
public class UpdateOrderStatus {
    OrderStatus status;
    
}
