package com.book.BookStore.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.book.BookStore.DTO.DemoPaymentRequest;
import com.book.BookStore.DTO.OderMapper;
import com.book.BookStore.DTO.OrderItemRequest;
import com.book.BookStore.DTO.OrderRequest;
import com.book.BookStore.DTO.OrderResponseDTO;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.OrderRepo;
import com.book.BookStore.entity.Book;
import com.book.BookStore.entity.Order;
import com.book.BookStore.entity.OrderItem;
import com.book.BookStore.entity.OrderStatus;
import com.book.BookStore.entity.User;
import com.book.BookStore.exceptions.BookNotFound;
import com.book.BookStore.exceptions.OrderNotFoundException;
import com.book.BookStore.exceptions.OutOfStockException;
import com.book.BookStore.realtime.OrderRealtimePublisher;

import lombok.RequiredArgsConstructor;

@Transactional
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final BookRepo bookRepo;
    private final OrderRealtimePublisher orderRealtimePublisher;
    private final EmailService emailService;
    private final PaymentService paymentService;

    @Value("${demo.payment.delay-ms:1200}")
    private long demoPaymentDelayMs;

    /**
     * Creates an order with payment PENDING. Stock is reserved only after
     * successful demo payment.
     */
    @SuppressWarnings("null")
    public OrderResponseDTO placeOrder(@NonNull User user, @NonNull OrderRequest request) {

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus("PENDING");

        double totalAmount = 0;
        for (OrderItemRequest itemReq : request.getItems()) {
            Book book = bookRepo.findById(itemReq.getBookId())
                    .orElseThrow(() -> new BookNotFound(itemReq.getBookId()));

            if (book.getStock() < itemReq.getQuantity()) {
                throw new OutOfStockException(book.getTitle());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setBook(book);
            item.setQuantity(itemReq.getQuantity());
            item.setPriceAtPurchase(book.getPrice());
            totalAmount = totalAmount + book.getPrice() * itemReq.getQuantity();

            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepo.save(order);
        OrderResponseDTO dto = OderMapper.toDTO(savedOrder);
        orderRealtimePublisher.publishOrderEvent("ORDER_CREATED", dto);
        return dto;
    }

    /**
     * Simulates a card payment: optional delay, then marks PAID and deducts stock.
     */
    @SuppressWarnings("null")
    public OrderResponseDTO confirmDemoPayment(@NonNull User user, @NonNull Long orderId, DemoPaymentRequest body) {
        boolean simulateFailure = body != null && body.isSimulateFailure();
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getUser().getId() != user.getId()) {
            throw new AccessDeniedException("Not your order");
        }
        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("This order is already paid.");
        }
        if (simulateFailure) {
            throw new IllegalStateException("Demo payment was declined. You can try again.");
        }

        if (demoPaymentDelayMs > 0) {
            try {
                Thread.sleep(demoPaymentDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Payment interrupted");
            }
        }

        for (OrderItem item : order.getItems()) {
            Book book = bookRepo.findById(item.getBook().getId())
                    .orElseThrow(() -> new BookNotFound(item.getBook().getId()));
            if (book.getStock() < item.getQuantity()) {
                throw new OutOfStockException(book.getTitle());
            }
            book.setStock(book.getStock() - item.getQuantity());
            bookRepo.save(book);
        }

        order.setPaymentStatus("PAID");
        Order saved = orderRepo.save(order);
        OrderResponseDTO dto = OderMapper.toDTO(saved);
        orderRealtimePublisher.publishOrderEvent("PAYMENT_COMPLETED", dto);

        // Send order confirmation email
        String orderDetails = buildOrderDetailsText(saved);
        emailService.sendOrderConfirmationEmail(saved.getUser().getEmail(), saved.getUser().getName(), orderDetails);

        return dto;
    }

    public Order getOrderById(@NonNull Long orderId) {
        return orderRepo.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
    }

    /**
     * Processes Stripe payment and confirms the order
     */
    @SuppressWarnings("null")
    public OrderResponseDTO confirmStripePayment(User user, Long orderId, String paymentIntentId)
            throws Exception {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getUser().getId() != user.getId()) {
            throw new AccessDeniedException("Not your order");
        }
        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("This order is already paid.");
        }

        // Confirm the payment intent
        paymentService.confirmPaymentIntent(paymentIntentId);

        // Deduct stock
        for (OrderItem item : order.getItems()) {
            Book book = bookRepo.findById(item.getBook().getId())
                    .orElseThrow(() -> new BookNotFound(item.getBook().getId()));
            if (book.getStock() < item.getQuantity()) {
                throw new OutOfStockException(book.getTitle());
            }
            book.setStock(book.getStock() - item.getQuantity());
            bookRepo.save(book);
        }

        order.setPaymentStatus("PAID");
        order.setOrderStatus(OrderStatus.PENDING); // Will be updated to SHIPPED later
        Order saved = orderRepo.save(order);
        OrderResponseDTO dto = OderMapper.toDTO(saved);
        orderRealtimePublisher.publishOrderEvent("PAYMENT_COMPLETED", dto);

        // Send order confirmation email
        String orderDetails = buildOrderDetailsText(saved);
        emailService.sendOrderConfirmationEmail(saved.getUser().getEmail(), saved.getUser().getName(), orderDetails);

        return dto;
    }

    public List<OrderResponseDTO> getAllOrders(@NonNull String sortBy, @NonNull String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return orderRepo.findAll(sort).stream().map(OderMapper::toDTO).toList();
    }

    public Order updatOrderStatus(@NonNull Long orderId, @NonNull OrderStatus status) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order Not Found"));

        if ((status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED)
                && !"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Cannot ship or deliver until payment is completed.");
        }

        order.setOrderStatus(status);
        Order saved = orderRepo.save(order);
        orderRealtimePublisher.publishOrderEvent("ORDER_STATUS_UPDATED", OderMapper.toDTO(saved));
        return saved;
    }

    public List<OrderResponseDTO> getOrdersByUser(User user) {
        return orderRepo.findByUserId(user.getId()).stream().map(OderMapper::toDTO).toList();
    }

    private String buildOrderDetailsText(Order order) {
        StringBuilder details = new StringBuilder();
        details.append("Order ID: ").append((Long) order.getId()).append("\n");
        details.append("Total Amount: $").append(String.format("%.2f", order.getTotalAmount())).append("\n\n");
        details.append("Items:\n");

        for (OrderItem item : order.getItems()) {
            details.append("- ").append(item.getBook().getTitle())
                    .append(" (x").append(item.getQuantity())
                    .append(") - $").append(String.format("%.2f", item.getPriceAtPurchase() * item.getQuantity()))
                    .append("\n");
        }

        return details.toString();
    }
}
