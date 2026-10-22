# Dorm Laundry Availability Tracker

A web application concept for helping students check dormitory laundry-room availability, see estimated time remaining on active cycles, and join a machine's reservation queue.

> **Project status:** This repository is an early scaffold. The application, API, and database described below are planned functionality and are not implemented yet.

## Planned features

- View washers and dryers with their current status.
- See estimated time remaining for machines in active cycles.
- View details and cycle history for a machine.
- Start and complete cycles through the API.
- Join and leave a machine's reservation queue.
- Refresh availability periodically in the frontend. Live push updates (such as WebSockets) are not part of the initial plan.

## Technology

- **Frontend:** React 18+, React Router 6
- **Backend:** FastAPI, Python 3.10+, Uvicorn
- **Database:** MySQL 8+
- **Data access and validation:** SQLAlchemy, Pydantic, MySQL Connector/Python

## Planned project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Data model

The initial database design uses three tables:

- **`machines`** stores the laundry-room inventory and machine status.
- **`cycles`** records machine cycles, including start/end times and duration.
- **`reservations`** stores the queue of students waiting for a machine. Queue order is by `created_at`, then `id`.

Example MySQL setup:

```sql
CREATE DATABASE IF NOT EXISTS dorm_laundry_db;
USE dorm_laundry_db;

CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_number VARCHAR(10) NOT NULL UNIQUE,
    type ENUM('Washer', 'Dryer') NOT NULL,
    floor_number INT NOT NULL,
    status ENUM('Available', 'In Use', 'Maintenance') NOT NULL DEFAULT 'Available'
);

CREATE TABLE cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    duration_minutes INT NOT NULL,
    status ENUM('Active', 'Completed') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);
```

Remaining time is estimated from a cycle's start time and duration. A cycle should be marked completed and its machine made available together; the backend should perform these updates in a database transaction. The backend should also protect cycle starts and reservation changes from conflicting concurrent requests.

Optional sample machines:

```sql
INSERT INTO machines (machine_number, type, floor_number, status) VALUES
    ('W-101', 'Washer', 1, 'Available'),
    ('W-102', 'Washer', 1, 'In Use'),
    ('D-101', 'Dryer', 1, 'Available'),
    ('D-102', 'Dryer', 1, 'Maintenance');
```

## Planned API

The FastAPI service will provide interactive API documentation at `http://localhost:8000/docs`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/machines` | List machines, status, and estimated remaining cycle time |
| `GET` | `/api/machines/{id}` | Get machine details and cycle history |
| `POST` | `/api/cycles/start` | Start a cycle on an available machine |
| `PUT` | `/api/cycles/complete/{id}` | Complete an active cycle and update machine status |
| `POST` | `/api/reservations` | Add a student to a machine's queue |
| `DELETE` | `/api/reservations/{id}` | Remove a reservation |

## Development setup

### Prerequisites

- Python 3.10+
- Node.js 16+ and npm
- MySQL 8+

### Database

Create the `dorm_laundry_db` database and tables by running the SQL above in a MySQL client. Add sample machines if desired.

### Backend

Once the backend files have been implemented:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install fastapi uvicorn sqlalchemy mysql-connector-python
uvicorn app.main:app --reload --port 8000
```

Configure the backend's MySQL connection using environment variables or another local, untracked configuration. Do not commit database passwords or other secrets.

### Frontend

Once the frontend files have been implemented:

```powershell
cd frontend
npm install
npm install react-router-dom
npm start
```

The frontend development server is expected at `http://localhost:3000`.

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.
