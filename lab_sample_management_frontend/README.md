# Helix Lab Sample Management

Laboratory sample management workspace built with React 18, Vite, Tailwind CSS v4, React Router v6, and Context API.

## Scripts

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Routes

- `/` — Login / Register
- `/dashboard` — Username greeting with Add Sample, View Samples, and Logout
- `/add-sample` — Create a sample
- `/view-samples` — Filter, paginate, edit, and delete samples
- `/edit-sample/:id` — Edit a sample with Username locked

## Frontend Architecture

The frontend follows this structure:

```text
Pages
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

UI components and pages should not make API requests directly. API and data-access logic should remain inside the service layer.

## Backend Integration

The frontend connects to the existing Spring Boot backend through:

`src/services/httpClient.js`

During local development:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

The Vite development server proxies `/api` requests to the Spring Boot backend.

The frontend uses relative API paths such as:

```text
/api/users/login
/api/samples
```

so the Vite proxy handles communication with the backend.

## Authentication API

The frontend connects to these Spring Boot endpoints:

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/logout`

The existing backend uses `HttpSession` for authentication.

`httpClient.js` sends:

```javascript
credentials: 'include'
```

so browser session cookies such as `JSESSIONID` can be included in requests.

The frontend must not treat localStorage as the backend authentication mechanism.

## Sample API

The frontend connects to:

- `POST /api/samples`
- `GET /api/samples`
- `GET /api/samples/{sampleId}`
- `PUT /api/samples/{sampleId}`
- `DELETE /api/samples/{sampleId}`

The backend is the source of truth for sample data.

## Data Models

### User

Frontend user model:

```javascript
{
  id,
  username,
  email,
  phone
}
```

The backend login response uses `userId`, which is mapped to the frontend `id` inside `authService.js`.

### Sample

Frontend sample model:

```javascript
{
  id,
  description,
  status,
  createdDate,
  createdTime,
  username
}
```

The backend returns `createdBy`, which is mapped to the frontend `username` inside `sampleService.js`.

The frontend must not send `username` when creating or updating a sample. The backend determines the authenticated user from the active `HttpSession`.

## Sample ID Compatibility

The existing Spring Boot backend defines Sample ID as `Long`.

Therefore, the frontend must use numeric Sample IDs such as:

```text
101
102
103
```

Values such as `SMP-001` are not compatible with the current backend model unless the backend is changed.

## Service Layer

The following services handle backend communication:

```text
src/services/
├── authService.js
├── sampleService.js
└── httpClient.js
```

### `authService.js`

Responsible for:

- Registration
- Login
- Logout
- Mapping backend authentication responses to frontend user models

### `sampleService.js`

Responsible for:

- Fetching samples
- Fetching a sample by ID
- Creating samples
- Updating samples
- Deleting samples
- Mapping backend sample responses to frontend sample models

### `httpClient.js`

Responsible for:

- Sending HTTP requests
- Including session credentials
- Handling JSON responses
- Handling HTTP errors
- Providing a consistent response structure to services

## State Management

### AuthContext

Manages:

- `currentUser`
- `isAuthenticated`
- Login
- Registration
- Logout

### SampleContext

Manages:

- `samples`
- Add Sample
- Update Sample
- Delete Sample
- Get Sample by ID
- Loading and error states

### ToastContext

Manages global:

- Success notifications
- Error notifications
- Informational notifications

## Local Storage

The original frontend used localStorage for mock/demo persistence with:

- `lab_users`
- `lab_auth_user`
- `lab_samples`

These keys should not be used as the source of truth after Spring Boot integration.

LocalStorage may still be used for limited frontend-only state where necessary, but authentication and sample data must come from the backend.

Passwords must never be stored in `lab_auth_user`.

## Authentication Session

The backend uses Spring Boot `HttpSession`.

The expected flow is:

```text
React Login
    ↓
POST /api/users/login
    ↓
Spring Boot
    ↓
HttpSession created
    ↓
JSESSIONID cookie
    ↓
React subsequent requests
    ↓
credentials: 'include'
    ↓
Spring Boot identifies the logged-in user
```

A future backend endpoint such as:

`GET /api/users/me`

may be added to verify and restore the current authenticated session after a page refresh.

## Development Principle

The frontend should remain independent of the backend implementation.

The intended architecture is:

```text
React UI
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

Do not place `fetch()` calls directly inside pages or reusable UI components.

Do not duplicate backend business logic in the frontend.

Keep API URLs centralized.

Keep backend response mapping inside the service layer.

This separation allows backend implementation details to change without requiring major changes to the React UI.

## Current Backend Integration Status

The frontend is connected to the Spring Boot backend for:

- User registration
- User login
- User logout
- Sample creation
- Sample retrieval
- Sample retrieval by ID
- Sample update
- Sample deletion

The service layer isolates backend communication so future backend changes can be handled with minimal impact on the React UI.

## Backend Integration Checklist

```text
[x] Spring Boot backend running on port 8080
[x] Backend CORS configured for http://localhost:5173
[x] CORS credentials enabled for session cookies
[x] Vite proxy configured for http://localhost:8080
[x] authService.js connected to backend
[x] sampleService.js connected to backend
[x] Backend/frontend DTO mappings verified
[x] Sample ID changed to numeric Long-compatible values
[x] Session-based authentication tested
[x] Sample CRUD tested through the React UI
```