package com.book.BookStore.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "USER|ADMIN", message = "Role must be USER or ADMIN")
    private String role;
    // public void setEmail(String email) {
    // this.email = email;
    // }
    // public String getEmail() {
    // return email;
    // }
    // public void setPassword(String password) {
    // this.password = password;
    // }
    // public String getPassword() {
    // return password;
    // }
    // public void setRole(String role) {
    // this.role = role;
    // }
    // public String getRole() {
    // return role;
    // }
    // public void setName(String name) {
    // this.name = name;
    // }
    // public String getName() {
    // return name;
    // }

}
