package com.example.mediaservice.media;

import com.example.mediaservice.common.ApiResponse;
import com.example.mediaservice.media.dto.UploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success("Media Service is running", Map.of(
                "service", "media-service",
                "status", "OK"
        )));
    }

    @PostMapping("/upload/cover")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadCover(@RequestParam("file") MultipartFile file) {
        UploadResponse response = mediaService.uploadCover(file);
        return ResponseEntity.ok(ApiResponse.success("Upload cover successfully", response));
    }

    @PostMapping("/upload/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        UploadResponse response = mediaService.uploadAvatar(file);
        return ResponseEntity.ok(ApiResponse.success("Upload avatar successfully", response));
    }
}
