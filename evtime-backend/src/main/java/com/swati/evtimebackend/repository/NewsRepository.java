package com.swati.evtimebackend.repository;

import com.swati.evtimebackend.entity.News;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsRepository
        extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    List<News> findByFeaturedTrueOrderByCreatedAtDesc(Pageable pageable);

    List<News> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("select n from News n order by coalesce(n.views, 0) desc, n.createdAt desc")
    List<News> findTrending(Pageable pageable);

    @Query("select distinct n.category from News n order by n.category")
    List<String> findDistinctCategories();

    List<News> findByCategoryIgnoreCaseAndIdNotOrderByCreatedAtDesc(
            String category, Long id, Pageable pageable);

    @Modifying
    @Query("update News n set n.views = coalesce(n.views, 0) + 1 where n.id = :id")
    int incrementViews(@Param("id") Long id);
}
