# API Documentation - Secure File Vault

Base URL: `http://localhost:5000/api`

## Authentication Routes

### 1. Register User
- **URL:** `/auth/register`
- **Method:** `POST`
- **Access:** Public
- **Description:** Registers a new user and returns a JWT.
- **Request Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "_id": "60d5ecb8b392d70015...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### 2. Login User
- **URL:** `/auth/login`
- **Method:** `POST`
- **Access:** Public
- **Description:** Authenticates a user and returns a JWT.
- **Request Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392d70015...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

---

## File Routes

*Note: All File routes require a valid JWT token to be passed in the `Authorization` header as a Bearer token.*
`Authorization: Bearer <your_jwt_token>`

### 3. Upload File
- **URL:** `/files/upload`
- **Method:** `POST`
- **Access:** Private
- **Description:** Uploads a file (max 5MB) to the server.
- **Request Body:** `multipart/form-data` with a key of `file`.
- **Success Response (201 Created):**
  ```json
  {
    "_id": "60f1a2b3c4...",
    "filename": "file-1626435643.png",
    "originalname": "my_picture.png",
    "path": "uploads/file-1626435643.png",
    "size": 102456,
    "mimetype": "image/png",
    "user": "60d5ecb8b392d70015..."
  }
  ```

### 4. Get Files
- **URL:** `/files`
- **Method:** `GET`
- **Access:** Private
- **Description:** Retrieves files. Standard users receive only their own files. Admins receive all files.
- **Success Response (200 OK):**
  ```json
  [
    {
      "_id": "60f1a2b3c4...",
      "filename": "file-1626435643.png",
      "originalname": "my_picture.png",
      ...
    }
  ]
  ```

### 5. Delete File
- **URL:** `/files/:id`
- **Method:** `DELETE`
- **Access:** Private
- **Description:** Deletes a specific file by its database ID. A user can only delete their own file unless they are an admin.
- **Success Response (200 OK):**
  ```json
  {
    "message": "File removed successfully"
  }
  ```
