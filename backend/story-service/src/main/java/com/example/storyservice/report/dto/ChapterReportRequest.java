package com.example.storyservice.report.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChapterReportRequest {
    private List<String> reasons;
    private String details;
}
