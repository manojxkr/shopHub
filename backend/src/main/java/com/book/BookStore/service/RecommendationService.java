package com.book.BookStore.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.entity.Order;
import com.book.BookStore.entity.OrderItem;
import com.book.BookStore.entity.Review;
import com.book.BookStore.entity.User;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.OrderRepo;
import com.book.BookStore.Repo.ReviewRepo;

@Service
public class RecommendationService {

        private final BookRepo bookRepo;
        private final OrderRepo orderRepo;
        private final ReviewRepo reviewRepo;

        public RecommendationService(BookRepo bookRepo, OrderRepo orderRepo, ReviewRepo reviewRepo) {
                this.bookRepo = bookRepo;
                this.orderRepo = orderRepo;
                this.reviewRepo = reviewRepo;
        }

        @Cacheable(value = "userRecommendations", key = "#user.id")
        public List<BookResponseDTO> getRecommendationsForUser(User user) {
                // Get user's purchase history
                List<Order> userOrders = orderRepo.findByUser(user);
                List<String> purchasedGenres = userOrders.stream()
                                .flatMap(order -> order.getItems().stream())
                                .map(OrderItem::getBook)
                                .map(book -> book.getGenre())
                                .distinct()
                                .collect(Collectors.toList());

                // Recommend books from same genres, excluding already purchased
                List<Long> purchasedBookIds = userOrders.stream()
                                .flatMap(order -> order.getItems().stream())
                                .map(orderItem -> orderItem.getBook().getId())
                                .collect(Collectors.toList());

                return bookRepo.findAll().stream()
                                .filter(book -> !purchasedBookIds.contains(book.getId()))
                                .filter(book -> purchasedGenres.contains(book.getGenre()))
                                .limit(10)
                                .map(book -> new BookResponseDTO(
                                                book.getId(),
                                                book.getTitle(),
                                                book.getAuthors(),
                                                book.getGenre(),
                                                book.getIsbn(),
                                                book.getPrice(),
                                                book.getDescription(),
                                                book.getStock(),
                                                book.getImageUrl()))
                                .collect(Collectors.toList());
        }

        @Cacheable(value = "popularBooks")
        public List<BookResponseDTO> getPopularBooks() {
                // Get books with highest average rating and most reviews
                return reviewRepo.findAll().stream()
                                .collect(Collectors.groupingBy(
                                                Review::getBook,
                                                Collectors.averagingDouble(Review::getRating)))
                                .entrySet().stream()
                                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                                .limit(10)
                                .map(entry -> {
                                        var book = entry.getKey();
                                        return new BookResponseDTO(
                                                        book.getId(),
                                                        book.getTitle(),
                                                        book.getAuthors(),
                                                        book.getGenre(),
                                                        book.getIsbn(),
                                                        book.getPrice(),
                                                        book.getDescription(),
                                                        book.getStock(),
                                                        book.getImageUrl());
                                })
                                .collect(Collectors.toList());
        }
}