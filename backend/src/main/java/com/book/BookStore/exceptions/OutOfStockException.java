package com.book.BookStore.exceptions;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String title) {
        super("Not enough stock for book   " + title);

    }

}
