package com.swati.evtimebackend.repository;

import com.swati.evtimebackend.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    @Query("select b from Bookmark b join fetch b.news "
            + "where b.user.id = :userId order by b.createdAt desc")
    List<Bookmark> findAllWithNews(@Param("userId") Long userId);

    @Query("select b.news.id from Bookmark b where b.user.id = :userId")
    List<Long> findNewsIds(@Param("userId") Long userId);

    boolean existsByUserIdAndNewsId(Long userId, Long newsId);

    @Modifying
    @Query("delete from Bookmark b where b.user.id = :userId and b.news.id = :newsId")
    void deleteByUserAndNews(@Param("userId") Long userId, @Param("newsId") Long newsId);

    @Modifying
    @Query("delete from Bookmark b where b.news.id = :newsId")
    void deleteByNewsId(@Param("newsId") Long newsId);
}
