package com.anilog.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "anime")
@Getter
@Setter
@NoArgsConstructor
public class Anime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long malId;

    private String title;

    private String imageUrl;

    private String status;

    private int totalEpisodes;

    private int watchedEpisodes;
}
