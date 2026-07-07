package com.example.storyservice.rating;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.rating.dto.RatingRequest;
import com.example.storyservice.rating.dto.RatingSummaryResponse;
import com.example.storyservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories/{storyId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> submitRating(
            @PathVariable Long storyId, @RequestBody RatingRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ratingService.submitRating(userId, storyId, request);
        return ResponseEntity.ok(ApiResponse.success("Rating submitted successfully", null));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMyRating(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ratingService.deleteMyRating(userId, storyId);
        return ResponseEntity.ok(ApiResponse.success("Rating deleted successfully", null));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<RatingSummaryResponse>> getRatingSummary(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId(); // Can be null if not authenticated
        RatingSummaryResponse response = ratingService.getRatingSummary(storyId, userId);
        return ResponseEntity.ok(ApiResponse.success("Get rating summary successfully", response));
    }
}
