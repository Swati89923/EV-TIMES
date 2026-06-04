package com.swati.evtimebackend.service;


import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.repository.NewsRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public List<News> getAllNews() {
        return newsRepository.findAll();
    }

    public News createNews(News news) {
        return newsRepository.save(news);
    }
}