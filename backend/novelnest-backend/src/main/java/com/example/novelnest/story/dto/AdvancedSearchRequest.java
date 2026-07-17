package com.example.novelnest.story.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvancedSearchRequest {
    private String keyword;
    private List<Long> includeCategoryIds;
    private List<Long> excludeCategoryIds;
    private String status;
}
