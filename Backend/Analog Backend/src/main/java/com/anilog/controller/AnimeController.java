
package com.anilog.controller;

import com.anilog.dto.AnimeSearchResult;
import com.anilog.entity.Anime;
import com.anilog.service.AnimeService;
import com.anilog.service.JikanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/anime")
@CrossOrigin(origins = "http://localhost:5173")
public class AnimeController {

    private final AnimeService animeService;
    private final JikanService jikanService;

    public AnimeController(AnimeService animeService, JikanService jikanService) {
        this.animeService = animeService;
        this.jikanService = jikanService;
    }

    // Get all anime
    @GetMapping
    public List<Anime> getAllAnime() {
        return animeService.getAllAnime();
    }

    // Get anime by ID
    @GetMapping("/{id}")
    public Anime getAnimeById(@PathVariable Long id) {
        return animeService.getAnimeById(id);
    }

    // Add a new anime
    @PostMapping
    public Anime saveAnime(@RequestBody Anime anime) {
        return animeService.saveAnime(anime);
    }

    // Delete anime
    @DeleteMapping("/{id}")
    public void deleteAnime(@PathVariable Long id) {
        animeService.deleteAnime(id);
    }

    @PatchMapping("/{id}/status")
    public Anime updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return animeService.updateStatus(
                id, request.get("status"));
    }

    @PatchMapping("/{id}/progress")
    public Anime updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {

        Integer watchedEpisodes = request.get("watchedEpisodes");

        if (watchedEpisodes == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "watchedEpisodes is required"
            );
        }

        return animeService.updateProgress(id, watchedEpisodes);
    }


    @GetMapping("/search")
    public List<AnimeSearchResult> searchAnime(
            @RequestParam String q) {
        return jikanService.searchAnime(q);
    }



}
