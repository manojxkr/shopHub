package com.book.BookStore.controller;

import com.book.BookStore.Response.Response;
import com.book.BookStore.entity.Cart;
import com.book.BookStore.entity.User;
import com.book.BookStore.service.CartService;
import com.book.BookStore.service.CustomUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    private final CartService cartService;
    private final CustomUserDetailsService userDetailsService;

    public CartController(CartService cartService, CustomUserDetailsService userDetailsService) {
        this.cartService = cartService;
        this.userDetailsService = userDetailsService;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userDetailsService.getUserByEmail(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<Response<Cart>> getCart(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Fetching cart for user: {}", user.getEmail());
        Cart cart = cartService.getOrCreateCart(user);
        return ResponseEntity.ok(new Response<>(true, "Cart retrieved successfully", cart));
    }

    public static class AddToCartRequest {
        private Long bookId;
        private Integer quantity;

        public Long getBookId() {
            return bookId;
        }

        public void setBookId(Long bookId) {
            this.bookId = bookId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class UpdateCartItemRequest {
        private Integer quantity;

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Response<Cart>> addToCart(
            Authentication authentication,
            @RequestBody(required = false) AddToCartRequest body,
            @RequestParam(required = false) Long bookId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (body != null && body.getBookId() != null) {
            bookId = body.getBookId();
        }
        if (body != null && body.getQuantity() != null) {
            quantity = body.getQuantity();
        }

        if (bookId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response<>(false, "bookId is required", null));
        }

        logger.info("Adding book {} to cart for user: {}", bookId, user.getEmail());
        Cart cart = cartService.addToCart(user, bookId, quantity);
        return ResponseEntity.ok(new Response<>(true, "Item added to cart", cart));
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<Response<Cart>> updateCartItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody(required = false) UpdateCartItemRequest body,
            @RequestParam(required = false) Integer quantity) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (body != null && body.getQuantity() != null) {
            quantity = body.getQuantity();
        }
        if (quantity == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response<>(false, "quantity is required", null));
        }

        logger.info("Updating cart item {} for user: {}", itemId, user.getEmail());
        Cart cart = cartService.updateCartItem(user, itemId, quantity);
        return ResponseEntity.ok(new Response<>(true, "Cart item updated", cart));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Response<Cart>> removeFromCart(
            Authentication authentication,
            @PathVariable Long itemId) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Removing item {} from cart for user: {}", itemId, user.getEmail());
        Cart cart = cartService.removeFromCart(user, itemId);
        return ResponseEntity.ok(new Response<>(true, "Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<Response<Void>> clearCart(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        logger.info("Clearing cart for user: {}", user.getEmail());
        cartService.clearCart(user);
        return ResponseEntity.ok(new Response<>(true, "Cart cleared", null));
    }
}