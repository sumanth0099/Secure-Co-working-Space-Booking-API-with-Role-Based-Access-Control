# Secure Co-working Space Booking API

A robust RESTful API for managing a co-working space, including user management, workspace booking, and a credit-based system. Built with Node.js, Express, Sequelize (PostgreSQL), and Redis.

## Features
- **JWT Authentication**: Secure, stateless authentication system.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `MEMBER` and `ADMIN` users.
- **Resource Scheduling**: Conflict detection to prevent double-booking of workspaces.
- **Credit System**: Automatic calculation and deduction of credits for bookings, with refunds for early cancellations.
- **Rate Limiting**: Protection against brute-force attacks on the login endpoint using Redis.
- **Dockerized Environment**: Consistent multi-container setup.

## Setup Instructions

1. **Prerequisites**: Ensure you have Docker and Docker Compose installed on your machine.
2. **Environment Variables**: Copy `.env.example` to `.env`. (The defaults in `.env.example` are pre-configured to work with the docker-compose setup).
3. **Start the Application**:
   ```bash
   docker-compose up -d --build
   ```
4. **Database Seeding**: The database is automatically seeded upon the first startup. It creates the following users:
   - Admin: `admin@example.com` / `adminpass123`
   - Member: `member@example.com` / `memberpass123`
   - Workspaces: 3 Desks, 2 Meeting Rooms.

The API will be available at `http://localhost:8000`.

## Design Decisions
- **Framework**: Express.js is used as a fast, unopinionated web framework for Node.js.
- **Database**: PostgreSQL handles relational data accurately, maintaining data integrity with constraints and foreign keys.
- **ORM**: Sequelize abstracts raw SQL queries while still enabling powerful transaction capabilities and migrations. 
- **Caching/Rate Limiting**: Redis is used for high-performance, in-memory data storage, specifically to rate-limit the `/api/auth/login` endpoint.
- **Database Initial Seed**: PostgreSQL's `init.sql` script executed via Docker's `docker-entrypoint-initdb.d` takes care of the schema creation and initial seeding without requiring an external migration script to run manually. `pgcrypto` is used to hash seeded passwords.

## Architecture
This project follows a Model-View-Controller (MVC) -like pattern without the View.
- `src/models`: Sequelize definitions corresponding to DB tables.
- `src/controllers`: Request handlers that execute business logic.
- `src/routes`: Express routers to direct HTTP endpoints to controllers.
- `src/middleware`: Intercepts requests for Authentication (JWT checking), Authorization (RBAC checking), and Rate Limiting.
