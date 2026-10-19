
package com.anilog.service;

import com.anilog.dto.AnimeSearchResult;
import tools.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class JikanService {

    private final RestClient restClient;

    public JikanService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.tenrai.org/v1")
                .build();
    }


    public List<AnimeSearchResult> searchAnime(String query) {

        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/anime")
                        .queryParam("q", query)
                        .queryParam("limit", 10)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        List<AnimeSearchResult> results = new ArrayList<>();

        if (response == null || !response.has("data")) {
            return results;
        }

        for (JsonNode anime : response.path("data")) {

            JsonNode imageNode = anime
                    .path("images")
                    .path("jpg")
                    .path("image_url");

            JsonNode episodesNode = anime.path("episodes");

            results.add(new AnimeSearchResult(
                    anime.path("mal_id").asLong(),
                    anime.path("title").asString(),
                    imageNode.isMissingNode() || imageNode.isNull()
                            ? null : imageNode.asString(),
                    episodesNode.isMissingNode() || episodesNode.isNull()
                            ? null : episodesNode.asInt()
            ));
        }

        return results;
    }

}
