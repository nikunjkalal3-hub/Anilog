# AniLog 🎌

AniLog is a personal anime tracking application built with React and Spring Boot. It allows users to search for anime, track their watching status, and update episode progress.

## Features

- Search for anime using the Tenrai API.
- Add anime to your personal tracking list.
- Track watching status: Watching, Watched, Plan to Watch, and Dropped.
- Update watched episode progress.
- Store anime records in PostgreSQL.

## Tech Stack

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Maven

**Frontend**
- React
- Vite

## Getting Started

### Prerequisites

- Java 21
- PostgreSQL
- Node.js and npm (for the frontend)

### Database Setup

Create a PostgreSQL database named `anilog`.

Configure the following environment variables before running the backend:

- `DB_USERNAME`: Your PostgreSQL username.
- `DB_PASSWORD`: Your PostgreSQL password.

### Run the Backend

```bash
./mvnw spring-boot:run
```

On Windows, use:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at `http://localhost:8071`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/anime` | Get all anime |
| GET | `/api/anime/{id}` | Get anime by ID |
| POST | `/api/anime` | Add anime |
| DELETE | `/api/anime/{id}` | Delete anime |
| PATCH | `/api/anime/{id}/status` | Update status |
| PATCH | `/api/anime/{id}/progress` | Update watched episodes |
| GET | `/api/anime/search?q={query}` | Search anime |

## Project Status

Personal learning project focused on building REST APIs with Java, Spring Boot, JPA, and PostgreSQL.

## License

No license specified yet.
