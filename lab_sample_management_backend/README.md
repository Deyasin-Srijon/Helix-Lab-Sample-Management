# Lab Sample Management Backend

Spring Boot REST API for the Lab Sample Management System.

## Tech Stack

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
src/main/java/com/letustech/lab_sample_management_backend/
├── config/
│   ├── CorsConfig.java
│   └── HealthController.java
└── user/
    ├── controller/
    ├── dto/
    ├── entity/
    ├── repository/
    ├── service/
    ├── exception/
    └── util/
```

## API Base URL

```text
http://localhost:8080
```

## Endpoints

### Health

```text
GET /api/health
```

Checks whether the backend is running.

### Authentication

```text
POST /api/users/register
POST /api/users/login
GET  /api/users/me
POST /api/users/logout
```

Authentication uses Spring `HttpSession`.

The logged-in user's `userId` and `username` are stored in the session.

### Samples

```text
POST   /api/samples
GET    /api/samples
GET    /api/samples/{sampleId}
PUT    /api/samples/{sampleId}
DELETE /api/samples/{sampleId}
```

Sample records belong to the authenticated user.

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

Sample IDs are manually provided and stored as `Long` values.

Supported statuses:

```text
Created
In Progress
Completed
```

## Validation & Error Handling

Bean Validation is used for request validation.

Common responses:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
500 Internal Server Error
```

Application-specific exceptions are handled centrally by `GlobalExceptionHandler`.

## CORS

The backend allows requests from the Vite frontend:

```text
http://localhost:5173
```

Credentials are enabled for session-cookie authentication.

## Configuration

Configure the MySQL connection and application settings in:

```text
src/main/resources/application.properties
```

## Frontend Integration

The React frontend communicates with this backend through `/api` endpoints and sends credentials so the browser session cookie can be used for authenticated requests.
