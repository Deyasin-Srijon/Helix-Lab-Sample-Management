# Helix Lab Sample Management – Admin Panel

Administrator panel for reviewing, updating, and deleting laboratory samples submitted through the user-facing application. Fully backend-driven with exclusive communication to the Spring Boot REST API.

## Features

- Backend authentication and session management via Spring Boot session cookies (`JSESSIONID`)
- Dashboard statistics calculated from live backend sample records
- Sample table with status badges, filtering, and pagination
- Edit sample description and status via backend REST API
- Delete samples with confirmation via backend REST API
- Fully backend-driven architecture with zero browser-based local data storage

## Requirements

- Node.js 18 or later
- npm
- Running Spring Boot backend (`lab_sample_management_backend`) on `http://localhost:8080`

## Setup

```bash
# Install dependencies
npm install
```

Copy environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

Default configuration:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Run

```bash
# Start the development server
npm run dev
```

Open the printed local URL, typically `http://localhost:5174`.

## Authentication & API Endpoints

Authentication is handled securely by the Spring Boot backend using session cookies (`credentials: 'include'`).

Required backend endpoints:

- `POST /api/admin/login`: Validates administrator credentials and establishes session.
- `POST /api/admin/logout`: Terminates administrator session.
- `GET /api/admin/me`: Verifies active session status on startup.
- `GET /api/admin/samples`: Retrieves all laboratory sample records.
- `GET /api/admin/samples/{id}`: Retrieves a single sample record by ID.
- `PUT /api/admin/samples/{id}`: Updates sample description and status.
- `DELETE /api/admin/samples/{id}`: Deletes a sample record.

Expected sample response shape:

```json
{
  "id": 101,
  "description": "Blood sample",
  "status": "Created",
  "createdBy": "labuser",
  "createdDate": "2026-10-31"
}
```

`createdBy` is displayed as Requested By and is not editable.

## Project Structure

```
src/
  components/
  pages/
  context/
  services/
  config/
  utils/
  App.jsx
  main.jsx
  index.css
```


## Separate Admin Backend connection

This Admin Frontend connects to the independent Admin Backend at `http://localhost:8081/api`.
The User Backend can continue running separately on port `8080`.


## Authentication toast notifications

The Admin Frontend displays toast notifications for:
- Successful administrator login.
- Failed login (including incorrect username/password).
- Successful logout.
- Logout when the backend cannot confirm the session termination.

Authentication toasts are rendered at the application root so they remain visible
when React Router redirects between pages.
