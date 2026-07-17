package com.example.novelnest.common;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating URL-friendly slugs from Vietnamese/Unicode text.
 */
public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String result = input.replaceAll("\u0111", "d").replaceAll("\u0110", "D");

        String normalized = Normalizer.normalize(result, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(
                WHITESPACE.matcher(normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", ""))
                        .replaceAll("-")
        ).replaceAll("");

        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = slug.replaceAll("^-|-$", "");

        return slug;
    }
}
