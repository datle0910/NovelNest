package com.example.storyservice.report;

import com.example.storyservice.report.dto.ChapterReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ChapterReportAdminController {

    private final ChapterReportService reportService;
    private final AdminNotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<ChapterReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getReports(status, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam ReportStatus status) {
        reportService.updateReportStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        return notificationService.subscribe();
    }
}
