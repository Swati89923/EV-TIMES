package com.swati.evtimebackend.repository;

import com.swati.evtimebackend.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {

}