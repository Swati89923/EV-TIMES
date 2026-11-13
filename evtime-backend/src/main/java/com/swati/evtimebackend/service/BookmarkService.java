package com.swati.evtimebackend.service;

import com.swati.evtimebackend.dto.NewsResponse;
import com.swati.evtimebackend.entity.Bookmark;
import com.swati.evtimebackend.entity.User;
import com.swati.evtimebackend.exception.ApiException;
import com.swati.evtimebackend.exception.ResourceNotFoundException;
import com.swati.evtimebackend.repository.BookmarkRepository;
import com.swati.evtimebackend.repository.NewsRepository;
import com.swati.evtimebackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final NewsRepository newsRepository;
    private final UserRepository userRepository;

    public BookmarkService(
            BookmarkRepository bookmarkRepository,
            NewsRepository newsRepository,
            UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.newsRepository = newsRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> list(String email) {
        User user = user(email);
        return bookmarkRepository.findAllWithNews(user.getId()).stream()
                .map(b -> NewsResponse.from(b.getNews()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Long> ids(String email) {
        return bookmarkRepository.findNewsIds(user(email).getId());
    }

    /** Idempotent: bookmarking twice keeps a single row. */
    @Transactional
    public void add(String email, Long newsId) {
        User user = user(email);
        var news = newsRepository.findById(newsId)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id " + newsId));
        if (bookmarkRepository.existsByUserIdAndNewsId(user.getId(), newsId)) {
            return;
        }
        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setNews(news);
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void remove(String email, Long newsId) {
        bookmarkRepository.deleteByUserAndNews(user(email).getId(), newsId);
    }

    private User user(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "Account no longer exists. Please log in again."));
    }
}
