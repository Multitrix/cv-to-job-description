import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LearnMore from './pages/LearnMore';
import Profile from './pages/Profile';
import CVGenerator from './pages/CVGenerator';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cv-generator" element={<CVGenerator />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
