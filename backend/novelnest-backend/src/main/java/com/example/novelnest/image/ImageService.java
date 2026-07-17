package com.example.novelnest.image;

public interface ImageService {
    /**
     * Upload an image from an external URL to a specific folder.
     * @param url The external image URL
     * @param folder The destination folder
     * @return The uploaded secure URL, or original URL if upload fails
     */
    String uploadImageFromUrl(String url, String folder);

    /**
     * Upload an image from raw bytes to a specific folder.
     * @param bytes The image byte array
     * @param folder The destination folder
     * @return The uploaded secure URL, or null if upload fails
     */
    String uploadImageFromBytes(byte[] bytes, String folder);
}
