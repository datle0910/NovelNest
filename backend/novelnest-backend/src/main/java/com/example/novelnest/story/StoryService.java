package com.example.novelnest.story;

import com.example.novelnest.author.Author;
import com.example.novelnest.author.AuthorService;
import com.example.novelnest.author.dto.AuthorResponse;
import com.example.novelnest.category.Category;
import com.example.novelnest.category.CategoryService;
import com.example.novelnest.chapter.ChapterRepository;
import com.example.novelnest.common.PageResponse;
import com.example.novelnest.common.SlugUtils;
import com.example.novelnest.exception.BadRequestException;
import com.example.novelnest.exception.ResourceNotFoundException;
import com.example.novelnest.story.dto.StoryDetailResponse;
import com.example.novelnest.story.dto.StoryRequest;
import com.example.novelnest.story.dto.StoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final AuthorService authorService;
    private final CategoryService categoryService;
    private final com.example.novelnest.ai.AIService aiService;
    private final com.example.novelnest.image.ImageService imageService;

    @Transactional
    public StoryResponse generateAiCover(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + id));

        java.util.List<String> categoryNames = story.getCategories().stream()
                .map(Category::getName)
                .collect(Collectors.toList());
                
        String uploadedSecureUrl = aiService.generateAndUploadStoryCover(story.getTitle(), story.getDescription(), categoryNames);
        
        if (uploadedSecureUrl != null) {
            story.setCoverImage(uploadedSecureUrl);
            storyRepository.save(story);
            log.info("Successfully generated and uploaded AI cover for story: {}", story.getTitle());
        } else {
            throw new RuntimeException("Failed to generate AI cover from service");
        }
        
        int totalChapters = chapterRepository.countByStoryId(story.getId());
        return mapToResponse(story, totalChapters);
    }

    public PageResponse<StoryResponse> getAllStories(Pageable pageable, boolean includeHidden) {
        Page<Story> page = includeHidden ? storyRepository.findAll(pageable) : storyRepository.findByDisplayTrue(pageable);
        return buildPageResponse(page);
    }

    public PageResponse<StoryResponse> searchStories(String keyword, Pageable pageable, boolean includeHidden) {
        Page<Story> page = includeHidden ? storyRepository.searchByTitle(keyword, pageable) : storyRepository.searchByTitleAndDisplayTrue(keyword, pageable);
        return buildPageResponse(page);
    }

    public PageResponse<StoryResponse> getStoriesByCategory(String categorySlug, Pageable pageable, boolean includeHidden) {
        Page<Story> page = includeHidden ? storyRepository.findByCategorySlug(categorySlug, pageable) : storyRepository.findByCategorySlugAndDisplayTrue(categorySlug, pageable);
        return buildPageResponse(page);
    }

    public PageResponse<StoryResponse> advancedSearch(
            com.example.novelnest.story.dto.AdvancedSearchRequest request,
            Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Story> spec = StorySpecification.advancedFilter(
                request.getKeyword(),
                request.getIncludeCategoryIds(),
                request.getExcludeCategoryIds(),
                request.getStatus()
        );
        Page<Story> page = storyRepository.findAll(spec, pageable);
        return buildPageResponse(page);
    }

    @Transactional
    public StoryDetailResponse getStoryBySlug(String slug, boolean includeHidden) {
        Story story = includeHidden ? 
            storyRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Story not found")) :
            storyRepository.findBySlugAndDisplayTrue(slug).orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        // Update view counts using Hibernate dirty checking
        story.setViewCount(story.getViewCount() + 1);
        story.setViewCountWeek(story.getViewCountWeek() != null ? story.getViewCountWeek() + 1 : 1);
        story.setViewCountMonth(story.getViewCountMonth() != null ? story.getViewCountMonth() + 1 : 1);

        int totalChapters = chapterRepository.countByStoryId(story.getId());

        return mapToDetailResponse(story, totalChapters);
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request) {
        // Validate status
        StoryStatus status;
        try {
            status = StoryStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus() + ". Valid values: ONGOING, COMPLETED, PAUSED");
        }

        Author author = authorService.findById(request.getAuthorId());

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null) {
            for (Long categoryId : request.getCategoryIds()) {
                categories.add(categoryService.findById(categoryId));
            }
        }

        String slug = generateUniqueSlug(request.getTitle());

        Story story = Story.builder()
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .author(author)
                .status(status)
                .categories(categories)
                .display(request.getDisplay() != null ? request.getDisplay() : true)
                .viewCount(0L)
                .viewCountWeek(0L)
                .viewCountMonth(0L)
                .build();

        Story saved = storyRepository.save(story);
        log.info("Story created: {}", saved.getTitle());
        return mapToResponse(saved, 0);
    }

    public PageResponse<StoryResponse> getTrendingWeekly(Pageable pageable) {
        // Here we could also filter by display = true for trending, but we assume pageable covers it via custom queries if needed, or we fetch all.
        // For simplicity, let's just use findByDisplayTrue here as well, because trending should only include displayed stories.
        Page<Story> page = storyRepository.findByDisplayTrue(pageable);
        return buildPageResponse(page);
    }

    public PageResponse<StoryResponse> getTopTrending(Pageable pageable) {
        Page<Story> page = storyRepository.findByDisplayTrue(pageable);
        return buildPageResponse(page);
    }

    public PageResponse<StoryResponse> getTopViewsMonthly(Pageable pageable) {
        Page<Story> page = storyRepository.findByDisplayTrue(pageable);
        return buildPageResponse(page);
    }

    @Transactional
    public StoryResponse updateStory(Long id, StoryRequest request) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + id));

        // Validate status
        StoryStatus status;
        try {
            status = StoryStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        Author author = authorService.findById(request.getAuthorId());

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null) {
            for (Long categoryId : request.getCategoryIds()) {
                categories.add(categoryService.findById(categoryId));
            }
        }

        if (!story.getTitle().equals(request.getTitle())) {
            story.setSlug(generateUniqueSlug(request.getTitle()));
        }

        story.setTitle(request.getTitle());
        story.setDescription(request.getDescription());
        story.setCoverImage(request.getCoverImage());
        story.setAuthor(author);
        story.setStatus(status);
        story.setCategories(categories);
        
        if (request.getDisplay() != null) {
            story.setDisplay(request.getDisplay());
        }

        Story saved = storyRepository.save(story);
        int totalChapters = chapterRepository.countByStoryId(saved.getId());
        log.info("Story updated: {}", saved.getTitle());
        return mapToResponse(saved, totalChapters);
    }

    @Transactional
    public void toggleDisplay(Long id, boolean display) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + id));
        story.setDisplay(display);
        log.info("Story {} display status changed to {}", story.getTitle(), display);
    }

    @Transactional
    public void deleteStory(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found with id: " + id));

        storyRepository.delete(story);
        log.info("Story deleted: {}", story.getTitle());
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = SlugUtils.toSlug(title);
        String slug = baseSlug;
        int counter = 1;
        while (storyRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private PageResponse<StoryResponse> buildPageResponse(Page<Story> page) {
        List<StoryResponse> content = page.getContent().stream()
                .map(story -> {
                    int totalChapters = chapterRepository.countByStoryId(story.getId());
                    return mapToResponse(story, totalChapters);
                })
                .collect(Collectors.toList());

        return PageResponse.<StoryResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private StoryResponse mapToResponse(Story story, int totalChapters) {
        return StoryResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .slug(story.getSlug())
                .description(story.getDescription())
                .coverImage(story.getCoverImage())
                .authorName(story.getAuthor() != null ? story.getAuthor().getName() : null)
                .status(story.getStatus().name())
                .viewCount(story.getViewCount())
                .totalChapters(totalChapters)
                .display(story.getDisplay())
                .categories(story.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()))
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }

    private StoryDetailResponse mapToDetailResponse(Story story, int totalChapters) {
        AuthorResponse authorResponse = null;
        if (story.getAuthor() != null) {
            authorResponse = authorService.mapToResponse(story.getAuthor());
        }

        return StoryDetailResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .slug(story.getSlug())
                .description(story.getDescription())
                .coverImage(story.getCoverImage())
                .author(authorResponse)
                .status(story.getStatus().name())
                .viewCount(story.getViewCount())
                .display(story.getDisplay())
                .categories(story.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()))
                .totalChapters(totalChapters)
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }
}
