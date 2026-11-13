package com.swati.evtimebackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    /** Short summary shown on cards. */
    @Column(nullable = false, length = 500)
    private String description;

    /** Full article body, paragraphs separated by blank lines. */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 100)
    private String author;

    private Boolean featured = false;

    private Long views = 0L;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = createdAt;
        if (featured == null) featured = false;
        if (views == null) views = 0L;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
