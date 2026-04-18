package com.book.BookStore.DTO;

import lombok.Data;

@Data
public class OrderItemResponseDTO {
    private String bookTitle;
    private Integer quantity;
    private Double priceAtPurchase;

}
