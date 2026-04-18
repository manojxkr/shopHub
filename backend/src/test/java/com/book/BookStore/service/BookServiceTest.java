package com.book.BookStore.service;

import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.CartRepo;
import com.book.BookStore.Repo.OrderItemRepo;
import com.book.BookStore.Repo.ReviewRepo;
import com.book.BookStore.Repo.WishlistRepo;
import com.book.BookStore.entity.Book;
import com.book.BookStore.exceptions.BookNotFound;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class BookServiceTest {

    @Mock
    private BookRepo bookRepo;

    @Mock
    private WishlistRepo wishlistRepo;

    @Mock
    private ReviewRepo reviewRepo;

    @Mock
    private OrderItemRepo orderItemRepo;

    @Mock
    private CartRepo cartRepo;

    @InjectMocks
    private BookService bookService;

    private Book testBook;

    @BeforeEach
    void setUp() {
        testBook = new Book();
        testBook.setId(1L);
        testBook.setTitle("Test Book");
        testBook.setAuthors("Test Author");
        testBook.setPrice(29.99);
        testBook.setStock(10);
    }

    @Test
    void getBookById_ShouldReturnBook_WhenExists() {
        // Given
        when(bookRepo.findById(1L)).thenReturn(Optional.of(testBook));

        // When
        Book result = bookService.getBookById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Test Book");
        verify(bookRepo).findById(1L);
    }

    @Test
    void getBookById_ShouldThrowException_WhenNotExists() {
        // Given
        when(bookRepo.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> bookService.getBookById(1L))
                .isInstanceOf(BookNotFound.class)
                .hasMessage("Book with ID  1  not found  ");
    }

    @Test
    @SuppressWarnings("null")
    void addbook_ShouldReturnBookResponseDTO() {
        // Given
        when(bookRepo.save(any(Book.class))).thenReturn(testBook);

        // When
        BookResponseDTO result = bookService.addbook(testBook);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Book");
        verify(bookRepo).save(testBook);
    }

    @Test
    @SuppressWarnings("null")
    void getAllBooks_ShouldReturnPagedResults() {
        // Given
        Pageable pageable = PageRequest.of(0, 5);
        Page<Book> bookPage = new PageImpl<>(List.of(testBook), pageable, 1);
        lenient().when(bookRepo.findAll(any(Pageable.class))).thenReturn(bookPage);

        // When
        Page<BookResponseDTO> result = bookService.getAllBooks(0, 5, "title", "asc", null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Book");
    }

    @Test
    @SuppressWarnings("null")
    void updateBook_ShouldReturnUpdatedBook() {
        // Given
        Book updateBook = new Book();
        updateBook.setTitle("Updated Title");
        updateBook.setPrice(39.99);

        when(bookRepo.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepo.save(any(Book.class))).thenReturn(testBook);

        // When
        BookResponseDTO result = bookService.updateBook(1L, updateBook);

        // Then
        assertThat(result).isNotNull();
        verify(bookRepo).findById(1L);
        verify(bookRepo).save(testBook);
    }

    @Test
    @SuppressWarnings("null")
    void deleteBook_ShouldCallDelete() {
        // Given
        when(bookRepo.findById(1L)).thenReturn(Optional.of(testBook));
        when(orderItemRepo.existsByBook_Id(1L)).thenReturn(false);
        when(cartRepo.findAll()).thenReturn(List.of());

        // When
        bookService.deleteBook(1L);

        // Then
        verify(bookRepo).findById(1L);
        verify(bookRepo).delete(testBook);
    }
}