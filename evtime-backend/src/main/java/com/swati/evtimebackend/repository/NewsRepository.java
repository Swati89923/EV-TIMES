package com.swati.evtimebackend.repository;

import com.swati.evtimebackend.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NewsRepository
        extends JpaRepository<News, Long> {

    List<News> findByTitleContainingIgnoreCase(String keyword);

    List<News> findByCategoryIgnoreCase(String category);
    List<News> findByCategoryAndTitleContainingIgnoreCase(
            String category,
            String keyword
    );
}


