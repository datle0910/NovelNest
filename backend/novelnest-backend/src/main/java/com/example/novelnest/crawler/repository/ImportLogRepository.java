package com.example.novelnest.crawler.repository;

import com.example.novelnest.crawler.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportLogRepository extends JpaRepository<ImportLog, Long> {
}
