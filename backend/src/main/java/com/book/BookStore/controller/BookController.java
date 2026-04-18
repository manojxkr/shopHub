package com.book.BookStore.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.book.BookStore.DTO.BookCreateRequest;
import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Response.Response;
import com.book.BookStore.entity.Book;
import com.book.BookStore.service.BookService;
import com.book.BookStore.service.ExternalProductService;
import com.book.BookStore.service.FileUploadService;

import org.springframework.lang.NonNull;

@RequestMapping("api")
@RestController
public class BookController {
    private final BookService service;
    private final FileUploadService fileUploadService;
    private final ExternalProductService externalProductService;

    public BookController(BookService service, FileUploadService fileUploadService,
            ExternalProductService externalProductService) {
        this.service = service;
        this.fileUploadService = fileUploadService;
        this.externalProductService = externalProductService;
    }

    @GetMapping("/books/external")
    public ResponseEntity<Response<List<BookResponseDTO>>> fetchExternalProducts(
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        List<BookResponseDTO> data = externalProductService.fetchExternalProducts(limit, skip);
        return ResponseEntity.ok(new Response<>(true, "External products fetched", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/books/import-external")
    public ResponseEntity<Response<Map<String, Object>>> importExternalProducts(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        ExternalProductService.ImportResult result = externalProductService.importExternalProducts(limit, skip);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("imported", result.imported());
        body.put("skipped", result.skipped());
        body.put("requested", result.requested());
        return ResponseEntity.ok(new Response<>(true, "External products imported", body));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/books/import-external/bulk")
    public ResponseEntity<Response<Map<String, Object>>> importExternalProductsBulk(
            @RequestParam(defaultValue = "200") int count) {
        ExternalProductService.BulkImportResult result = externalProductService.importExternalProductsByCount(count);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("imported", result.imported());
        body.put("skipped", result.skipped());
        body.put("requested", result.requested());
        body.put("pagesFetched", result.pagesFetched());
        return ResponseEntity.ok(new Response<>(true, "Bulk external products imported", body));
    }

    @GetMapping("/books/search")
    public ResponseEntity<Response<List<BookResponseDTO>>> searchBooks(@RequestParam String keyword) {
        return ResponseEntity.ok(
                new Response<>(true, "Search results", service.searchBooks(keyword)));
    }

    @GetMapping("/books/advanced-search")
    public ResponseEntity<Response<Page<BookResponseDTO>>> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Page<BookResponseDTO> results = service.advancedSearch(title, author, genre, minPrice, maxPrice,
                page, size, sortBy, direction);
        return ResponseEntity.ok(new Response<>(true, "Advanced search results", results));
    }

    @GetMapping("/books")
    public Page<BookResponseDTO> getAllBooks(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size, @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String genre) {

        return service.getAllBooks(page, size, sortBy, direction, genre);

    }

    @GetMapping("/books/genres")
    public ResponseEntity<Response<List<String>>> listGenres() {
        return ResponseEntity.ok(new Response<>(true, "Genres", service.listDistinctGenres()));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Response<Book>> getBook(@NonNull @PathVariable Long id) {
        Book book = service.getBookById(id);
        return ResponseEntity.ok(
                new Response<>(true, "Book found", book));

    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/book/{id}")
    public ResponseEntity<Response<BookResponseDTO>> updateBook(@NonNull @PathVariable Long id,
            @RequestBody @NonNull Book book) {
        // BookResponseDTO updated = service.updateBook(id, book);
        return ResponseEntity.ok(
                new Response<>(true, "Book updated successfully", service.updateBook(id, book)));

    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/books", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Response<BookResponseDTO>> addBook(
            @RequestPart("book") BookCreateRequest bookRequest,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws Exception {

        Book book = new Book();
        book.setTitle(bookRequest.getTitle());
        book.setAuthors(bookRequest.getAuthors());
        book.setPrice(bookRequest.getPrice());
        book.setStock(bookRequest.getStock());
        book.setDescription(bookRequest.getDescription());
        book.setGenre(bookRequest.getGenre());
        book.setIsbn(bookRequest.getIsbn());

        // Handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            if (!fileUploadService.isValidImageFile(imageFile)) {
                return ResponseEntity.badRequest()
                        .body(new Response<>(false, "Invalid image file. Only JPEG, PNG, GIF, and WebP are allowed.",
                                null));
            }
            String imageUrl = fileUploadService.uploadFile(imageFile, "books");
            book.setImageUrl(imageUrl);
        }

        BookResponseDTO saved = service.addbook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(new Response<>(true, "Book added successfully", saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Response<Void>> deleteBook(@NonNull @PathVariable Long id) {
        try {
            service.deleteBook(id);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response<>(false, ex.getMessage(), null));
        }
        return ResponseEntity.ok(new Response<>(true, "Book deleted successfully", null));

    }

}
