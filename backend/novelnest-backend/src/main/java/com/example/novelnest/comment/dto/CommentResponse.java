package com.example.novelnest.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long storyId;
    private Long chapterId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
