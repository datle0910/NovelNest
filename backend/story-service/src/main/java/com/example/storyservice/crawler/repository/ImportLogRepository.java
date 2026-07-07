package com.example.storyservice.crawler.repository;

import com.example.storyservice.crawler.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportLogRepository extends JpaRepository<ImportLog, Long> {
}
