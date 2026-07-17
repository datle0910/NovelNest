package com.example.novelnest.report.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChapterReportRequest {
    private List<String> reasons;
    private String details;
}
