package com.book.BookStore.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.book.BookStore.DTO.BookMapper;
import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.CartRepo;
import com.book.BookStore.Repo.OrderItemRepo;
import com.book.BookStore.Repo.ReviewRepo;
import com.book.BookStore.Repo.WishlistRepo;
import com.book.BookStore.entity.Cart;
import com.book.BookStore.entity.Book;
import com.book.BookStore.exceptions.BookNotFound;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {
    private final BookRepo repo;
    private final WishlistRepo wishlistRepo;
    private final ReviewRepo reviewRepo;
    private final OrderItemRepo orderItemRepo;
    private final CartRepo cartRepo;

    public BookService(BookRepo repo, WishlistRepo wishlistRepo, ReviewRepo reviewRepo,
            OrderItemRepo orderItemRepo, CartRepo cartRepo) {
        this.repo = repo;
        this.wishlistRepo = wishlistRepo;
        this.reviewRepo = reviewRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartRepo = cartRepo;

    }

    @CacheEvict(value = "books", allEntries = true)
    @NonNull
    @SuppressWarnings("null")
    public BookResponseDTO addbook(@NonNull Book book) {
        return BookMapper.toDTO(repo.save(book));

    }

    public Page<BookResponseDTO> getAllBooks(int page, int size, String sortBy, String direction, String genre) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (genre != null && !genre.isBlank()) {
            return repo.findByGenreIgnoreCase(genre.trim(), pageable).map(BookMapper::toDTO);
        }

        return repo.findAll(pageable).map(BookMapper::toDTO);
    }

    @Cacheable(value = "genres")
    public List<String> listDistinctGenres() {
        return repo.findDistinctGenres();
    }

    @Cacheable(value = "books", key = "#id")
    @NonNull
    @SuppressWarnings("null")
    public Book getBookById(@NonNull Long id) {
        return repo.findById(id).orElseThrow(() -> new BookNotFound(id));

    }

    @Cacheable(value = "bookSearch", key = "#keyword")
    public List<BookResponseDTO> searchBooks(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return repo.findAll().stream()
                .filter(book -> (book.getTitle() != null
                        && book.getTitle().toLowerCase().contains(keyword.toLowerCase())) ||
                        (book.getAuthors() != null && book.getAuthors().toLowerCase().contains(keyword.toLowerCase()))
                        ||
                        (book.getDescription() != null
                                && book.getDescription().toLowerCase().contains(keyword.toLowerCase()))
                        ||
                        (book.getGenre() != null && book.getGenre().toLowerCase().contains(keyword.toLowerCase())) ||
                        (book.getIsbn() != null && book.getIsbn().toLowerCase().contains(keyword.toLowerCase())))
                .map(BookMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<BookResponseDTO> advancedSearch(String title, String author, String genre,
            Double minPrice, Double maxPrice, int page, int size,
            String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return repo.advancedSearch(title, author, genre, minPrice, maxPrice, pageable)
                .map(BookMapper::toDTO);
    }

    @CacheEvict(value = "books", key = "#id")
    @SuppressWarnings("null")
    @NonNull
    public BookResponseDTO updateBook(@NonNull Long id, @NonNull Book updateBook) {

        Book book = getBookById(id);

        book.setTitle(updateBook.getTitle());
        book.setAuthors(updateBook.getAuthors());
        book.setPrice(updateBook.getPrice());
        book.setStock(updateBook.getStock());
        book.setImageUrl(updateBook.getImageUrl());
        book.setIsbn(updateBook.getIsbn());
        book.setDescription(updateBook.getDescription());
        book.setGenre(updateBook.getGenre());

        return BookMapper.toDTO(repo.save(book));

    }

    @CacheEvict(value = "books", key = "#id")
    @Transactional
    public void deleteBook(@NonNull Long id) {
        Book book = getBookById(id);

        // Preserve order history integrity: if a product is already part of an order,
        // reject physical deletion and keep historical references consistent.
        if (orderItemRepo.existsByBook_Id(id)) {
            throw new IllegalStateException(
                    "Cannot delete this product because it exists in order history. Consider marking it out of stock instead.");
        }

        // Remove dependent references before deleting the book.
        reviewRepo.deleteByBook(book);
        wishlistRepo.deleteByBook_Id(id);

        // Clean cart items that reference this book and recalculate totals.
        for (Cart cart : cartRepo.findAll()) {
            boolean changed = false;
            var iterator = cart.getItems().iterator();
            while (iterator.hasNext()) {
                var item = iterator.next();
                if (item.getBook() != null && id.equals(item.getBook().getId())) {
                    iterator.remove();
                    item.setCart(null);
                    changed = true;
                }
            }
            if (changed) {
                cart.recalculateTotal();
                cartRepo.save(cart);
            }
        }

        repo.delete(book);
    }

}
