package com.example.storyservice.ai;

import com.example.storyservice.image.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIService {

    private static final String POLLINATIONS_URL = "https://image.pollinations.ai/prompt/";
    private static final String HUGGINGFACE_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";

    @Value("${huggingface.api.key:}")
    private String huggingFaceApiKey;

    private final ImageService imageService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates an image cover for the story using AI and uploads it to Cloudinary.
     * Uses Hugging Face first, then falls back to Pollinations AI.
     * 
     * @param title       The story title
     * @param description The story description (optional)
     * @param categories  List of category names to determine the visual style
     * @return String URL of the uploaded image, or null if failed
     */
    public String generateAndUploadStoryCover(String title, String description, java.util.List<String> categories) {
        String prompt = buildPrompt(title, description, categories);
        String negativePrompt = "text, words, letters, fonts, watermark, signature, username, error, title, book cover layout, messy";

        // 1. Try Hugging Face if API key is provided
        if (huggingFaceApiKey != null && !huggingFaceApiKey.trim().isEmpty()) {
            try {
                log.info("Attempting to generate cover via Hugging Face for story: '{}'", title);
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + huggingFaceApiKey);
                headers.set("Content-Type", "application/json");

                Map<String, Object> body = new HashMap<>();
                body.put("inputs", prompt);
                
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("negative_prompt", negativePrompt);
                body.put("parameters", parameters);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                
                ResponseEntity<byte[]> response = restTemplate.exchange(
                        HUGGINGFACE_URL,
                        HttpMethod.POST,
                        entity,
                        byte[].class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    byte[] imageBytes = response.getBody();
                    log.info("Hugging Face generated image successfully. Uploading to Cloudinary...");
                    String secureUrl = imageService.uploadImageFromBytes(imageBytes, "covers");
                    if (secureUrl != null) {
                        return secureUrl;
                    }
                } else {
                    log.warn("Hugging Face API returned non-200 status or empty body.");
                }
            } catch (Exception e) {
                log.error("Hugging Face API failed: {}. Falling back to Pollinations...", e.getMessage());
            }
        } else {
            log.info("Hugging Face API key not configured. Falling back to Pollinations...");
        }

        // 2. Fallback to Pollinations AI
        try {
            // Pollinations handles prompt as URL path, so we encode it.
            // Appending negative prompt instructions into the main prompt since it doesn't officially support a negative_prompt param in all endpoints.
            String fullPrompt = prompt + " | Avoid: " + negativePrompt;
            String encodedPrompt = URLEncoder.encode(fullPrompt, StandardCharsets.UTF_8.toString());
            int randomSeed = (int) (Math.random() * 1000000);
            String finalUrl = POLLINATIONS_URL + encodedPrompt + "?width=600&height=800&nologo=true&seed=" + randomSeed;
            
            log.info("Generating AI cover URL for story: '{}' via Pollinations", title);
            return imageService.uploadImageFromUrl(finalUrl, "covers");
        } catch (Exception e) {
            log.error("Failed to generate AI cover via Pollinations for story: {}", title, e);
            return null;
        }
    }

    private String buildPrompt(String title, String description, java.util.List<String> categories) {
        StringBuilder prompt = new StringBuilder();
        // Do not use the word "cover" or "book" as it heavily biases the AI to draw text.
        prompt.append("A breathtaking, high-quality, pure visual illustration. ");
        
        // Default art style
        String style = "anime style, masterpiece, highly detailed, vivid colors";
        String concept = "A captivating cinematic scene";
        
        if (categories != null && !categories.isEmpty()) {
            String catsStr = String.join(", ", categories).toLowerCase();
            
            // Analyze genres to pick style
            if (catsStr.contains("tiên hiệp") || catsStr.contains("kiếm hiệp") || catsStr.contains("tu chân")) {
                style = "ancient chinese fantasy, xianxia, majestic mountains, ethereal floating islands, magical aura, wuxia style";
                concept = "A mystical cultivator, epic fantasy landscape, or magical artifacts";
            } else if (catsStr.contains("huyền huyễn") || catsStr.contains("dị giới") || catsStr.contains("phép thuật")) {
                style = "epic western fantasy, magical, glowing spells, dragons, medieval fantasy";
                concept = "A magical realm, mystical glowing tree, or a powerful wizard's tower";
            } else if (catsStr.contains("đô thị") || catsStr.contains("hiện đại") || catsStr.contains("võng du")) {
                style = "modern anime city, urban life, cinematic lighting, realistic anime";
                concept = "A modern city scape, glowing street lights, or a futuristic urban setting";
            } else if (catsStr.contains("khoa huyễn") || catsStr.contains("hệ thống") || catsStr.contains("mạt thế")) {
                style = "sci-fi, cyberpunk, futuristic, holographic, neon lights, post-apocalyptic";
                concept = "A high-tech futuristic world, ruined city overgrown with nature, or a glowing holographic interface";
            } else if (catsStr.contains("ngôn tình") || catsStr.contains("đam mỹ") || catsStr.contains("bách hợp")) {
                style = "romantic anime style, soft lighting, pastel colors, beautiful aesthetic, petals falling";
                concept = "A beautiful and romantic atmospheric scene, emotional lighting, soft aesthetic background";
            } else if (catsStr.contains("kinh dị") || catsStr.contains("linh dị")) {
                style = "dark fantasy, horror, creepy, fog, dark aesthetic, gothic";
                concept = "A haunted mansion, eerie forest, or dark spooky atmosphere";
            }
        }
        
        prompt.append("Visual style: ").append(style).append(". ");
        prompt.append("Concept: ").append(concept).append(". ");
        
        // Add title and description as loose thematic inspiration rather than strict text.
        prompt.append("Thematic inspiration from title: '").append(title).append("'. ");
        
        if (description != null && !description.trim().isEmpty()) {
            // Remove HTML tags and get first 200 chars
            String cleanDesc = description.replaceAll("<[^>]*>", "").replaceAll("\\s+", " ").trim();
            String shortDesc = cleanDesc.length() > 200 ? cleanDesc.substring(0, 200) + "..." : cleanDesc;
            prompt.append("Atmosphere details: ").append(shortDesc).append(". ");
        }
        
        // Emphasize the lack of text
        prompt.append("CRITICAL: Pure art only. No text, no fonts, no writing, no watermark.");
        return prompt.toString();
    }
}
