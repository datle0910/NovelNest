package com.example.novelnest.media;

import com.example.novelnest.chapter.Chapter;
import com.example.novelnest.chapter.ChapterRepository;
import com.example.novelnest.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.Cacheable;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class TtsService {

    private final ChapterRepository chapterRepository;
    private final RestTemplate restTemplate;

    public TtsService(ChapterRepository chapterRepository) {
        this.chapterRepository = chapterRepository;
        this.restTemplate = new RestTemplate();
    }

    @Cacheable(value = "chapterAudio", key = "#chapterId")
    public byte[] getChapterAudio(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + chapterId));

        String htmlContent = chapter.getContent();
        if (htmlContent == null || htmlContent.isEmpty()) {
            return new byte[0];
        }

        // 1. Clean HTML
        String plainText = htmlContent
                .replaceAll("(?i)<br\\s*/?>", ", ")
                .replaceAll("(?i)</p>", ". ")
                .replaceAll("(?i)<[^>]+>", " ");
        
        // Unescape HTML entities roughly
        plainText = plainText.replace("&nbsp;", " ");
        plainText = plainText.replace("&amp;", "&");
        plainText = plainText.replace("&lt;", "<");
        plainText = plainText.replace("&gt;", ">");
        
        // 2. Split into sentences/phrases
        String[] parts = plainText.split("([.,!?;:\\n]+(?:\\s+|$))");
        List<String> phrases = new ArrayList<>();
        StringBuilder currentPhrase = new StringBuilder();
        
        for (int i = 0; i < parts.length; i++) {
            currentPhrase.append(parts[i]);
            if (i % 2 != 0 || i == parts.length - 1) {
                if (!currentPhrase.toString().trim().isEmpty()) {
                    phrases.add(currentPhrase.toString().trim());
                }
                currentPhrase.setLength(0);
            }
        }

        // 3. Chunk into ~150 char blocks to respect Google TTS limits
        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();
        
        for (String phrase : phrases) {
            if (currentChunk.length() + phrase.length() > 150 && currentChunk.length() > 0) {
                chunks.add(currentChunk.toString().trim());
                currentChunk.setLength(0);
            }
            currentChunk.append(currentChunk.length() > 0 ? " " : "").append(phrase);
        }
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        // 4. Fetch MP3 chunks from Google TTS sequentially and concatenate
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        for (String chunk : chunks) {
            try {
                String encodedText = URLEncoder.encode(chunk, StandardCharsets.UTF_8.toString());
                String url = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&q=" + encodedText;
                
                ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    outputStream.write(response.getBody());
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch TTS chunk: " + chunk);
                e.printStackTrace();
            }
        }

        return outputStream.toByteArray();
    }
}
