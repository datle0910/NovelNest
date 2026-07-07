package com.example.storyservice.story;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.common.PageResponse;
import com.example.storyservice.story.dto.StoryRequest;
import com.example.storyservice.story.dto.StoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stories")
@RequiredArgsConstructor
public class StoryAdminController {

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
        return ResponseEntity.ok(ApiResponse.success("Get stories successfully", storyService.getAllStories(pageable, true)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> searchStories(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(ApiResponse.success("Search stories successfully", storyService.searchStories(keyword, pageable, true)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(@Valid @RequestBody StoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Create story successfully", storyService.createStory(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StoryResponse>> updateStory(@PathVariable Long id, @Valid @RequestBody StoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Update story successfully", storyService.updateStory(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return ResponseEntity.ok(ApiResponse.success("Delete story successfully", null));
    }

    @PatchMapping("/{id}/display")
    public ResponseEntity<ApiResponse<Void>> toggleDisplay(@PathVariable Long id, @RequestParam boolean display) {
        storyService.toggleDisplay(id, display);
        return ResponseEntity.ok(ApiResponse.success("Update display status successfully", null));
    }

    @PostMapping("/{id}/generate-cover")
    public ResponseEntity<ApiResponse<StoryResponse>> generateAiCover(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Generate AI cover successfully", storyService.generateAiCover(id)));
    }
}
