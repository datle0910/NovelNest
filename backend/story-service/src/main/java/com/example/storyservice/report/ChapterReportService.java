package com.example.storyservice.report;

import com.example.storyservice.chapter.Chapter;
import com.example.storyservice.chapter.ChapterRepository;
import com.example.storyservice.report.dto.ChapterReportRequest;
import com.example.storyservice.report.dto.ChapterReportResponse;
import com.example.storyservice.websocket.AdminWebSocketSessionRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterReportService {

    private final ChapterReportRepository reportRepository;
    private final ChapterRepository chapterRepository;
    private final AdminWebSocketSessionRegistry webSocketRegistry;

    public void submitReport(Long chapterId, ChapterReportRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));

        String reasons = request.getReasons() != null ? String.join(", ", request.getReasons()) : "";

        ChapterReport report = ChapterReport.builder()
                .chapter(chapter)
                .reasons(reasons)
                .details(request.getDetails())
                .status(ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);

        // Push event to all connected admin WebSocket clients
        ChapterReportResponse responseDto = mapToResponse(report);
        webSocketRegistry.broadcast(responseDto);
    }

    public Page<ChapterReportResponse> getReports(ReportStatus status, Pageable pageable) {
        if (status != null) {
            return reportRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }
        return reportRepository.findAll(pageable).map(this::mapToResponse);
    }

    public void updateReportStatus(Long reportId, ReportStatus status) {
        ChapterReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        reportRepository.save(report);
    }

    private ChapterReportResponse mapToResponse(ChapterReport report) {
        Chapter chapter = report.getChapter();
        return ChapterReportResponse.builder()
                .id(report.getId())
                .chapterId(chapter.getId())
                .storyTitle(chapter.getStory().getTitle())
                .storySlug(chapter.getStory().getSlug())
                .chapterTitle(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .reasons(report.getReasons() != null && !report.getReasons().isEmpty() ? java.util.Arrays.asList(report.getReasons().split(", ")) : java.util.Collections.emptyList())
                .details(report.getDetails())
                .status(report.getStatus().name())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
