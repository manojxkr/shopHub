package com.book.BookStore.DTO;

public class AdminStatsDTO {
    private long totalBooks;
    private long totalOrders;
    private long totalUsers;
    private double totalRevenue;
    private long pendingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long lowStockProducts;

    public AdminStatsDTO() {
    }

    public AdminStatsDTO(long totalBooks, long totalOrders, long totalUsers, double totalRevenue,
            long pendingOrders, long shippedOrders, long deliveredOrders, long lowStockProducts) {
        this.totalBooks = totalBooks;
        this.totalOrders = totalOrders;
        this.totalUsers = totalUsers;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
        this.shippedOrders = shippedOrders;
        this.deliveredOrders = deliveredOrders;
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getShippedOrders() {
        return shippedOrders;
    }

    public void setShippedOrders(long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}
