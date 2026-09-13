# Helix Lab Sample Management

A full-stack laboratory sample management system with a React frontend and Spring Boot backend.

## Tech Stack

### Frontend
- React 18
- Vite
- JavaScript
- Tailwind CSS v4
- React Router v6
- Context API

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- Bean Validation
- HTTP Session Authentication
- Maven

## Project Structure

```text
helix-lab-sample-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    └── src/
        └── main/
            └── java/
                └── com/letustech/lab_sample_management_backend/
                    ├── config/
                    └── user/
                        ├── controller/
                        ├── dto/
                        ├── entity/
                        ├── exception/
                        ├── repository/
                        ├── service/
                        └── util/
```

## Running the Project

Start the Spring Boot backend on:

```text
http://localhost:8080
```

Start the Vite frontend on:

```text
http://localhost:5173
```

The frontend uses the Vite proxy to forward `/api` requests to the backend.

## Application Features

- User registration and login
- Session-based authentication
- Dashboard with authenticated user
- Sample creation
- Sample listing
- Status filtering
- Pagination
- Sample editing
- Sample deletion with confirmation
- Global toast notifications
- Backend availability notification
- Responsive UI

## Frontend Routes

```text
/                    Login / Register
/dashboard           Dashboard
/add-sample          Create sample
/view-samples        View, filter, paginate, edit and delete samples
/edit-sample/:id     Edit sample
```

## Backend API

### Health

```text
GET /api/health
```

### Users

```text
POST /api/users/register
POST /api/users/login
GET  /api/users/me
POST /api/users/logout
```

### Samples

```text
POST   /api/samples
GET    /api/samples
GET    /api/samples/{sampleId}
PUT    /api/samples/{sampleId}
DELETE /api/samples/{sampleId}
```

## Authentication

Authentication uses Spring Boot `HttpSession`.

After login, the backend stores the authenticated user's information in the session. The frontend sends requests with credentials enabled so the browser can include the session cookie.

```text
Login
  ↓
Spring Boot
  ↓
HttpSession
  ↓
JSESSIONID
  ↓
Authenticated API requests
```

## Data Model

### User

```text
id
username
email
password
phone
```

### Sample

```text
id
description
status
createdDate
createdTime
user
```

Supported sample statuses:

```text
Created
In Progress
Completed
```

Sample IDs are manually provided and stored as `Long` values.

## Frontend Architecture

The frontend separates UI, state, and backend communication:

```text
Pages / Components
        ↓
Context / Hooks
        ↓
Service Layer
        ↓
HTTP Client
        ↓
Spring Boot REST API
        ↓
MySQL
```

API requests are kept inside the service layer rather than individual UI components.

## CORS

The backend allows the Vite frontend origin:

```text
http://localhost:5173
```

Credentials are enabled for session-based authentication.

## Error Handling

The backend provides application-level validation and centralized exception handling.

Common HTTP responses:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
500 Internal Server Error
```

The frontend displays user-friendly toast messages instead of exposing unnecessary technical details.

## Frontend Configuration

The frontend uses:

```text
/api
```

for API requests.

The Vite development server proxies these requests to:

```text
http://localhost:8080
```

## Design

The application uses a clean, professional laboratory-inspired interface with responsive layouts, reusable components, accessible controls, status badges, pagination, and global notifications.

## Development Notes

The backend is the source of truth for user and sample data.

Frontend service modules handle API communication and response mapping so backend implementation details remain separated from the UI.
