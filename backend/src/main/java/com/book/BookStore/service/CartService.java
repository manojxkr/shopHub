package com.book.BookStore.service;

import com.book.BookStore.Repo.CartRepo;
import com.book.BookStore.entity.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {
    private final CartRepo cartRepo;
    private final BookService bookService;

    public CartService(CartRepo cartRepo, BookService bookService) {
        this.cartRepo = cartRepo;
        this.bookService = bookService;
    }

    @Cacheable(value = "carts", key = "#user.id")
    public Cart getOrCreateCart(@NonNull User user) {
        return cartRepo.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepo.save(cart);
                });
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#user.id")
    public Cart addToCart(@NonNull User user, @NonNull Long bookId, Integer quantity) {
        Book book = bookService.getBookById(bookId);
        Cart cart = getOrCreateCart(user);

        // Check if item already exists
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setBook(book);
            newItem.setQuantity(quantity);
            cart.addItem(newItem);
        }

        return cartRepo.save(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#user.id")
    public Cart updateCartItem(@NonNull User user, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cart.removeItem(item);
        } else {
            item.setQuantity(quantity);
            cart.recalculateTotal();
        }

        return cartRepo.save(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#user.id")
    public Cart removeFromCart(@NonNull User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cart.removeItem(item);
        return cartRepo.save(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#user.id")
    public void clearCart(@NonNull User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cart.setTotalPrice(0.0);
        cartRepo.save(cart);
    }
}