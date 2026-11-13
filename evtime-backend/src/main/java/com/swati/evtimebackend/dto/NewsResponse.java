package com.swati.evtimebackend.dto;

import com.swati.evtimebackend.entity.News;

import java.time.Instant;

public record NewsResponse(
        Long id,
        String title,
        String description,
        String content,
        String imageUrl,
        String category,
        String author,
        boolean featured,
        long views,
        Instant createdAt,
        Instant updatedAt) {

    public static NewsResponse from(News n) {
        return new NewsResponse(
                n.getId(),
                n.getTitle(),
                n.getDescription(),
                n.getContent(),
                n.getImageUrl(),
                n.getCategory(),
                n.getAuthor(),
                Boolean.TRUE.equals(n.getFeatured()),
                n.getViews() == null ? 0L : n.getViews(),
                n.getCreatedAt(),
                n.getUpdatedAt());
    }
}
