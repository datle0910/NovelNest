package com.example.novelnest.report.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ChapterReportResponse {
    private Long id;
    private Long chapterId;
    private String storyTitle;
    private String chapterTitle;
    private Integer chapterNumber;
    private String storySlug;
    private List<String> reasons;
    private String details;
    private String status;
    private LocalDateTime createdAt;
}
