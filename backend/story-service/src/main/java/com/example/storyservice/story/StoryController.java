package com.example.storyservice.story;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.common.PageResponse;
import com.example.storyservice.story.dto.StoryDetailResponse;
import com.example.storyservice.story.dto.StoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "updatedAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));
        return ResponseEntity.ok(ApiResponse.success("Get stories successfully", storyService.getAllStories(pageable, false)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> searchStories(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(ApiResponse.success("Search stories successfully", storyService.searchStories(keyword, pageable, false)));
    }

    @GetMapping("/category/{categorySlug}")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getStoriesByCategory(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(ApiResponse.success("Get stories by category successfully", storyService.getStoriesByCategory(categorySlug, pageable, false)));
    }

    @GetMapping("/{storySlug}")
    public ResponseEntity<ApiResponse<StoryDetailResponse>> getStoryBySlug(@PathVariable String storySlug) {
        return ResponseEntity.ok(ApiResponse.success("Get story successfully", storyService.getStoryBySlug(storySlug, false)));
    }

    @GetMapping("/trending/week")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getTrendingWeekly(
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "viewCountWeek"));
        return ResponseEntity.ok(ApiResponse.success("Get weekly trending stories successfully", storyService.getTrendingWeekly(pageable)));
    }

    @GetMapping("/trending/top")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getTopTrending(
            @RequestParam(defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "ratingAvg", "viewCount"));
        return ResponseEntity.ok(ApiResponse.success("Get top trending stories successfully", storyService.getTopTrending(pageable)));
    }

    @GetMapping("/trending/month")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getTopViewsMonthly(
            @RequestParam(defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "viewCountMonth"));
        return ResponseEntity.ok(ApiResponse.success("Get monthly top views stories successfully", storyService.getTopViewsMonthly(pageable)));
    }
}
