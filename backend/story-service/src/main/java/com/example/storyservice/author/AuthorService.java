package com.example.storyservice.author;

import com.example.storyservice.author.dto.AuthorRequest;
import com.example.storyservice.author.dto.AuthorResponse;
import com.example.storyservice.common.SlugUtils;
import com.example.storyservice.exception.BadRequestException;
import com.example.storyservice.exception.ResourceNotFoundException;
import com.example.storyservice.story.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final StoryRepository storyRepository;

    public List<AuthorResponse> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Author findById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
    }

    @Transactional
    public AuthorResponse createAuthor(AuthorRequest request) {
        String slug = generateUniqueSlug(request.getName());

        Author author = Author.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .build();

        Author saved = authorRepository.save(author);
        log.info("Author created: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public AuthorResponse updateAuthor(Long id, AuthorRequest request) {
        Author author = findById(id);

        if (!author.getName().equals(request.getName())) {
            author.setSlug(generateUniqueSlug(request.getName()));
        }
        author.setName(request.getName());
        author.setDescription(request.getDescription());

        Author saved = authorRepository.save(author);
        log.info("Author updated: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAuthor(Long id) {
        Author author = findById(id);

        if (storyRepository.existsByAuthorId(id)) {
            throw new BadRequestException("Cannot delete author because it is being used by stories");
        }

        authorRepository.delete(author);
        log.info("Author deleted: {}", author.getName());
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtils.toSlug(name);
        String slug = baseSlug;
        int counter = 1;
        while (authorRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    public AuthorResponse mapToResponse(Author author) {
        return AuthorResponse.builder()
                .id(author.getId())
                .name(author.getName())
                .slug(author.getSlug())
                .description(author.getDescription())
                .createdAt(author.getCreatedAt())
                .updatedAt(author.getUpdatedAt())
                .build();
    }
}
