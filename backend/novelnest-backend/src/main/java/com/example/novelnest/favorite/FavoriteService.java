package com.example.novelnest.favorite;

import com.example.novelnest.common.PageResponse;
import com.example.novelnest.exception.ResourceNotFoundException;
import com.example.novelnest.favorite.dto.FavoriteStatusResponse;
import com.example.novelnest.story.Story;
import com.example.novelnest.story.StoryRepository;
import com.example.novelnest.story.dto.StoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final StoryRepository storyRepository;

    @Transactional
    public FavoriteStatusResponse toggleFavorite(Long userId, Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story not found");
        }

        Optional<Favorite> favoriteOpt = favoriteRepository.findByUserIdAndStoryId(userId, storyId);
        boolean favorited;
        if (favoriteOpt.isPresent()) {
            favoriteRepository.delete(favoriteOpt.get());
            favorited = false;
        } else {
            Favorite favorite = Favorite.builder()
                    .userId(userId)
                    .storyId(storyId)
                    .build();
            favoriteRepository.save(favorite);
            favorited = true;
        }

        return FavoriteStatusResponse.builder()
                .storyId(storyId)
                .favorited(favorited)
                .build();
    }

    @Transactional
    public void removeFavorite(Long userId, Long storyId) {
        favoriteRepository.deleteByUserIdAndStoryId(userId, storyId);
    }

    public FavoriteStatusResponse getFavoriteStatus(Long userId, Long storyId) {
        boolean favorited = favoriteRepository.findByUserIdAndStoryId(userId, storyId).isPresent();
        return FavoriteStatusResponse.builder()
                .storyId(storyId)
                .favorited(favorited)
                .build();
    }

    public PageResponse<StoryResponse> getUserFavorites(Long userId, int page, int size) {
        Page<Favorite> favoritePage = favoriteRepository.findByUserId(
                userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<StoryResponse> storyResponses = favoritePage.getContent().stream()
                .map(fav -> {
                    Story story = storyRepository.findById(fav.getStoryId())
                            .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
                    List<String> categories = story.getCategories().stream()
                            .map(c -> c.getName())
                            .collect(Collectors.toList());
                    return StoryResponse.builder()
                            .id(story.getId())
                            .title(story.getTitle())
                            .slug(story.getSlug())
                            .description(story.getDescription())
                            .coverImage(story.getCoverImage())
                            .authorName(story.getAuthor().getName())
                            .status(story.getStatus().name())
                            .viewCount(story.getViewCount())
                            .totalChapters(story.getChapters().size())
                            .categories(categories)
                            .createdAt(story.getCreatedAt())
                            .updatedAt(story.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.<StoryResponse>builder()
                .content(storyResponses)
                .page(favoritePage.getNumber())
                .size(favoritePage.getSize())
                .totalElements(favoritePage.getTotalElements())
                .totalPages(favoritePage.getTotalPages())
                .last(favoritePage.isLast())
                .build();
    }
}
