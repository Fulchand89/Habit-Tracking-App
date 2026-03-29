<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/19d25812-298d-4882-af6a-a514f5926cc9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
=======
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
>>>>>>> 4e080d64a0e8bf781d26ffb0ef7113f1fd9eb05f
