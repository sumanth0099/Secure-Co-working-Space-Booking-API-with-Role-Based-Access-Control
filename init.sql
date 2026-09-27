CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('MEMBER', 'ADMIN')),
    credits INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('DESK', 'MEETING_ROOM')),
    capacity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'CONFIRMED'
);

INSERT INTO users (name, email, password_hash, role, credits) VALUES
('Admin User', 'admin@example.com', crypt('adminpass123', gen_salt('bf')), 'ADMIN', 1000),
('Member User', 'member@example.com', crypt('memberpass123', gen_salt('bf')), 'MEMBER', 100);

INSERT INTO workspaces (name, type, capacity) VALUES
('Desk 1', 'DESK', 1),
('Desk 2', 'DESK', 1),
('Desk 3', 'DESK', 1),
('Conference Room A', 'MEETING_ROOM', 10),
('Conference Room B', 'MEETING_ROOM', 5);
