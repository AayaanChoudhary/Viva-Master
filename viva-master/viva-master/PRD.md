# Product Requirements Document (PRD) - Secure File Vault

## 1. Product Overview
The Secure File Vault is a web application designed to act as a personal, secure cloud storage drive. It allows users to register, log in, and securely upload their personal files to a centralized server. The system strictly enforces privacy, ensuring that standard users can only access and manage their own files.

## 2. Target Audience
- Individuals who need a private, secure location to store their files.
- Organizations looking for a self-hosted alternative for file sharing and storage with basic role management.

## 3. Core Features & Requirements

### 3.1 User Authentication & Authorization
- **Requirement:** Users must be able to securely register for an account using a name, valid email, and password.
- **Requirement:** Passwords must be hashed before storage to ensure security.
- **Requirement:** Users must be able to log in and receive a secure session token (JWT) to access protected routes.
- **Requirement:** The system must support roles (`user` and `admin`).
- **Requirement:** Users must have the ability to toggle password visibility during login and registration.

### 3.2 File Management
- **Requirement:** Authenticated users must be able to upload files (up to 5MB in size).
- **Requirement:** Users must be able to view a list of all files they have successfully uploaded, including metadata such as file name and file size.
- **Requirement:** Users must be able to delete their own uploaded files. Deleting a file must remove both the database record and the actual physical file from the server.

### 3.3 Role-Based Access Control
- **Requirement:** A standard `user` must only be able to view and delete files that they personally uploaded.
- **Requirement:** An `admin` user must be able to view and delete any file uploaded to the system by any user.

### 3.4 User Interface
- **Requirement:** The application must have a responsive, modern web interface.
- **Requirement:** The application must provide clear loading states (e.g., spinners) while files are uploading or data is fetching.
- **Requirement:** The application must provide clear error messages for invalid inputs (e.g., mismatched passwords, unsupported file types, or server errors).

## 4. Technical Constraints
- The frontend must be built using React.js.
- The backend must be built using Node.js and Express.js.
- Data must be stored in a MongoDB database using Mongoose for schema modeling.
- The system must not store passwords in plain text.
- File uploads must be handled via `multipart/form-data`.
