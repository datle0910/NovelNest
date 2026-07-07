package com.example.storyservice.story.dto;

import com.example.storyservice.author.dto.AuthorResponse;
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
public class StoryDetailResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private AuthorResponse author;
    private String status;
    private Long viewCount;
    private Boolean display;
    private List<String> categories;
    private int totalChapters;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
