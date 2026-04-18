package com.book.BookStore.exceptions;

import java.time.LocalDateTime;

import lombok.*;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime time;
    private int status;
    private String error;
    private String message;
    private String path;

}
