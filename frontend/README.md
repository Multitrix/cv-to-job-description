# CVCraft Frontend

A modern, responsive frontend for the CV generation platform built with React, TypeScript, and TailwindCSS.

## Features

- 🔥 **Firebase Google Authentication** - Secure login with Google
- 🎨 **Modern UI/UX** - Clean design with custom color palette
- 📱 **Responsive Design** - Works on all screen sizes  
- ⚡ **Fast Performance** - Optimized React with TypeScript
- 🛡️ **Type Safety** - Full TypeScript coverage
- 🎭 **Smooth Animations** - Framer Motion animations

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project setup
- Backend API running (see parent directory)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Configure Firebase in `.env.local`:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
├── services/           # API services
├── firebase.ts         # Firebase configuration
└── App.tsx            # Main app component
```

## Pages

- **Landing** (`/`) - Beautiful landing page with animated elements
- **Login** (`/login`) - Google authentication
- **Profile** (`/profile`) - User profile form for CV data

## Color Palette

The design uses a carefully chosen color palette:

- **Coral**: `#DB5461` - Call-to-action elements
- **Sage**: `#8AA29E` - Secondary elements  
- **Navy**: `#3D5467` - Text and primary elements
- **Cream**: `#F1EDEE` - Backgrounds

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## Integration with Backend

The frontend communicates with the FastAPI backend through:

- `POST /personal-info` - Save user profile data
- `GET /personal-info/{id}` - Retrieve user profile data
- `GET /test` - Health check

## Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase handles OAuth flow
3. User is redirected to profile page
4. Profile data is saved to backend Firestore database

## Deployment

Build the app for production:

```bash
npm run build
```

The `build` folder will contain the optimized production build.
