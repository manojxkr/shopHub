package com.book.BookStore.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookResponseDTO {
    private Long id;
    private String title;
    private String authors;
    private String genre;
    private String isbn;
    private Double price;
    private String description;
    private Integer stock;
    private String imageUrl;

}
