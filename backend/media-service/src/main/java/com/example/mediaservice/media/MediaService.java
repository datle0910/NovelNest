package com.example.mediaservice.media;

import com.example.mediaservice.exception.BadRequestException;
import com.example.mediaservice.media.dto.UploadResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp"
    );

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir, "covers"));
            Files.createDirectories(Paths.get(uploadDir, "avatars"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload folders!");
        }
    }

    public UploadResponse uploadCover(MultipartFile file) {
        return uploadFile(file, "covers");
    }

    public UploadResponse uploadAvatar(MultipartFile file) {
        return uploadFile(file, "avatars");
    }

    private UploadResponse uploadFile(MultipartFile file, String subDir) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, and WEBP are allowed");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = Paths.get(uploadDir, subDir, fileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // The file is served via /media/covers/filename.jpg or /media/avatars/filename.jpg
            String url = "http://localhost:8080/media/" + subDir + "/" + fileName;

            return UploadResponse.builder()
                    .fileName(fileName)
                    .url(url)
                    .contentType(contentType)
                    .size(file.getSize())
                    .build();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
