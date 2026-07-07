package com.example.storyservice.crawler;

import com.example.storyservice.common.ApiResponse;
import com.example.storyservice.crawler.dto.CrawlRequest;
import com.example.storyservice.crawler.dto.CrawledStoryDto;
import com.example.storyservice.crawler.entity.ImportLog;
import com.example.storyservice.crawler.repository.ImportLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
public class CrawlerController {

    private final CrawlerService crawlerService;
    private final ImportLogRepository importLogRepository;



    @PostMapping("/story-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importStoryByUrl(@RequestBody CrawlRequest request) {
        try {
            ImportLog log = crawlerService.importStoryByUrl(request);
            return ResponseEntity.ok(ApiResponse.success("Import processed", Map.of(
                    "source", log.getSourceName(),
                    "totalFound", log.getTotalFound(),
                    "totalImported", log.getTotalImported(),
                    "totalSkipped", log.getTotalSkipped(),
                    "totalFailed", log.getTotalFailed(),
                    "logId", log.getId() != null ? log.getId() : -1
            )));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ImportLog>>> getLogs(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Logs loaded", importLogRepository.findAll(pageable)));
    }

    @GetMapping("/logs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImportLog>> getLogDetail(@PathVariable Long id) {
        return importLogRepository.findById(id)
                .map(log -> ResponseEntity.ok(ApiResponse.success("Log loaded", log)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/logs/{id}/progress")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.example.storyservice.crawler.dto.CrawlProgress>> getLogProgress(@PathVariable Long id) {
        com.example.storyservice.crawler.dto.CrawlProgress progress = crawlerService.getProgress(id);
        if (progress == null) {
            // If not in map, might be finished or not started
            return importLogRepository.findById(id).map(log -> {
                com.example.storyservice.crawler.dto.CrawlProgress fallback = com.example.storyservice.crawler.dto.CrawlProgress.builder()
                        .logId(log.getId())
                        .status(log.getStatus())
                        .message(log.getMessage())
                        .totalChapters(0)
                        .currentChapter(0)
                        .build();
                return ResponseEntity.ok(ApiResponse.success("Progress loaded", fallback));
            }).orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(ApiResponse.success("Progress loaded", progress));
    }
}
