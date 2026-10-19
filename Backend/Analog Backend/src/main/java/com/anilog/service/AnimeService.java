package com.anilog.service;
import com.anilog.entity.Anime;
import com.anilog.repository.AnimeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class AnimeService {

    private final AnimeRepository animeRepository;

    public AnimeService(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }

    // Save new anime or update existing anime metadata
    public Anime saveAnime(Anime anime) {

        if (anime.getMalId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Anime malId is required"
            );
        }

        Anime existingAnime = animeRepository
                .findByMalId(anime.getMalId())
                .orElse(null);

        if (existingAnime != null) {
            existingAnime.setTitle(anime.getTitle());
            existingAnime.setImageUrl(anime.getImageUrl());
            existingAnime.setTotalEpisodes(anime.getTotalEpisodes());

            return animeRepository.save(existingAnime);
        }

        return animeRepository.save(anime);
    }

    // Get all anime
    public List<Anime> getAllAnime() {
        return animeRepository.findAll();
    }

    // Get anime by database ID
    public Anime getAnimeById(Long id) {
        return animeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anime not found with id: " + id
                ));
    }

    // Delete anime
    public void deleteAnime(Long id) {
        if (!animeRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Anime not found"
            );
        }

        animeRepository.deleteById(id);
    }

    // Update anime status
    public Anime updateStatus(Long id, String status) {

        Anime anime = animeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anime not found"
                ));

        Set<String> validStatuses = Set.of(
                "WATCHING",
                "WATCHED",
                "PLAN_TO_WATCH",
                "DROPPED"
        );

        if (status == null || !validStatuses.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid anime status"
            );
        }

        anime.setStatus(status);

        return animeRepository.save(anime);
    }

    // Update watched episode progress
    public Anime updateProgress(Long id, int watchedEpisodes) {

        Anime anime = animeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anime not found"
                ));

        if (watchedEpisodes < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Watched episodes cannot be negative"
            );
        }

        if (anime.getTotalEpisodes() > 0
                && watchedEpisodes > anime.getTotalEpisodes()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Watched episodes cannot exceed total episodes"
            );
        }

        anime.setWatchedEpisodes(watchedEpisodes);

        return animeRepository.save(anime);
    }
}
