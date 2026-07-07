package com.example.storyservice.image;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImageFromUrl(String url, String folder) {
        if (url == null || url.isEmpty() || url.startsWith("https://res.cloudinary.com")) {
            return url;
        }
        
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(url, ObjectUtils.asMap(
                    "folder", folder,
                    "overwrite", true,
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary from url {}: {}", url, e.getMessage());
            // Fallback to original url
            return url;
        }
    }
    @Override
    public String uploadImageFromBytes(byte[] bytes, String folder) {
        if (bytes == null || bytes.length == 0) {
            return null;
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                    "folder", folder,
                    "overwrite", true,
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary from bytes: {}", e.getMessage());
            return null;
        }
    }
}
