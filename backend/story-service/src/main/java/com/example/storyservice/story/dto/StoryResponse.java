package com.example.storyservice.story.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private String authorName;
    private String status;
    private Long viewCount;
    private int totalChapters;
    private Boolean display;
    private List<String> categories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
