# High-Level Design (HLD) - Secure File Vault

## 1. System Overview
The Secure File Vault is a web-based application designed to allow users to securely register, log in, and upload files. It implements role-based access control where standard users can only manage their own files, while administrators can oversee all files uploaded to the system. 

## 2. Architecture Pattern
The system follows a standard **Client-Server Architecture** utilizing the **MERN Stack**:
- **M**ongoDB: NoSQL Database
- **E**xpress.js: Backend Web Framework
- **R**eact.js: Frontend UI Library
- **N**ode.js: Runtime Environment

## 3. High-Level Components

### 3.1 Frontend (Client)
- **Framework:** React (Vite)
- **Role:** Handles user interface, client-side routing (`react-router-dom`), form validation, and communicating with the backend API via HTTP requests (`axios`).
- **Authentication State:** Manages the JWT token stored in `localStorage` to maintain sessions.

### 3.2 Backend (API Server)
- **Framework:** Node.js with Express
- **Role:** Serves as the central hub for business logic, authentication, and file processing.
- **Key Modules:**
  - **Auth Controller:** Issues JWTs and hashes passwords.
  - **File Controller:** Uses `multer` to stream and save uploaded files to the local disk.
  - **Middleware:** Intercepts requests to validate JWTs and check user roles (Admin vs. User).

### 3.3 Database
- **Type:** MongoDB (accessed via Mongoose ODM)
- **Role:** Persistently stores user profiles, credentials, and file metadata.

### 3.4 Storage Layer
- **Type:** Local File System (`/uploads` directory)
- **Role:** Stores the actual binary files uploaded by users.

## 4. High-Level Data Flow

### Authentication Flow (Login)
1. User submits credentials via the React UI.
2. React sends a `POST` request to the Express API.
3. Express queries MongoDB to find the user.
4. Express compares the hashed password.
5. If successful, Express signs and returns a JWT.
6. React stores the JWT and navigates to the Dashboard.

### File Upload Flow
1. Authenticated user selects a file and submits the upload form.
2. React sends a `multipart/form-data` POST request with the JWT in the `Authorization` header.
3. Express Auth Middleware verifies the JWT.
4. Express Multer Middleware parses the file and saves it to the `/uploads` folder.
5. Express creates a new `File` document in MongoDB containing the file's metadata and linking it to the User's ID.
6. Express returns success, and React refreshes the file list.
