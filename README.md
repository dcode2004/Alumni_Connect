# LNMIIT Alumni Connect

A comprehensive alumni portal for LNMIIT, enabling alumni to connect, share experiences, and stay updated with their alma mater.

## Project Overview

This project consists of two main components:

- Frontend: Next.js web application
- Backend: Node.js REST API

## Features

- User Authentication (Google Sign-in & Manual)
- Alumni Profile Management
- Batch-wise Alumni Directory
- Admin Dashboard
- Email Notifications
- File Upload System
- Responsive Design

## Tech Stack

### Frontend

- Next.js 13
- React 18
- Material-UI
- Tailwind CSS
- Firebase (Authentication & Storage)
- Redux Toolkit

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Firebase Admin SDK
- Brevo (Sendinblue) Email API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase account
- Brevo (Sendinblue) account
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd Alumni_Connect
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

4. Set up environment variables:

- Copy `.env.example` to `.env` in both frontend and backend directories
- Fill in the required environment variables

5. Start the development servers:

Frontend (in frontend directory):

```bash
npm run dev
```

Backend (in backend directory):

```bash
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Project Structure

```
Alumni_Connect/
├── frontend/         # Next.js frontend application
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies
│
├── backend/         # Node.js backend server
│   ├── routes/      # API routes
│   ├── models/      # Database models
│   ├── helper/      # Utility functions
│   └── package.json # Backend dependencies
│
└── README.md        # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any queries or support, please contact the development team.
