package com.book.BookStore.DTO;

import com.book.BookStore.entity.Book;

public class BookMapper {

    public static BookResponseDTO toDTO(Book book) {
        BookResponseDTO dto = new BookResponseDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthors(book.getAuthors());
        dto.setGenre(book.getGenre());
        dto.setIsbn(book.getIsbn());
        dto.setPrice(book.getPrice());
        dto.setDescription(book.getDescription());
        dto.setStock(book.getStock());
        dto.setImageUrl(book.getImageUrl());
        return dto;

    }

}
