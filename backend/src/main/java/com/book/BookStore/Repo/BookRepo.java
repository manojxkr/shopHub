package com.book.BookStore.Repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.book.BookStore.entity.Book;

public interface BookRepo extends JpaRepository<Book, Long> {
        Page<Book> findByGenreIgnoreCase(String genre, Pageable pageable);

        boolean existsByIsbn(String isbn);

        @Query("SELECT DISTINCT b.genre FROM Book b WHERE b.genre IS NOT NULL AND TRIM(b.genre) <> '' ORDER BY b.genre")
        List<String> findDistinctGenres();

        @Query("SELECT COUNT(b) FROM Book b WHERE b.stock < 10")
        long countLowStockProducts();

        List<Book> findByTitleContainingIgnoreCase(String title);

        List<Book> findByAuthorsContainingIgnoreCase(String authors);

        List<Book> findByTitleContainingIgnoreCaseOrAuthorsContainingIgnoreCase(String title, String authors);

        @Query("SELECT b FROM Book b WHERE " +
                        "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
                        "(:author IS NULL OR LOWER(b.authors) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
                        "(:genre IS NULL OR LOWER(b.genre) = LOWER(:genre)) AND " +
                        "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR b.price <= :maxPrice)")
        Page<Book> advancedSearch(String title, String author, String genre, Double minPrice, Double maxPrice,
                        Pageable pageable);

}
