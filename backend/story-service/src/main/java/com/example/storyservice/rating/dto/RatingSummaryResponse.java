package com.example.storyservice.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryResponse {
    private Long storyId;
    private Double averageRating;
    private Long ratingCount;
    private Integer myRating;
}
