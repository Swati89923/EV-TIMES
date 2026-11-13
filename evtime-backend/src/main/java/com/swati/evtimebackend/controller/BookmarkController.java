package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.dto.NewsResponse;
import com.swati.evtimebackend.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@Tag(name = "Bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @Operation(summary = "Articles saved by the current user")
    @GetMapping
    public List<NewsResponse> list(Authentication auth) {
        return bookmarkService.list(auth.getName());
    }

    @Operation(summary = "Ids of articles saved by the current user")
    @GetMapping("/ids")
    public List<Long> ids(Authentication auth) {
        return bookmarkService.ids(auth.getName());
    }

    @Operation(summary = "Save an article")
    @PostMapping("/{newsId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@PathVariable Long newsId, Authentication auth) {
        bookmarkService.add(auth.getName(), newsId);
    }

    @Operation(summary = "Remove a saved article")
    @DeleteMapping("/{newsId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long newsId, Authentication auth) {
        bookmarkService.remove(auth.getName(), newsId);
    }
}
