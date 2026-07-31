# TravelSpark — Spring Boot Backend

A complete Spring Boot 3 REST API for the TravelSpark travel planner, built with Java 17, Spring Security, Spring Data JPA, and JWT authentication.

> **Note:** This backend does **not** run inside Bolt. It is a standalone project you run locally with your own PostgreSQL database. The live Bolt app uses Supabase as its backend. Use this Spring Boot project if you want to self-host the API or learn the layered architecture.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Web** (REST controllers)
- **Spring Data JPA** (repositories, Hibernate)
- **Spring Security** (JWT-based stateless auth)
- **Spring Validation** (bean validation)
- **PostgreSQL** driver
- **JJWT 0.12** (JWT token generation/verification)
- **Lombok** (boilerplate reduction)
- **SpringDoc OpenAPI** (Swagger UI)

## Project Structure

```
backend/
├── pom.xml
├── src/main/java/com/travelspark/
│   ├── TravelSparkApplication.java      # Main entry point
│   ├── config/
│   │   ├── CorsConfig.java              # CORS for the React frontend
│   │   └── OpenApiConfig.java           # Swagger/OpenAPI setup
│   ├── controller/
│   │   ├── AuthController.java          # /api/auth/register, /login, /me
│   │   ├── UserController.java          # /api/users/profile
│   │   ├── DestinationController.java   # /api/destinations + reviews
│   │   ├── TripController.java          # /api/trips + itinerary + budget
│   │   ├── FavoriteController.java      # /api/favorites
│   │   └── AdminController.java         # /api/admin/*
│   ├── dto/                             # Request & response DTOs
│   ├── entity/                          # JPA entities (8 tables)
│   ├── exception/                       # GlobalExceptionHandler + custom exceptions
│   ├── repository/                      # Spring Data JPA repositories
│   ├── security/
│   │   ├── JwtProvider.java             # Token generation & validation
│   │   ├── JwtAuthFilter.java           # Per-request JWT filter
│   │   ├── CustomUserDetailsService.java
│   │   └── SecurityConfig.java          # Security filter chain
│   └── service/                         # Business logic layer
└── src/main/resources/
    ├── application.properties
    └── data.sql                          # Seed destinations
```

## Prerequisites

1. **Java 17** (JDK)
2. **Maven 3.8+**
3. **PostgreSQL 14+** running locally

## Setup

### 1. Create the database

```sql
CREATE DATABASE travelspark;
```

### 2. Configure credentials

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travelspark
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 4. Seed sample data

After the first run (Hibernate creates the tables), execute `data.sql` against your database:

```bash
psql -d travelspark -f src/main/resources/data.sql
```

## REST API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer JWT | Get current user |

### Destinations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/destinations` | Public | List all (filter by `?category=` or `?featured=true`) |
| GET | `/api/destinations/{id}` | Public | Get one destination |
| POST | `/api/destinations` | ADMIN | Create destination |
| PUT | `/api/destinations/{id}` | ADMIN | Update destination |
| DELETE | `/api/destinations/{id}` | ADMIN | Delete destination |
| GET | `/api/destinations/{id}/reviews` | Public | List reviews |
| POST | `/api/destinations/{id}/reviews` | USER | Add review |

### Trips
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trips` | USER | List own trips |
| GET | `/api/trips/{id}` | USER | Get own trip |
| POST | `/api/trips` | USER | Create trip |
| PUT | `/api/trips/{id}` | USER | Update own trip |
| DELETE | `/api/trips/{id}` | USER | Delete own trip |

### Itinerary
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trips/{id}/itinerary` | USER | List itinerary items |
| POST | `/api/trips/{id}/itinerary` | USER | Add itinerary item |
| PUT | `/api/trips/{id}/itinerary/{itemId}` | USER | Update item |
| DELETE | `/api/trips/{id}/itinerary/{itemId}` | USER | Delete item |

### Budget
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trips/{id}/budget` | USER | Category-wise budget breakdown |

### Favorites
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/favorites` | USER | List saved destinations |
| POST | `/api/favorites/{destinationId}` | USER | Save a destination |
| DELETE | `/api/favorites/{destinationId}` | USER | Remove a favorite |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users |
| GET | `/api/admin/trips` | ADMIN | List all trips |
| GET | `/api/admin/stats` | ADMIN | Analytics dashboard |
| POST | `/api/admin/destinations` | ADMIN | Create destination |
| PUT | `/api/admin/destinations/{id}` | ADMIN | Update destination |
| DELETE | `/api/admin/destinations/{id}` | ADMIN | Delete destination |

## Database Entities

- **User** — id, email, password (BCrypt), displayName, role (USER/ADMIN)
- **Destination** — title, country, category, description, rating, estimatedBudget, durationDays, imageUrl, featured
- **Trip** — name, destination, startDate, endDate, travelers, budget, notes (owns itinerary)
- **ItineraryItem** — dayNumber, category (hotel/food/transport/sightseeing/notes), title, description, cost
- **Favorite** — user + destination (unique pair)
- **Review** — user + destination, rating (1-5), comment
- **Booking** — user + destination, bookingType, travelDate, guests, totalPrice, status
- **BudgetPlan** — trip + category costs (travel, stay, food, activities, misc)

## Making a user ADMIN

After registering, update the user's role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Connecting the React frontend

To use this backend instead of Supabase, update the frontend's API calls to point to `http://localhost:8080/api` and store the JWT from `/api/auth/login` in localStorage. Attach it as `Authorization: Bearer <token>` on every authenticated request.
