package com.example.storyservice.history.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryResponse {
    private Long id;
    private Long storyId;
    private String storyTitle;
    private String storySlug;
    private String coverImage;
    private Long chapterId;
    private String chapterTitle;
    private Integer chapterNumber;
    private LocalDateTime lastReadAt;
}
