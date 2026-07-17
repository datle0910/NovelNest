package com.example.novelnest.crawler.repository;

import com.example.novelnest.crawler.entity.ImportSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImportSourceRepository extends JpaRepository<ImportSource, Long> {
    Optional<ImportSource> findByName(String name);
}
