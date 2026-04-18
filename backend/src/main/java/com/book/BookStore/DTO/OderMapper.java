package com.book.BookStore.DTO;

import java.util.List;

import com.book.BookStore.entity.Order;

public class OderMapper {
    public static OrderResponseDTO toDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setCustomerName(order.getUser().getName());
        dto.setCustomerEmail(order.getUser().getEmail());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setStatus(order.getOrderStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentStatus(order.getPaymentStatus());

        List<OrderItemResponseDTO> items = order.getItems().stream().map(item -> {
            OrderItemResponseDTO i = new OrderItemResponseDTO();
            i.setBookTitle(item.getBook().getTitle());
            i.setQuantity(item.getQuantity());
            i.setPriceAtPurchase(item.getPriceAtPurchase());
            return i;
        }).toList();

        dto.setItems(items);
        return dto;

    }

}
