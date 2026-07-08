package com.example.storyservice.crawler.dto;

import com.example.storyservice.crawler.ImportMode;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawlRequest {
    private String source;
    private ImportMode mode;
    private String categoryUrl;
    private String storyUrl;
    private String keyword;
    
    @Builder.Default
    private Integer maxStories = 10;
    
    @Builder.Default
    private Integer maxChaptersPerStory = 3;
    
    @Builder.Default
    private Boolean dryRun = true;
    
    private Long targetStoryId;
}
