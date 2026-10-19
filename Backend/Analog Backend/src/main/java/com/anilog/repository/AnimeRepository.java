package com.anilog.repository;

import com.anilog.entity.Anime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnimeRepository extends JpaRepository<Anime,Long> {


    Optional<Anime> findByMalId(Long malId);

}
