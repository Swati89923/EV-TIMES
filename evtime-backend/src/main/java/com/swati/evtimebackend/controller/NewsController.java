package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.service.NewsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public Page<News> getAllNews(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return newsService.getAllNews(
                page,
                size,
                sortBy,
                direction
        );
    }

    @GetMapping("/search")
    public List<News> searchNews(
            @RequestParam String keyword) {

        return newsService.searchNews(keyword);
    }

    @PostMapping
    public News createNews(
            @Valid @RequestBody News news) {

        return newsService.createNews(news);
    }

    @GetMapping("/{id}")
    public News getNewsById(
            @PathVariable Long id) {

        return newsService.getNewsById(id);
    }

    @PutMapping("/{id}")
    public News updateNews(
            @PathVariable Long id,
            @RequestBody News news) {

        return newsService.updateNews(id, news);
    }

    @DeleteMapping("/{id}")
    public String deleteNews(
            @PathVariable Long id) {

        newsService.deleteNews(id);

        return "News deleted successfully";
    }
    @GetMapping("/category/{category}")
    public List<News> getNewsByCategory(
            @PathVariable String category){

        return newsService
                .getNewsByCategory(category);
    }
    @GetMapping("/filter")
    public List<News> filterNews(

            @RequestParam String category,

            @RequestParam String keyword) {

        return newsService.filterNews(
                category, keyword
                
        );
    }

}
