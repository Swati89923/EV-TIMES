package com.swati.evtimebackend.service;

import com.swati.evtimebackend.dto.NewsRequest;
import com.swati.evtimebackend.dto.NewsResponse;
import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.exception.ResourceNotFoundException;
import com.swati.evtimebackend.repository.BookmarkRepository;
import com.swati.evtimebackend.repository.NewsRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class NewsService {

    static final int MAX_PAGE_SIZE = 50;
    private static final Set<String> SORTABLE = Set.of("createdAt", "views", "title", "id");
    private static final int FEATURED_LIMIT = 5;
    private static final int TRENDING_LIMIT = 5;
    private static final int RELATED_LIMIT = 4;

    private final NewsRepository newsRepository;
    private final BookmarkRepository bookmarkRepository;

    public NewsService(NewsRepository newsRepository, BookmarkRepository bookmarkRepository) {
        this.newsRepository = newsRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    @Transactional(readOnly = true)
    public Page<NewsResponse> list(
            int page, int size, String sortBy, String direction, String category, String q) {

        String sortField = SORTABLE.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();
        // stable ordering for equal values
        if (!"id".equals(sortField)) {
            sort = sort.and(Sort.by("id").descending());
        }

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                sort);

        return newsRepository.findAll(filter(category, q), pageable).map(NewsResponse::from);
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> featured() {
        Pageable top = PageRequest.of(0, FEATURED_LIMIT);
        List<News> featured = newsRepository.findByFeaturedTrueOrderByCreatedAtDesc(top);
        if (featured.isEmpty()) {
            // nothing flagged yet: show the latest stories so the front page is never empty
            featured = newsRepository.findAllByOrderByCreatedAtDesc(top);
        }
        return featured.stream().map(NewsResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> trending() {
        return newsRepository.findTrending(PageRequest.of(0, TRENDING_LIMIT))
                .stream().map(NewsResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<String> categories() {
        return newsRepository.findDistinctCategories();
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> related(Long id) {
        News news = find(id);
        return newsRepository
                .findByCategoryIgnoreCaseAndIdNotOrderByCreatedAtDesc(
                        news.getCategory(), id, PageRequest.of(0, RELATED_LIMIT))
                .stream().map(NewsResponse::from).toList();
    }

    /** Returns the article and counts the read. */
    @Transactional
    public NewsResponse read(Long id) {
        News news = find(id);
        newsRepository.incrementViews(id);
        long views = (news.getViews() == null ? 0L : news.getViews()) + 1;
        NewsResponse r = NewsResponse.from(news);
        return new NewsResponse(r.id(), r.title(), r.description(), r.content(), r.imageUrl(),
                r.category(), r.author(), r.featured(), views, r.createdAt(), r.updatedAt());
    }

    @Transactional
    public NewsResponse create(NewsRequest request) {
        News news = new News();
        apply(news, request);
        return NewsResponse.from(newsRepository.save(news));
    }

    @Transactional
    public NewsResponse update(Long id, NewsRequest request) {
        News news = find(id);
        apply(news, request);
        return NewsResponse.from(newsRepository.save(news));
    }

    @Transactional
    public void delete(Long id) {
        News news = find(id);
        bookmarkRepository.deleteByNewsId(id);
        newsRepository.delete(news);
    }

    private News find(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News not found with id " + id));
    }

    private static void apply(News news, NewsRequest r) {
        news.setTitle(r.title().trim());
        news.setDescription(r.description().trim());
        news.setContent(blankToNull(r.content()));
        news.setImageUrl(blankToNull(r.imageUrl()));
        news.setCategory(r.category().trim());
        news.setAuthor(blankToNull(r.author()));
        news.setFeatured(Boolean.TRUE.equals(r.featured()));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static Specification<News> filter(String category, String q) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("category")),
                        category.trim().toLowerCase(Locale.ROOT)));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like, '\\'),
                        cb.like(cb.lower(root.get("description")), like, '\\')));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
