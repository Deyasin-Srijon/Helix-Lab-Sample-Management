# Lab Sample Management - Admin Backend

This is a separate Spring Boot project for the Admin Panel.

It runs independently on port **8081** and connects to the same MySQL database (`labsamples`)
used by the User Backend. It does not start or depend on the User Backend process.

## Technologies
- Java 21
- Spring Boot 4.1.1
- Spring WebMVC
- Spring Data JPA
- MySQL
- Maven

## Admin login credentials

The demo credentials are hardcoded in:

`src/main/java/com/letustech/lab_sample_management_admin_backend/admin/service/AdminService.java`

```java
private static final String ADMIN_USERNAME = "Admin";
private static final String ADMIN_PASSWORD = "Admin@2504";
```

Change these values directly in `AdminService.java` if you want different credentials.

**Security warning:** The password is deliberately stored and compared as plain text because this is what was requested. Anyone who can read the source code or compiled application can recover it. Do not deploy this authentication design to a public or production environment.

## Run the backend

Make sure MySQL is running and the `labsamples` database exists. The database connection settings are in `src/main/resources/application.properties`.

From this project folder:

### Windows
```powershell
.\mvnw.cmd spring-boot:run
```

### macOS / Linux
```bash
./mvnw spring-boot:run
```

The admin backend starts at:

`http://localhost:8081`

## API endpoints

All admin endpoints except health require the admin session cookie (`JSESSIONID`).

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Admin backend health check |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/me` | Check admin session |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/samples` | Get samples from all users |
| GET | `/api/admin/samples/{id}` | Get one sample |
| PUT | `/api/admin/samples/{id}` | Update description and status |
| DELETE | `/api/admin/samples/{id}` | Delete a sample |

### Login request
```json
{
  "email": "admin",
  "password": "admin123"
}
```

The `email` request property accepts the admin username because it matches the current admin frontend request structure.

## Frontend connection

The Admin Frontend should use:

`http://localhost:8081/api`

The Admin Frontend development server uses port `5174`. CORS is configured for `http://localhost:5174`.

## Database note

This project maps the existing `users` and `samples` tables. It does not create a second copy of those tables. The Admin Backend can therefore view and manage samples created through the User Backend.
