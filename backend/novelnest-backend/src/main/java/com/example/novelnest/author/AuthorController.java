package com.example.novelnest.author;

import com.example.novelnest.author.dto.AuthorResponse;
import com.example.novelnest.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuthorResponse>>> getAllAuthors() {
        return ResponseEntity.ok(ApiResponse.success("Get all authors successfully", authorService.getAllAuthors()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthorResponse>> getAuthorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Get author successfully", authorService.mapToResponse(authorService.findById(id))));
    }
}
