import { useEffect, useMemo, useState } from "react";
import "./index.css";

// Uses Vercel's VITE_API_URL in production and localhost during development.
const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8071"}/api/anime`;

const seedAnime = [
  { id: 1, malId: 52299, title: "Solo Leveling", year: 2024, score: 8.7, episodes: 12, genre: "Action", color: "poster-purple", image: "https://cdn.myanimelist.net/images/anime/1801/142390l.jpg" },
  { id: 2, malId: 21, title: "One Piece", year: 1999, score: 9.0, episodes: 1000, genre: "Adventure", color: "poster-blue", image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg" },
  { id: 3, malId: 38000, title: "Demon Slayer", year: 2019, score: 8.5, episodes: 26, genre: "Action", color: "poster-red", image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" },
  { id: 4, malId: 16498, title: "Attack on Titan", year: 2013, score: 9.1, episodes: 25, genre: "Drama", color: "poster-dark", image: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" },
  { id: 5, malId: 40748, title: "Jujutsu Kaisen", year: 2020, score: 8.6, episodes: 24, genre: "Action", color: "poster-purple", image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg" },
  { id: 6, malId: 52991, title: "Frieren", year: 2023, score: 9.3, episodes: 28, genre: "Fantasy", color: "poster-blue", image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg" },
  { id: 7, malId: 1735, title: "Naruto Shippuden", year: 2007, score: 8.7, episodes: 500, genre: "Adventure", color: "poster-orange", image: "https://cdn.myanimelist.net/images/anime/5/17407l.jpg" },
  { id: 8, malId: 1535, title: "Death Note", year: 2006, score: 8.6, episodes: 37, genre: "Mystery", color: "poster-dark", image: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg" },
  { id: 9, malId: 37521, title: "Vinland Saga", year: 2019, score: 8.8, episodes: 24, genre: "Drama", color: "poster-orange", image: "https://cdn.myanimelist.net/images/anime/1500/103005l.jpg" },
  { id: 10, malId: 44511, title: "Chainsaw Man", year: 2022, score: 8.4, episodes: 12, genre: "Action", color: "poster-red", image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg" },
];

const navItems = [
  { label: "Home", icon: "⌂" },
  { label: "Discover", icon: "⌕" },
  { label: "Watching", icon: "▶" },
  { label: "Watched", icon: "✓" },
  { label: "Plan to Watch", icon: "▣" },
  { label: "Dropped", icon: "×" },
];

const statusOptions = ["Watching", "Watched", "Plan to Watch", "Dropped"];

const uiToApiStatus = {
  Watching: "WATCHING",
  Watched: "WATCHED",
  "Plan to Watch": "PLAN_TO_WATCH",
  Dropped: "DROPPED",
};

const apiToUiStatus = Object.fromEntries(
  Object.entries(uiToApiStatus).map(([uiStatus, apiStatus]) => [apiStatus, uiStatus])
);

function mapSavedAnime(record) {
  return {
    id: `db-${record.id}`,
    dbId: record.id,
    malId: record.malId,
    title: record.title,
    year: null,
    score: null,
    episodes: record.totalEpisodes ?? 0,
    genre: "Anime",
    color: "poster-purple",
    image: record.imageUrl || "",
  };
}

function App() {
  const [animeList, setAnimeList] = useState(() => {
    try {
      const savedCatalogue = localStorage.getItem("anilog-catalogue-v1");
      const savedAnime = savedCatalogue ? JSON.parse(savedCatalogue) : [];
      const merged = [...seedAnime];
      if (Array.isArray(savedAnime)) {
        savedAnime.forEach((anime) => {
          if (anime && !merged.some((item) => String(item.id) === String(anime.id))) {
            merged.push(anime);
          }
        });
      }
      return merged;
    } catch (error) {
      console.error("Could not load AniLog catalogue:", error);
      return seedAnime;
    }
  });
  const [activeNav, setActiveNav] = useState("Home");

  // Keep anime discovered through live search available in each library page.
  useEffect(() => {
    try {
      localStorage.setItem("anilog-catalogue-v1", JSON.stringify(animeList));
    } catch (error) {
      console.error("Could not save AniLog catalogue:", error);
    }
  }, [animeList]);
  const [selectedAnime, setSelectedAnime] = useState(seedAnime[0]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  // Restore the user's anime collection from this browser when the app opens.
  const [statuses, setStatuses] = useState(() => {
    try {
      const savedStatuses = localStorage.getItem("anilog-statuses-v1");
      return savedStatuses ? JSON.parse(savedStatuses) : {};
    } catch (error) {
      console.error("Could not load AniLog collection from localStorage:", error);
      return {};
    }
  });

  // Save every collection change so it survives refreshes and browser restarts.
  useEffect(() => {
    try {
      localStorage.setItem("anilog-statuses-v1", JSON.stringify(statuses));
    } catch (error) {
      console.error("Could not save AniLog collection to localStorage:", error);
      setMessage("Couldn't save changes in this browser.");
    }
  }, [statuses]);
  // Restore watched-episode counts independently from list statuses.
  const [episodeProgress, setEpisodeProgress] = useState(() => {
    try {
      const savedProgress = localStorage.getItem("anilog-episode-progress-v1");
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch (error) {
      console.error("Could not load AniLog episode progress:", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("anilog-episode-progress-v1", JSON.stringify(episodeProgress));
    } catch (error) {
      console.error("Could not save AniLog episode progress:", error);
    }
  }, [episodeProgress]);

  const [message, setMessage] = useState("");
  const [apiNote, setApiNote] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Load the collection saved in PostgreSQL when AniLog opens.
  useEffect(() => {
    let cancelled = false;

    async function loadSavedAnime() {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`Could not load saved anime: ${response.status}`);
        const records = await response.json();
        if (!Array.isArray(records) || cancelled) return;

        const savedAnime = records.map(mapSavedAnime);
        setAnimeList((previous) => {
          const nonDatabaseAnime = previous.filter((anime) => !anime.dbId);
          const remoteIds = new Set(savedAnime.map((anime) => String(anime.malId)));
          const remainingLocalAnime = nonDatabaseAnime.filter(
            (anime) => anime.malId == null || !remoteIds.has(String(anime.malId))
          );
          return [...remainingLocalAnime, ...savedAnime];
        });

        setStatuses((previous) => {
          const next = { ...previous };
          records.forEach((record) => {
            const uiStatus = apiToUiStatus[record.status];
            if (uiStatus) next[`db-${record.id}`] = uiStatus;
            else delete next[`db-${record.id}`];
          });
          return next;
        });

        setEpisodeProgress((previous) => {
          const next = { ...previous };
          records.forEach((record) => {
            next[`db-${record.id}`] = record.watchedEpisodes ?? 0;
          });
          return next;
        });
      } catch (error) {
        console.error("Could not load AniLog collection from backend:", error);
        if (!cancelled) setMessage("Couldn't load your saved anime from the backend.");
      }
    }

    loadSavedAnime();
    return () => { cancelled = true; };
  }, []);

  // Search anime through our Spring Boot backend, which calls Tenrai.
  useEffect(() => {
    const query = search.trim();

    if (activeNav !== "Discover" || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from AniLog backend");
        }

        const colors = [
          "poster-purple",
          "poster-blue",
          "poster-red",
          "poster-dark",
          "poster-orange",
        ];

        const mappedResults = data
          .filter((item) => item && item.malId != null && item.title)
          .map((item, index) => ({
            // Prefix remote IDs to avoid collisions with starter-catalogue IDs.
            id: `tenrai-${item.malId}`,
            malId: item.malId,
            title: item.title,
            year: null,
            score: null,
            episodes: item.totalEpisodes ?? 0,
            genre: "Anime",
            color: colors[index % colors.length],
            image: item.imageUrl || "",
          }));

        if (!controller.signal.aborted) {
          setSearchResults(mappedResults);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("AniLog search failed:", error);
          setSearchResults([]);
          setSearchError(
            "Couldn't search anime. Check that the backend is running and try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, activeNav]);

  const filteredAnime = useMemo(() => {
    const query = search.trim();
    const useRemoteResults = activeNav === "Discover" && query.length > 0;
    const catalogue = useRemoteResults ? searchResults : animeList;

    return catalogue.filter((anime) => {
      const matchesSearch = anime.title
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesGenre =
        useRemoteResults ||
        selectedGenre === "All" ||
        anime.genre === selectedGenre;

      const matchesStatus =
        activeNav === "Discover" ||
        activeNav === "Home" ||
        statuses[anime.id] === activeNav;

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [
    animeList,
    searchResults,
    search,
    selectedGenre,
    activeNav,
    statuses,
  ]);

  function getWatchedEpisodes(anime) {
    const saved = Number(episodeProgress[anime.id] ?? 0);
    const total = Number(anime.episodes);
    return Math.max(0, Math.min(Number.isFinite(total) && total > 0 ? total : Infinity, saved));
  }

  async function updateWatchedEpisodes(anime, value) {
    const parsed = Number.parseInt(value, 10);
    const safeValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    const total = Number(anime.episodes);
    const clamped = Number.isFinite(total) && total > 0
      ? Math.min(total, safeValue)
      : safeValue;

    setEpisodeProgress((previous) => ({ ...previous, [anime.id]: clamped }));

    if (anime.dbId) {
      try {
        const response = await fetch(`${API_BASE_URL}/${anime.dbId}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchedEpisodes: clamped }),
        });
        if (!response.ok) throw new Error(`Progress update failed: ${response.status}`);
      } catch (error) {
        console.error("Could not save episode progress:", error);
        setMessage("Progress changed on screen, but couldn't save to the backend.");
      }
    }
  }

  async function addToList(status) {
    if (selectedAnime.malId == null) {
      setMessage("Search for this anime in Discover before adding it to your saved list.");
      window.setTimeout(() => setMessage(""), 3000);
      return;
    }

    const watchedEpisodes = status === "Watched"
      ? (Number(selectedAnime.episodes) || 0)
      : getWatchedEpisodes(selectedAnime);

    try {
      let savedRecord;

      if (selectedAnime.dbId) {
        const response = await fetch(`${API_BASE_URL}/${selectedAnime.dbId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: uiToApiStatus[status] }),
        });
        if (!response.ok) throw new Error(`Status update failed: ${response.status}`);
        savedRecord = await response.json();

        if (status === "Watched") {
          const progressResponse = await fetch(`${API_BASE_URL}/${selectedAnime.dbId}/progress`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watchedEpisodes }),
          });
          if (!progressResponse.ok) throw new Error(`Progress update failed: ${progressResponse.status}`);
          savedRecord = await progressResponse.json();
        }
      } else {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            malId: selectedAnime.malId,
            title: selectedAnime.title,
            imageUrl: selectedAnime.image || "",
            status: uiToApiStatus[status],
            totalEpisodes: Number(selectedAnime.episodes) || 0,
            watchedEpisodes,
          }),
        });
        if (!response.ok) throw new Error(`Saving anime failed: ${response.status}`);
        savedRecord = await response.json();

        // The backend avoids duplicate malIds and preserves an existing status.
        if (savedRecord.status !== uiToApiStatus[status]) {
          const statusResponse = await fetch(`${API_BASE_URL}/${savedRecord.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: uiToApiStatus[status] }),
          });
          if (!statusResponse.ok) throw new Error(`Status update failed: ${statusResponse.status}`);
          savedRecord = await statusResponse.json();
        }

        if (status === "Watched" && savedRecord.watchedEpisodes !== watchedEpisodes) {
          const progressResponse = await fetch(`${API_BASE_URL}/${savedRecord.id}/progress`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watchedEpisodes }),
          });
          if (!progressResponse.ok) throw new Error(`Progress update failed: ${progressResponse.status}`);
          savedRecord = await progressResponse.json();
        }
      }

      const savedAnime = mapSavedAnime(savedRecord);
      setAnimeList((previous) => [
        ...previous.filter((anime) => anime.id !== savedAnime.id && String(anime.malId) !== String(savedAnime.malId)),
        savedAnime,
      ]);
      setStatuses((previous) => ({ ...previous, [savedAnime.id]: apiToUiStatus[savedRecord.status] || status }));
      setEpisodeProgress((previous) => ({ ...previous, [savedAnime.id]: savedRecord.watchedEpisodes ?? watchedEpisodes }));
      setSelectedAnime(savedAnime);
      setMessage(`${savedAnime.title} saved to ${status}`);
      setShowStatusModal(false);
    } catch (error) {
      console.error("Could not save anime to backend:", error);
      setMessage("Couldn't save this change. Check that the backend is running.");
    }
    window.setTimeout(() => setMessage(""), 3000);
  }

  function openAnime(anime) {
    setSelectedAnime(anime);
    setActiveNav("Discover");
    setShowStatusModal(true);
  }

  function chooseAnime(anime) {
    setSelectedAnime(anime);
    setShowStatusModal(true);
  }

  function renderPoster(anime, extraClass = "") {
    return (
      <div className={`poster ${anime.color} ${extraClass}`}>
        {anime.image ? (
          <img
            src={anime.image}
            alt={`${anime.title} cover`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement.classList.add("image-failed");
            }}
          />
        ) : null}
        <div className="poster-placeholder">
          <span>ANILOG</span>
          <strong>{anime.title}</strong>
          <i>✦</i>
        </div>
        <span className="poster-year">{anime.year}</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h1>AniLog</h1>
            <p>YOUR ANIME UNIVERSE</p>
          </div>
        </div>

        <p className="sidebar-label">MENU</p>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item.label);
                setSearch("");
                setSelectedGenre("All");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {statusOptions.includes(item.label) && (
                <span className="nav-count">
                  {Object.values(statuses).filter((status) => status === item.label).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-star">✦</span>
          <p>Your next favourite story is waiting.</p>
          <button className="secondary-button" onClick={() => setActiveNav("Discover")}>
            Explore anime ↗
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search anime..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                if (activeNav === "Home") setActiveNav("Discover");
              }}
            />
            <span className="search-shortcut">SEARCH</span>
          </div>
          <div className="profile">
            <div className="profile-avatar">N</div>
            <div><strong>Anime fan</strong><small>Your collection</small></div>
          </div>
        </header>

        {activeNav === "Home" ? (
          <div className="home-dashboard">
            <section className="home-welcome">
              <div className="welcome-copy">
                <p className="eyebrow">YOUR PERSONAL ANIME SPACE</p>
                <h2>Your next adventure<br />starts here<span>.</span></h2>
                <p>Every story leaves a mark. Keep track of the ones that matter to you.</p>
                <button className="primary-button" onClick={() => setActiveNav("Discover")}>
                  Discover anime <span>↗</span>
                </button>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <span>アニメ</span><i>✦</i>
              </div>
            </section>

            <section className="stats-grid">
              {[
                { label: "Watching", color: "stat-purple", icon: "▶" },
                { label: "Watched", color: "stat-green", icon: "✓" },
                { label: "Plan to Watch", color: "stat-blue", icon: "▣" },
                { label: "Dropped", color: "stat-red", icon: "×" },
              ].map((stat) => (
                <button className="stat-card" key={stat.label} onClick={() => setActiveNav(stat.label)}>
                  <span className={`stat-icon ${stat.color}`}>{stat.icon}</span>
                  <span className="stat-copy">
                    <strong>{Object.values(statuses).filter((status) => status === stat.label).length}</strong>
                    <small>{stat.label}</small>
                  </span>
                  <span className="stat-arrow">↗</span>
                </button>
              ))}
            </section>

            <section className="home-section">
              <div className="home-section-heading">
                <div><h2>Continue Watching</h2><p>Pick up where your journey left off.</p></div>
                <button className="text-button" onClick={() => setActiveNav("Watching")}>View all →</button>
              </div>
              <div className="continue-grid">
                {animeList.filter((anime) => statuses[anime.id] === "Watching").map((anime) => {
                  const watched = getWatchedEpisodes(anime);
                  const total = Number(anime.episodes);
                  const progress = total > 0 ? Math.round((watched / total) * 100) : 0;
                  return (
                    <article className="continue-card" key={anime.id} onClick={() => openAnime(anime)}>
                      {renderPoster(anime, "continue-poster")}
                      <div className="continue-info">
                        <h3>{anime.title}</h3>
                        <p>{watched} watched · {total > 0 ? Math.max(0, total - watched) : "—"} left</p>
                        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                        <small>{progress}% complete</small>
                      </div>
                    </article>
                  );
                })}
                {!Object.values(statuses).includes("Watching") && (
                  <div className="home-empty">
                    <span>▷</span><h3>Your next episode awaits</h3>
                    <p>Add an anime to Watching to see it here.</p>
                    <button className="secondary-button" onClick={() => setActiveNav("Discover")}>Find anime</button>
                  </div>
                )}
              </div>
            </section>

            <section className="home-section">
              <div className="home-section-heading">
                <div><h2>Trending Anime</h2><p>Stories worth adding to your list.</p></div>
                <button className="text-button" onClick={() => setActiveNav("Discover")}>Explore all →</button>
              </div>
              <div className="anime-grid">
                {animeList.slice(0, 5).map((anime) => (
                  <article className="anime-card" key={anime.id} onClick={() => openAnime(anime)}>
                    {renderPoster(anime)}
                    <div className="card-info">
                      <h3>{anime.title}</h3><p>{anime.genre} · TV</p>
                      <div className="card-meta"><span><b>★</b> {anime.score}</span><span>{anime.episodes} eps</span></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            <section className="page-heading">
              <div>
                <p className="eyebrow">{activeNav === "Discover" ? "EXPLORE THE ANIME UNIVERSE" : "YOUR PERSONAL LIBRARY"}</p>
                <h2>{activeNav === "Discover" ? "Discover Anime" : activeNav}<span>.</span></h2>
                <p className="subtitle">
                  {activeNav === "Discover"
                    ? "Search the catalogue and add your next favourite story."
                    : activeNav === "Watching"
                    ? "Your current series, episode progress, and next adventures."
                    : activeNav === "Watched"
                    ? "Every finished series, collected in one place."
                    : activeNav === "Plan to Watch"
                    ? "Your personal watchlist for stories waiting in the wings."
                    : activeNav === "Dropped"
                    ? "Series you paused or left behind, all kept together."
                    : `Your ${activeNav.toLowerCase()} collection.`}
                </p>
              </div>
              <div className="heading-decoration">アニメ</div>
            </section>

            {statusOptions.includes(activeNav) && (
              <section className={`collection-overview collection-${activeNav.toLowerCase().replaceAll(" ", "-")}`}>
                <div className="collection-overview-icon">
                  {activeNav === "Watching" ? "▶" : activeNav === "Watched" ? "✓" : activeNav === "Plan to Watch" ? "▣" : "×"}
                </div>
                <div className="collection-overview-copy">
                  <p className="eyebrow">YOUR {activeNav.toUpperCase()} LIST</p>
                  <h3>{animeList.filter((anime) => statuses[anime.id] === activeNav).length} <span>{animeList.filter((anime) => statuses[anime.id] === activeNav).length === 1 ? "anime" : "anime"} in this collection</span></h3>
                  <p>{activeNav === "Watching" ? "Keep your episode progress moving." : activeNav === "Watched" ? "A collection of stories you've completed." : activeNav === "Plan to Watch" ? "Save a great story for the right moment." : "You can always pick a series back up later."}</p>
                </div>
                <div className="collection-overview-decoration">アニメ</div>
              </section>
            )}

            {activeNav === "Discover" && (
              <section className="featured-banner">
                <div className="banner-glow" />
                <div className="banner-content">
                  <span className="featured-tag">FEATURED ANIME</span>
                  <h2>Find your next obsession.</h2>
                  <p>From legendary adventures to hidden gems, your next story starts here.</p>
                  <button className="primary-button" onClick={() => chooseAnime(animeList[0])}>
                    Explore anime <span>↗</span>
                  </button>
                </div>
                <div className="banner-symbol">✦</div>
              </section>
            )}

            <section className="filter-section">
              <div className="section-title">
                <div>
                  <h2>{activeNav === "Discover" ? "Explore the catalogue" : activeNav === "Watching" ? "Currently watching" : activeNav === "Watched" ? "Completed anime" : activeNav === "Plan to Watch" ? "Saved for later" : "Your dropped list"}</h2>
                  <p>{filteredAnime.length} {filteredAnime.length === 1 ? "title" : "titles"} {activeNav === "Discover" ? "to explore" : "in your collection"}</p>
                </div>
                <span className="result-label">{activeNav === "Discover" && search.trim() ? "LIVE SEARCH" : statusOptions.includes(activeNav) ? "YOUR LIBRARY" : "ANIME CATALOGUE"}</span>
              </div>
              <div className="filter-row">
                {["All", "Action", "Adventure", "Fantasy", "Mystery", "Drama"].map((genre) => (
                  <button
                    key={genre}
                    className={`filter-chip ${selectedGenre === genre ? "selected" : ""}`}
                    onClick={() => setSelectedGenre(genre)}
                  >{genre}</button>
                ))}
              </div>
            </section>

            {isSearching && <p className="api-note">Searching anime...</p>}
            {searchError && <p className="api-note">{searchError}</p>}
            {message && <div className="toast">{message}</div>}

            {filteredAnime.length === 0 ? (
              <div className="empty-state">
                <span>⌕</span><h3>No anime found</h3>
                <p>{activeNav === "Discover" && search.trim() ? "Try another search term." : "Try another search or explore a different genre."}</p>
                <button className="secondary-button" onClick={() => { setSearch(""); setSelectedGenre("All"); setActiveNav("Discover"); }}>
                  Reset filters
                </button>
              </div>
            ) : (
              <section className="anime-grid">
                {filteredAnime.map((anime) => (
                  <article
                    className={`anime-card ${selectedAnime.id === anime.id ? "chosen" : ""}`}
                    key={anime.id}
                    onClick={() => chooseAnime(anime)}
                  >
                    {renderPoster(anime)}
                    <div className="card-info">
                      <h3>{anime.title}</h3><p>{anime.genre} · TV</p>
                      <div className="card-meta"><span><b>★</b> {anime.score}</span><span>{anime.episodes} eps</span></div>
                      {statuses[anime.id] && <span className="status-label">{statuses[anime.id]}</span>}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      {showStatusModal && (
        <div
          className="status-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowStatusModal(false);
          }}
        >
          <section
            className="status-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close anime options"
              onClick={() => setShowStatusModal(false)}
            >×</button>
            <div className="modal-art">
              {selectedAnime.image ? (
                <img
                  src={selectedAnime.image}
                  alt={`${selectedAnime.title} cover`}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.parentElement.classList.add("image-failed");
                  }}
                />
              ) : null}
              <div className="poster-placeholder">
                <span>ANILOG</span><strong>{selectedAnime.title}</strong><i>✦</i>
              </div>
            </div>
            <div className="modal-content">
              <p className="eyebrow">UPDATE YOUR COLLECTION</p>
              <h2 id="status-modal-title">{selectedAnime.title}</h2>
              <div className="details-meta">
                <span>★ {selectedAnime.score}</span>
                <span>{selectedAnime.year}</span>
                <span>{selectedAnime.episodes} episodes</span>
              </div>
              {(() => {
                const total = Number(selectedAnime.episodes);
                const watched = getWatchedEpisodes(selectedAnime);
                const remaining = total > 0 ? Math.max(0, total - watched) : null;
                const progress = total > 0 ? Math.round((watched / total) * 100) : 0;
                return (
                  <section className="episode-progress">
                    <div className="episode-progress-heading">
                      <div>
                        <p className="eyebrow">EPISODE PROGRESS</p>
                        <strong>{watched} <span>/ {total > 0 ? total : "?"}</span></strong>
                      </div>
                      <span className="episode-percent">{total > 0 ? `${progress}%` : "Total unknown"}</span>
                    </div>
                    <div className="episode-progress-track">
                      <div className="episode-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="episode-count-row">
                      <span><strong>{watched}</strong> watched</span>
                      <span><strong>{remaining === null ? "—" : remaining}</strong> remaining</span>
                    </div>
                    <div className="episode-stepper">
                      <button
                        type="button"
                        aria-label="Decrease watched episodes"
                        disabled={watched <= 0}
                        onClick={() => updateWatchedEpisodes(selectedAnime, watched - 1)}
                      >−</button>
                      <label>
                        <span>Watched episodes</span>
                        <input
                          type="number"
                          min="0"
                          max={total > 0 ? total : undefined}
                          value={watched}
                          onChange={(event) => updateWatchedEpisodes(selectedAnime, event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        aria-label="Increase watched episodes"
                        disabled={total > 0 && watched >= total}
                        onClick={() => updateWatchedEpisodes(selectedAnime, watched + 1)}
                      >+</button>
                    </div>
                    {total > 0 && watched === total && (
                      <p className="episode-complete-note">✓ All episodes completed</p>
                    )}
                  </section>
                );
              })()}
              <p className="modal-description">
                Where does this anime belong in your journey?
              </p>
              <div className="modal-status-options">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`modal-status-option ${statuses[selectedAnime.id] === status ? "selected" : ""} ${status.toLowerCase().replaceAll(" ", "-")}`}
                    onClick={() => addToList(status)}
                  >
                    <span className="modal-status-icon">
                      {status === "Watching" ? "▶" : status === "Watched" ? "✓" : status === "Plan to Watch" ? "▣" : "×"}
                    </span>
                    <span className="modal-status-copy">
                      <strong>{status}</strong>
                      <small>
                        {status === "Watching" ? "I'm currently watching this" :
                         status === "Watched" ? "I've finished this anime" :
                         status === "Plan to Watch" ? "Save it for later" :
                         "Move it out of my rotation"}
                      </small>
                    </span>
                    <span className="modal-status-indicator">
                      {statuses[selectedAnime.id] === status ? "✓" : "＋"}
                    </span>
                  </button>
                ))}
              </div>
              {statuses[selectedAnime.id] && (
                <button
                  className="remove-status-button"
                  type="button"
                  onClick={async () => {
                    try {
                      if (selectedAnime.dbId) {
                        const response = await fetch(`${API_BASE_URL}/${selectedAnime.dbId}`, {
                          method: "DELETE",
                        });
                        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
                      }
                      setStatuses((previous) => {
                        const next = { ...previous };
                        delete next[selectedAnime.id];
                        return next;
                      });
                      setEpisodeProgress((previous) => {
                        const next = { ...previous };
                        delete next[selectedAnime.id];
                        return next;
                      });
                      if (selectedAnime.dbId) {
                        setAnimeList((previous) => previous.filter((anime) => anime.id !== selectedAnime.id));
                      }
                      setMessage(`${selectedAnime.title} removed from your list`);
                      setShowStatusModal(false);
                    } catch (error) {
                      console.error("Could not remove anime:", error);
                      setMessage("Couldn't remove this anime. Check that the backend is running.");
                    }
                    window.setTimeout(() => setMessage(""), 3000);
                  }}
                >Remove from my list</button>
              )}
            </div>
          </section>
        </div>
      )}

      <aside className="details-panel">
        <div className="details-heading"><p className="eyebrow">ANIME DETAILS</p><span>✦</span></div>
        <div className={`details-poster ${selectedAnime.color}`}>
          {selectedAnime.image ? (
            <img
              src={selectedAnime.image}
              alt={`${selectedAnime.title} cover`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.parentElement.classList.add("image-failed");
              }}
            />
          ) : null}
          <div className="poster-placeholder"><span>ANILOG</span><strong>{selectedAnime.title}</strong><i>✦</i></div>
        </div>

        <div className="details-info">
          <p className="eyebrow">SELECTED TITLE</p>
          <h2>{selectedAnime.title}</h2>
          <div className="details-meta"><span>★ {selectedAnime.score}</span><span>{selectedAnime.year}</span></div>
          <div className="details-divider" />
          <div className="detail-row"><span>Genre</span><strong>{selectedAnime.genre}</strong></div>
          <div className="detail-row"><span>Total episodes</span><strong>{selectedAnime.episodes || "Unknown"}</strong></div>
          <div className="detail-row"><span>Watched</span><strong>{getWatchedEpisodes(selectedAnime)}</strong></div>
          <div className="detail-row"><span>Remaining</span><strong>{Number(selectedAnime.episodes) > 0 ? Math.max(0, Number(selectedAnime.episodes) - getWatchedEpisodes(selectedAnime)) : "—"}</strong></div>
          <div className="detail-row"><span>Status</span><strong>{statuses[selectedAnime.id] || "Not added"}</strong></div>
          <div className="details-divider" />
          <p className="eyebrow">ADD TO YOUR LIST</p>
          <div className="status-buttons">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`status-button ${statuses[selectedAnime.id] === status ? "selected" : ""}`}
                onClick={() => addToList(status)}
              >
                <span>{status === "Watching" ? "▶" : status === "Watched" ? "✓" : status === "Plan to Watch" ? "▣" : "×"}</span>
                {status}
                {statuses[selectedAnime.id] === status && <span className="status-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="details-footer"><span>✦</span>Your anime journey, your story.</div>
      </aside>
    </div>
  );
}

export default App;
