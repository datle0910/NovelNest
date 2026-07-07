package com.example.storyservice.favorite;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.common.PageResponse;
import com.example.storyservice.favorite.dto.FavoriteStatusResponse;
import com.example.storyservice.security.SecurityUtils;
import com.example.storyservice.story.dto.StoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FavoriteStatusResponse>> toggleFavorite(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FavoriteStatusResponse response = favoriteService.toggleFavorite(userId, storyId);
        return ResponseEntity.ok(ApiResponse.success("Favorite status updated successfully", response));
    }

    @DeleteMapping("/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.removeFavorite(userId, storyId);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites successfully", null));
    }

    @GetMapping("/me/{storyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FavoriteStatusResponse>> getFavoriteStatus(@PathVariable Long storyId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FavoriteStatusResponse response = favoriteService.getFavoriteStatus(userId, storyId);
        return ResponseEntity.ok(ApiResponse.success("Get favorite status successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<StoryResponse>>> getUserFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        PageResponse<StoryResponse> response = favoriteService.getUserFavorites(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get favorite stories successfully", response));
    }
}
