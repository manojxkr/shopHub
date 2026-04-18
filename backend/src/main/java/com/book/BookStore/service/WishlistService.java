package com.book.BookStore.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.book.BookStore.DTO.BookMapper;
import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Repo.WishlistRepo;
import com.book.BookStore.entity.Book;
import com.book.BookStore.entity.User;
import com.book.BookStore.entity.WishlistItem;

@Service
public class WishlistService {

    private final WishlistRepo wishlistRepo;
    private final CustomUserDetailsService userDetailsService;
    private final BookService bookService;

    public WishlistService(WishlistRepo wishlistRepo, CustomUserDetailsService userDetailsService,
            BookService bookService) {
        this.wishlistRepo = wishlistRepo;
        this.userDetailsService = userDetailsService;
        this.bookService = bookService;
    }

    public List<BookResponseDTO> listForUser(@NonNull String email) {
        User user = userDetailsService.getUserByEmail(email);
        return wishlistRepo.findAllByUserIdWithBooks(user.getId()).stream()
                .map(WishlistItem::getBook)
                .map(BookMapper::toDTO)
                .toList();
    }

    public void add(@NonNull String email, @NonNull Long bookId) {
        User user = userDetailsService.getUserByEmail(email);
        Book book = bookService.getBookById(bookId);
        if (wishlistRepo.existsByUser_IdAndBook_Id(user.getId(), book.getId())) {
            return;
        }
        wishlistRepo.save(new WishlistItem(user, book));
    }

    @Transactional
    public void remove(@NonNull String email, @NonNull Long bookId) {
        User user = userDetailsService.getUserByEmail(email);
        wishlistRepo.findByUser_IdAndBook_Id(user.getId(), bookId)
                .ifPresent(wishlistRepo::delete);
    }

    public boolean contains(@NonNull String email, @NonNull Long bookId) {
        User user = userDetailsService.getUserByEmail(email);
        return wishlistRepo.existsByUser_IdAndBook_Id(user.getId(), bookId);
    }
}
