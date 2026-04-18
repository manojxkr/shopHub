package com.book.BookStore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.BookStore.DTO.AdminStatsDTO;
import com.book.BookStore.Response.Response;
import com.book.BookStore.service.AdminStatsService;

@RestController
@RequestMapping("/api/admin")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    public AdminStatsController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response<AdminStatsDTO>> stats() {
        return ResponseEntity.ok(new Response<>(true, "Stats", adminStatsService.getStats()));
    }
}
