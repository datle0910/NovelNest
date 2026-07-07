package com.example.storyservice.crawler.dto;

import com.example.storyservice.story.StoryStatus;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawledStoryDto {
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private String authorName;
    private StoryStatus status;
    @Builder.Default
    private List<String> categories = new ArrayList<>();
    private String sourceName;
    private String sourceUrl;
    private String licenseName;
    private String attribution;
    @Builder.Default
    private List<CrawledChapterDto> chapters = new ArrayList<>();
}
