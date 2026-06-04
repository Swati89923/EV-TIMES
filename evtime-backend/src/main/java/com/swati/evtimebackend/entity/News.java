package com.swati.evtimebackend.entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;

    private String imageUrl;

    @NotBlank(message = "Category is required")
    private String category;

    private String author;
}