package com.example.novelnest.report;

import com.example.novelnest.report.dto.ChapterReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterReportController {

    private final ChapterReportService reportService;

    @PostMapping("/{chapterId}/reports")
    public ResponseEntity<Void> submitReport(
            @PathVariable Long chapterId,
            @RequestBody ChapterReportRequest request) {
        reportService.submitReport(chapterId, request);
        return ResponseEntity.ok().build();
    }
}
