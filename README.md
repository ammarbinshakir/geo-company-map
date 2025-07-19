# Geo-Company Map

A full-stack web application to add and visualize geo-tagged company data on an interactive map.

---

## Stack

- **Backend:** FastAPI + PostgreSQL + PostGIS
- **Frontend:** React (Next.js 15 with App Router, TailwindCSS, Leaflet.js)
- **Database:** PostgreSQL with PostGIS extension for geospatial data
- **DevOps:** Docker & Docker Compose
- **Validation:** Pydantic with Zod on frontend
- **Map:** Leaflet.js with optional dark mode

---

## Features

- Add companies with name, address, and industry
- Geocode address to latitude/longitude
- View companies plotted on an interactive Leaflet map
- Responsive and mobile-friendly design
- Dockerized setup for easy deployment and development

---

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── ...
│   └── ...
├── frontend/             # Next.js frontend
│   ├── app/
│   ├── components/
│   └── .env              # Frontend env vars
├── .env                  # Backend env vars
├── docker-compose.yml    # Container orchestration
├── .gitignore
└── README.md

```

---

## Getting Started with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/ammarbinshakir/geo-company-map.git
cd geo-company-map
```

### ✅ 2. Create Environment Files

Create the following `.env` files:

### backend/.env.example

```env
DATABASE_URL=postgresql://postgres:postgres@geo_db:5432/postgres
```

### frontend/.env.example

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

Swagger available at `/docs`.

- `GET /companies/` – List companies
- `POST /companies/` – Add new company

---

## Frontend Overview

- `CompanyForm`: Form to add a company
- `CompanyMap`: Leaflet map showing company markers
- Stack: `react-leaflet`, `zod`, `@tanstack/react-query`, Tailwind CSS

---

## Requirements

This project uses Docker for development and deployment. However, if you plan to run the backend or frontend outside of containers, ensure the following versions are installed:

| Tool           | Version                       |
| -------------- | ----------------------------- |
| **Python**     | 3.11 (via `python:3.11-slim`) |
| **Node.js**    | 20.x (via `node:20-alpine`)   |
| **Docker**     | 24.x or later                 |
| **PostgreSQL** | 15+ with PostGIS extension    |

> ⚠️ **Note:** If you're using Docker Compose (recommended), you don't need to install Python or Node.js locally — everything is containerized.
