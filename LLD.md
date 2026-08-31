# Low-Level Design (LLD) - Secure File Vault

## 1. Database Schema (MongoDB / Mongoose)

### 1.1 `User` Collection
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto-generated | Primary Key |
| `name` | String | Required | User's full name |
| `email` | String | Required, Unique | User's email address |
| `password` | String | Required | Bcrypt-hashed password |
| `role` | Enum | Default: 'user' | Access level ('user' or 'admin') |
| `createdAt` | Date | Auto-generated | Timestamp |
| `updatedAt` | Date | Auto-generated | Timestamp |

**Hooks & Methods:**
- `pre('save')`: Hashes the password using `bcryptjs` with a salt round of 10 if the password field is modified.
- `comparePassword(candidate)`: Compares a plain text password against the hashed password.

### 1.2 `File` Collection
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Auto-generated | Primary Key |
| `filename` | String | Required | The unique name given by Multer |
| `originalname` | String | Required | The original file name |
| `path` | String | Required | Local path to the file |
| `size` | Number | Required | File size in bytes |
| `mimetype` | String | Required | File MIME type |
| `user` | ObjectId | Required, Ref: 'User' | The ID of the user who uploaded the file |
| `createdAt` | Date | Auto-generated | Timestamp |

---

## 2. API Endpoints (Express.js)

### 2.1 Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Middleware | Description |
|--------|----------|--------|------------|-------------|
| POST | `/register` | Public | `express-validator` | Validates input, checks for existing email, hashes password, saves User, returns JWT. |
| POST | `/login` | Public | `express-validator` | Validates input, checks password against hash, returns JWT. |

### 2.2 File Routes (`/api/files`)
| Method | Endpoint | Access | Middleware | Description |
|--------|----------|--------|------------|-------------|
| POST | `/upload` | Private | `protect`, `multer` | Verifies JWT, accepts max 5MB file, saves to `/uploads`, creates File doc linked to User ID. |
| GET | `/` | Private | `protect` | Verifies JWT. If user is admin, returns all files (populated with user data). If standard user, returns only their files. |
| GET | `/admin/all` | Private (Admin) | `protect`, `admin` | Strict admin route returning all files. |

---

## 3. Frontend Component Structure (React)

```text
App (Configures react-router-dom)
 │
 ├── Login Page (/login)
 │    ├── Uses controlled state for email/password.
 │    ├── Validates empty fields before submission.
 │    └── Upon success, saves JWT/User to localStorage and redirects to Dashboard.
 │
 ├── Register Page (/register)
 │    ├── Uses controlled state for name/email/password/confirm.
 │    ├── Validates matching passwords and length.
 │    └── Upon success, registers, saves JWT/User, redirects to Dashboard.
 │
 └── Dashboard Page (/dashboard)
      ├── Checks localStorage for JWT on mount; redirects to /login if missing.
      ├── UploadSection Component:
      │    └── Handles `multipart/form-data` submission via Axios.
      └── FileList Component:
           └── Fetches and maps over files array. Conditionally renders admin-specific metadata (like uploader's email).
```

## 4. Security Implementation Details

- **Password Storage:** Passwords are never stored in plain text. `bcryptjs` is used at the database layer.
- **Stateless Sessions:** JWT (JSON Web Tokens) are used. The backend does not store session IDs in memory. The token is signed with a secret key (`JWT_SECRET`).
- **Authorization Middleware (`auth.js`):**
  - `protect`: Extracts the Bearer token from the `Authorization` header, decodes it, and attaches the corresponding user document to `req.user`. Throws 401 on failure.
  - `admin`: Checks if `req.user.role === 'admin'`. Throws 403 on failure.
- **Input Sanitization:** `express-validator` checks incoming request bodies for required fields, string lengths, and valid email formats before hitting the database logic.
- **Upload Restrictions:** Multer configuration strictly limits file sizes to 5MB to prevent memory exhaustion / DoS via large payloads.
