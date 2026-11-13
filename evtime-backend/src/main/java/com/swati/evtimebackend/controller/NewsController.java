package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.NewsRequest;
import com.swati.evtimebackend.dto.NewsResponse;
import com.swati.evtimebackend.service.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@Tag(name = "News")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @Operation(summary = "List articles with pagination, sorting, category and text filters")
    @GetMapping
    public Page<NewsResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        return newsService.list(page, size, sortBy, direction, category, q);
    }

    @Operation(summary = "Stories published after the given instant (for live updates)")
    @GetMapping("/latest")
    public List<NewsResponse> latest(
            @RequestParam(required = false) Instant since,
            @RequestParam(defaultValue = "20") int limit) {
        return newsService.latest(since, limit);
    }

    @Operation(summary = "Featured stories for the front page")
    @GetMapping("/featured")
    public List<NewsResponse> featured() {
        return newsService.featured();
    }

    @Operation(summary = "Most read stories")
    @GetMapping("/trending")
    public List<NewsResponse> trending() {
        return newsService.trending();
    }

    @Operation(summary = "All categories in use")
    @GetMapping("/categories")
    public List<String> categories() {
        return newsService.categories();
    }

    @Operation(summary = "Read one article (counts a view)")
    @GetMapping("/{id}")
    public NewsResponse get(@PathVariable Long id) {
        return newsService.read(id);
    }

    @Operation(summary = "More stories from the same category")
    @GetMapping("/{id}/related")
    public List<NewsResponse> related(@PathVariable Long id) {
        return newsService.related(id);
    }

    @Operation(summary = "Publish an article (ADMIN / EDITOR)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NewsResponse create(@Valid @RequestBody NewsRequest request) {
        return newsService.create(request);
    }

    @Operation(summary = "Edit an article (ADMIN / EDITOR)")
    @PutMapping("/{id}")
    public NewsResponse update(@PathVariable Long id, @Valid @RequestBody NewsRequest request) {
        return newsService.update(id, request);
    }

    @Operation(summary = "Delete an article (ADMIN / EDITOR)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        newsService.delete(id);
    }
}
