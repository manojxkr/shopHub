package com.book.BookStore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.book.BookStore.DTO.DemoPaymentRequest;
import com.book.BookStore.DTO.OrderRequest;
import com.book.BookStore.DTO.OrderResponseDTO;
import com.book.BookStore.DTO.StripePaymentRequest;
import com.book.BookStore.DTO.UpdateOrderStatus;
import com.book.BookStore.Response.Response;
import com.book.BookStore.entity.Order;
import com.book.BookStore.entity.User;
import com.book.BookStore.service.CustomUserDetailsService;
import com.book.BookStore.service.OrderService;
import com.book.BookStore.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class OrderController {
    private final OrderService orderService;
    private final CustomUserDetailsService customUserDetailsService;
    private final PaymentService paymentService;

    @PostMapping("/orders")
    @SuppressWarnings("null")
    public ResponseEntity<Response<OrderResponseDTO>> placeOrder(@Valid @RequestBody @NonNull OrderRequest orderRequest,
            Authentication authentication) {
        String email = authentication.getName();
        User user = customUserDetailsService.getUserByEmail(email);
        OrderResponseDTO order = orderService.placeOrder(user, orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new Response<>(true, "Order created. Complete demo checkout to pay and finalize stock.", order));
    }

    @PostMapping("/orders/{id}/create-payment-intent")
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<com.stripe.model.PaymentIntent>> createPaymentIntent(@PathVariable @NonNull Long id,
            Authentication authentication) throws Exception {
        String email = authentication.getName();
        User user = customUserDetailsService.getUserByEmail(email);

        // Get the order
        Order order = orderService.getOrderById(id);
        if (order.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new Response<>(false, "Not your order", null));
        }

        com.stripe.model.PaymentIntent paymentIntent = paymentService.createPaymentIntent(order);
        return ResponseEntity.ok(new Response<>(true, "Payment intent created", paymentIntent));
    }

    @PostMapping("/orders/{id}/pay-demo")
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<OrderResponseDTO>> payDemo(@PathVariable @NonNull Long id,
            @RequestBody(required = false) DemoPaymentRequest body,
            Authentication authentication) {
        String email = authentication.getName();
        User user = customUserDetailsService.getUserByEmail(email);
        OrderResponseDTO updated = orderService.confirmDemoPayment(user, id, body);
        return ResponseEntity.ok(new Response<>(true, "Demo payment successful", updated));
    }

    @PostMapping("/orders/{id}/pay-stripe")
    @PreAuthorize("hasRole('USER')")
    @SuppressWarnings("null")
    public ResponseEntity<Response<OrderResponseDTO>> payWithStripe(@PathVariable @NonNull Long id,
            @RequestBody @NonNull StripePaymentRequest body,
            Authentication authentication) throws Exception {
        String email = authentication.getName();
        User user = customUserDetailsService.getUserByEmail(email);
        OrderResponseDTO updated = orderService.confirmStripePayment(user, id, body.getPaymentIntentId());
        return ResponseEntity.ok(new Response<>(true, "Stripe payment successful", updated));
    }

    // Only ADMin can orders Of all Users
    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response<List<OrderResponseDTO>>> getAllOrders(
            @RequestParam(defaultValue = "createdAt") @NonNull String sortBy,
            @RequestParam(defaultValue = "desc") @NonNull String direction) {

        List<OrderResponseDTO> orders = orderService.getAllOrders(sortBy, direction);
        return ResponseEntity.ok(
                new Response<>(true, "All orders fetched", orders));
    }

    @PutMapping("/orders/{id}/status")
    @SuppressWarnings("null")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response<Order>> updateStatus(@PathVariable @NonNull Long id,
            @RequestBody @NonNull UpdateOrderStatus req) {
        Order updated = orderService.updatOrderStatus(id, req.getStatus());
        return ResponseEntity.ok(
                new Response<>(true, "Order status updated", updated));

    }

    @GetMapping("/orders/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Response<List<OrderResponseDTO>>> getMyOrders(Authentication authentication) {

        String email = authentication.getName();
        User user = customUserDetailsService.getUserByEmail(email);

        return ResponseEntity.ok(
                new Response<>(true, "Yours orders fetched successfully", orderService.getOrdersByUser(user)));
    }

}
