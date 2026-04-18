package com.book.BookStore.service;

import org.springframework.stereotype.Service;

import com.book.BookStore.DTO.AdminStatsDTO;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.OrderRepo;
import com.book.BookStore.Repo.UserRepo;
import com.book.BookStore.entity.OrderStatus;

@Service
public class AdminStatsService {

    private final BookRepo bookRepo;
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;

    public AdminStatsService(BookRepo bookRepo, OrderRepo orderRepo, UserRepo userRepo) {
        this.bookRepo = bookRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
    }

    public AdminStatsDTO getStats() {
        long totalBooks = bookRepo.count();
        long totalOrders = orderRepo.count();
        long totalUsers = userRepo.count();

        // Revenue should reflect all successfully paid orders, not only delivered ones.
        double totalRevenue = orderRepo.findAll().stream()
                .filter(o -> "PAID".equalsIgnoreCase(String.valueOf(o.getPaymentStatus())))
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();

        long pendingOrders = orderRepo.countByOrderStatus(OrderStatus.PENDING);
        long shippedOrders = orderRepo.countByOrderStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepo.countByOrderStatus(OrderStatus.DELIVERED);
        long lowStockProducts = bookRepo.countLowStockProducts();

        return new AdminStatsDTO(totalBooks, totalOrders, totalUsers, totalRevenue,
                pendingOrders, shippedOrders, deliveredOrders, lowStockProducts);
    }
}
