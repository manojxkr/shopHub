package com.book.BookStore.DTO;

import java.util.List;

import lombok.Data;
@Data
public class OrderRequest {
    private List<OrderItemRequest> items;
    
}
