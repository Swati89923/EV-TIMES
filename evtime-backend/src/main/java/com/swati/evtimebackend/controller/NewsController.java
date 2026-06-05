package com.swati.evtimebackend.controller;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.service.NewsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import jakarta.validation.Valid;
import java.util.List;

@RestController
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/news")
    public List<News> getAllNews() {
        return newsService.getAllNews();
    }

    @PostMapping("/news/create")
    public News createNews(@Valid @RequestBody News news) {
        return newsService.createNews(news);
    }

    @GetMapping("/news/{id}")
    public Optional<News>  getNewsById(@PathVariable long id){
        return newsService.getNewsById(id);
    }
    @PutMapping("/news/update/{id}")
    public News updateNews(@PathVariable Long id,@RequestBody News news){
        return newsService.updateNews(id, news);
    }
    @DeleteMapping("/news/delete/{id}")
    public String deleteNews(@PathVariable Long id){
        newsService.deleteNews(id);
        return "News deleted successfully";
    }
}