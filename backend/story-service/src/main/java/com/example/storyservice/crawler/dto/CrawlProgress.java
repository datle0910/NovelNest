package com.example.storyservice.crawler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlProgress {
    private Long logId;
    private String status; // IN_PROGRESS, COMPLETED, FAILED
    private int currentChapter;
    private int totalChapters;
    private String message;

    public int getPercentage() {
        if (totalChapters <= 0) return 0;
        return (int) (((double) currentChapter / totalChapters) * 100);
    }
}
