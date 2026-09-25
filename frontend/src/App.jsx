import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Post from './pages/Post';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Read the saved login (so the user stays logged in after a refresh)
const savedUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

function App() {
  const [user, setUser] = useState(savedUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token') && !!savedUser());

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  const needLogin = (page) => (isLoggedIn ? page : <Navigate to="/login" replace />);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} user={user} />

      <Routes>
        {/* 1. Landing page */}
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} user={user} />} />

        {/* 2. Browse: strays + pets for adoption */}
        <Route path="/browse" element={<Browse isLoggedIn={isLoggedIn} user={user} />} />

        {/* 3. Post a stray or a pet for adoption (also used to edit your own post) */}
        <Route path="/post" element={needLogin(<Post />)} />
        <Route path="/post/:kind/:id" element={needLogin(<Post />)} />

        <Route path="/notifications" element={needLogin(<Notifications />)} />
        <Route path="/profile" element={needLogin(<Profile user={user} setUser={setUser} />)} />

        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />

        {/* Old links (Home page buttons etc.) still work */}
        <Route path="/sightings" element={<Navigate to="/browse" replace />} />
        <Route path="/adoption" element={<Navigate to="/browse" replace />} />
        <Route path="/report-sighting" element={<Navigate to="/post" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
