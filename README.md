# Consistency Tracker (Habit Tracking App)

A full-stack application built to help users track their daily habits and stay consistent.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **Charts**: Recharts or Chart.js

## Features

- Secure User Registration & Login
- Create, Edit, and Delete Habits
- Daily Completion Tracking (One log per habit per day)
- Visual Progress Dashboard with Streaks & Weekly Stats
- Responsive Design (Mobile & Desktop)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)

### Setup

1. Clone the repository.
2. Navigate to the `server` directory and run `npm install`.
3. Create a `.env` file in the `server` directory with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. Start the server: `npm run dev`.
5. Navigate to the `client` directory and run `npm install`.
6. Start the frontend: `npm run dev`.

## Architecture

The project follows a client-server architecture. The backend (Node/Express) handles API requests and database interactions, while the frontend (React) provides a dynamic and responsive user interface.
