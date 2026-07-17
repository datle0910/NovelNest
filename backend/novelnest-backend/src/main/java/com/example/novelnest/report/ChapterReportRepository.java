package com.example.novelnest.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChapterReportRepository extends JpaRepository<ChapterReport, Long> {
    Page<ChapterReport> findByStatus(ReportStatus status, Pageable pageable);
}
