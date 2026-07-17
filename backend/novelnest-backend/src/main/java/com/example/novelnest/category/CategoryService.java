package com.example.novelnest.category;

import com.example.novelnest.category.dto.CategoryRequest;
import com.example.novelnest.category.dto.CategoryResponse;
import com.example.novelnest.common.SlugUtils;
import com.example.novelnest.exception.BadRequestException;
import com.example.novelnest.exception.ResourceNotFoundException;
import com.example.novelnest.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final StoryRepository storyRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public Category findBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String slug = generateUniqueSlug(request.getName());

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);

        if (!category.getName().equals(request.getName())) {
            category.setSlug(generateUniqueSlug(request.getName()));
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        log.info("Category updated: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findById(id);

        if (storyRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Cannot delete category because it is being used by stories");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtils.toSlug(name);
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    public CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
