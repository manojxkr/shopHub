package com.book.BookStore.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookCreateRequest {
    private String title;
    private String authors;
    private Double price;
    private Integer stock;
    private String description;
    private String genre;
    private String isbn;
}