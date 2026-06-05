package com.swati.evtimebackend.service;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.repository.NewsRepository;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public Page<News> getAllNews(
            int page,
            int size,
            String sortBy,
            String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );

        return newsRepository.findAll(pageable);
    }
    public News createNews(News news) {
        return newsRepository.save(news);
    }

    // get by id ka func
    public Optional<News> getNewsById(Long id) {
        return newsRepository.findById(id);
    }
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    // Update ke liye
    public News updateNews(Long id, News updatedNews) {

        News news = newsRepository.findById(id).orElse(null);

        if (news != null) {
            news.setTitle(updatedNews.getTitle());
            news.setDescription(updatedNews.getDescription());
            news.setAuthor(updatedNews.getAuthor());
            news.setCategory(updatedNews.getCategory());
            news.setImageUrl(updatedNews.getImageUrl());

            return newsRepository.save(news);
        }

        return null;
    }
    public List<News> searchNews(String keyword) {
        return newsRepository.findByTitleContainingIgnoreCase(keyword);
    }
}