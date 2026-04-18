package com.book.BookStore.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.book.BookStore.DTO.BookMapper;
import com.book.BookStore.DTO.BookResponseDTO;
import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.entity.Book;

@Service
public class ExternalProductService {
    private final RestTemplate restTemplate;
    private final BookRepo bookRepo;

    @Value("${external.products.base-url:https://dummyjson.com/products}")
    private String externalProductsBaseUrl;

    public ExternalProductService(BookRepo bookRepo) {
        this.restTemplate = new RestTemplate();
        this.bookRepo = bookRepo;
    }

    public List<BookResponseDTO> fetchExternalProducts(int limit, int skip) {
        List<Book> mapped = fetchAndMap(limit, skip);
        return mapped.stream().map(BookMapper::toDTO).toList();
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public ImportResult importExternalProducts(int limit, int skip) {
        List<Book> mapped = fetchAndMap(limit, skip);

        int imported = 0;
        int skipped = 0;
        Set<String> seen = new HashSet<>();

        for (Book product : mapped) {
            String isbn = normalize(product.getIsbn());
            if (isbn == null) {
                skipped++;
                continue;
            }
            if (!seen.add(isbn) || bookRepo.existsByIsbn(isbn)) {
                skipped++;
                continue;
            }
            bookRepo.save(product);
            imported++;
        }

        return new ImportResult(imported, skipped, mapped.size());
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public BulkImportResult importExternalProductsByCount(int requestedCount) {
        int target = Math.max(1, Math.min(requestedCount, 500));
        int imported = 0;
        int skipped = 0;
        int pageSize = 100;
        int skip = 0;
        int pagesFetched = 0;
        Set<String> seen = new HashSet<>();

        while (imported < target) {
            List<Book> mapped = fetchAndMap(pageSize, skip);
            pagesFetched++;
            if (mapped.isEmpty()) {
                break;
            }

            for (Book product : mapped) {
                if (imported >= target) {
                    break;
                }
                String isbn = normalize(product.getIsbn());
                if (isbn == null) {
                    skipped++;
                    continue;
                }
                if (!seen.add(isbn) || bookRepo.existsByIsbn(isbn)) {
                    skipped++;
                    continue;
                }
                bookRepo.save(product);
                imported++;
            }

            if (mapped.size() < pageSize) {
                break;
            }
            skip += pageSize;
        }

        // If live source has fewer unique items than requested, expand from the fetched
        // pool by creating uniquely identified variants to satisfy the requested count.
        if (imported < target) {
            List<Book> templates = fetchAndMap(pageSize, 0);
            int variantIndex = 1;
            while (imported < target && !templates.isEmpty()) {
                Book template = templates.get((variantIndex - 1) % templates.size());
                Book variant = new Book();
                variant.setTitle(
                        valueOrFallback(template.getTitle(), "Untitled Product") + " (Variant " + variantIndex + ")");
                variant.setAuthors(valueOrFallback(template.getAuthors(), "Unknown Brand"));
                variant.setGenre(valueOrFallback(template.getGenre(), "General"));
                variant.setDescription(valueOrFallback(template.getDescription(), "No description available.")
                        + " Imported variant generated from live catalog source.");
                variant.setPrice(template.getPrice() == null ? 0.0 : template.getPrice());
                variant.setStock(template.getStock() == null ? 0 : template.getStock());
                variant.setImageUrl(template.getImageUrl());

                String baseSku = normalize(template.getIsbn());
                if (baseSku == null) {
                    baseSku = "EXT-BASE";
                }
                String variantSku = baseSku + "-V" + variantIndex;
                variant.setIsbn(variantSku);

                if (seen.add(variantSku) && !bookRepo.existsByIsbn(variantSku)) {
                    bookRepo.save(variant);
                    imported++;
                } else {
                    skipped++;
                }
                variantIndex++;
            }
        }

        return new BulkImportResult(imported, skipped, target, pagesFetched);
    }

    private List<Book> fetchAndMap(int limit, int skip) {
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int safeSkip = Math.max(skip, 0);

        String url = externalProductsBaseUrl + "?limit={limit}&skip={skip}";

        ExternalProductsResponse response;
        try {
            response = restTemplate.getForObject(url, ExternalProductsResponse.class, safeLimit, safeSkip);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to fetch external products: " + ex.getMessage());
        }

        if (response == null || response.products == null) {
            return List.of();
        }

        List<Book> mapped = new ArrayList<>();
        for (ExternalProduct p : response.products) {
            mapped.add(toProductEntity(p));
        }
        return mapped;
    }

    private Book toProductEntity(ExternalProduct p) {
        Book book = new Book();
        book.setTitle(valueOrFallback(p.title, "Untitled Product"));
        book.setAuthors(valueOrFallback(p.brand, "Unknown Brand"));
        book.setGenre(valueOrFallback(p.category, "General"));
        book.setDescription(valueOrFallback(p.description, "No description available."));
        book.setPrice(p.price == null ? 0.0 : p.price);
        book.setStock(p.stock == null ? 0 : p.stock);
        book.setImageUrl(normalize(p.thumbnail));

        String sku = normalize(p.sku);
        if (sku == null && p.id != null) {
            sku = "EXT-" + p.id;
        }
        book.setIsbn(sku);

        return book;
    }

    private String normalize(String s) {
        if (s == null) {
            return null;
        }
        String trimmed = s.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String valueOrFallback(String value, String fallback) {
        String normalized = normalize(value);
        return normalized == null ? fallback : normalized;
    }

    static class ExternalProductsResponse {
        public List<ExternalProduct> products;
    }

    static class ExternalProduct {
        public Long id;
        public String title;
        public String description;
        public String category;
        public String brand;
        public Double price;
        public Integer stock;
        public String thumbnail;
        public String sku;

        @Override
        public int hashCode() {
            return Objects.hash(id, sku);
        }
    }

    public record ImportResult(int imported, int skipped, int requested) {
    }

    public record BulkImportResult(int imported, int skipped, int requested, int pagesFetched) {
    }
}
