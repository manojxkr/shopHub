package com.book.BookStore.component;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordValidator {

    private static final Pattern PASSWORD_PATTERN = Pattern
            .compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$");

    public boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public String getPasswordRequirements() {
        return "Password must be at least 8 characters long and contain at least one digit, " +
                "one lowercase letter, one uppercase letter, and one special character (@#$%^&+=).";
    }
}