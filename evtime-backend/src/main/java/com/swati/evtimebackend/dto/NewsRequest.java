package com.swati.evtimebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewsRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @Size(max = 50000, message = "Content must be at most 50000 characters")
        String content,

        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String imageUrl,

        @NotBlank(message = "Category is required")
        @Size(max = 50, message = "Category must be at most 50 characters")
        String category,

        @Size(max = 100, message = "Author must be at most 100 characters")
        String author,

        Boolean featured) {
}
