package com.book.BookStore.exceptions;

public class BookNotFound extends RuntimeException {
    public BookNotFound(Long id) {
        super("Book with ID  " + id + "  not found  ");

    }

}
