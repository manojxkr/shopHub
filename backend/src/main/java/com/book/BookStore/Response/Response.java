package com.book.BookStore.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Response<T> {
    private boolean success;
    private String message;
    private T data;

}
