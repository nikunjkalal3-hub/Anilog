
package com.anilog.dto;

public record AnimeSearchResult(
        Long malId,
        String title,
        String imageUrl,
        Integer totalEpisodes
) {
}
