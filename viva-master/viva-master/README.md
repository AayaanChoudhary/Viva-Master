# DevConcepts Showcase

A full-stack MERN (MongoDB, Express, React, Node.js) application built to demonstrate core web development concepts clearly and interactively.

This project specifically highlights three key concepts:
1. **Schema Modeling (Mongo)**: Strict Mongoose schemas defining our backend data structure.
2. **Side effects with `useEffect`**: React component lifecycle management for data fetching.
3. **JavaScript — Hoisting**: An interactive UI demonstrating variable/function hoisting and the Temporal Dead Zone.

## Project Structure

This is a monorepo containing both the frontend and backend:

- `/frontend` - Vite + React application (Glassmorphic Premium UI)
- `/backend` - Express.js + MongoDB REST API

## Prerequisites

- Node.js (v18+)
- MongoDB (Running locally on default port 27017, or you can update the connection string in `backend/server.js`)

## Getting Started

### 1. Install Dependencies

First, install dependencies for the root workspace (this will allow you to run both projects at once):

```bash
npm install
```

Then, install dependencies for both the frontend and backend:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 2. Run the Application

You can start both the frontend and backend simultaneously from the root directory:

```bash
npm start
```

- **Frontend** will be running at [http://localhost:5173](http://localhost:5173)
- **Backend API** will be running at [http://localhost:5000](http://localhost:5000)

## Features

- **Graceful Fallback:** If you do not have MongoDB running, the frontend will detect the failed API call and automatically display fallback data so you can still view the UI and test the Hoisting demo.
- **Premium Design:** A modern, dark-mode glassmorphic UI built with pure CSS.
- **Interactive Demos:** The hoisting section actually executes code to prove how JavaScript handles variable scoping and execution contexts.
