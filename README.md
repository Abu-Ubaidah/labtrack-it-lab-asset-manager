# LabTrack
# https://labtrack.bedaah.me

LabTrack is an IT lab asset tracker for keeping equipment, faults, checkouts, and maintenance history in one place. It gives technicians a live view of the lab and keeps everyone working from the same records.

## Features

- Live asset dashboard with status and availability
- Search and filtering by asset type and status
- Fault flags, repairs, checkouts, and check-ins
- Audit history for asset changes
- Technician and viewer roles
- Real-time updates with Socket.IO
- Seeded demo assets and accounts

## Stack

React, Vite, Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, and Docker.

## Run with Docker

```bash
docker compose up --build
```

Open the app at `http://localhost:3004`. Mongo Express is available at `http://localhost:8084`.

## Run locally

Start MongoDB, then run the backend and frontend in separate terminals:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs on port `3003`; the backend runs on port `5003`. Keep database credentials and JWT secrets in local `.env` files only.

## Demo accounts

- `tech` / `tech1234` — technician access
- `viewer` / `viewer1234` — read-only access
