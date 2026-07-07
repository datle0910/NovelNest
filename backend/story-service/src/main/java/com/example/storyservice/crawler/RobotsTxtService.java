package com.example.storyservice.crawler;

import org.springframework.stereotype.Service;

@Service
public class RobotsTxtService {
    
    // Simplistic implementation for the demo.
    // Ideally it fetches robots.txt and parses it.
    
    public boolean canFetch(String baseUrl, String path, String userAgent) {
        // Assume true unless explicitly blocked
        // For the sake of the demo, we will log a warning if fetching fails,
        // but proceed for verified domains if we know they allow it.
        return true;
    }
}
