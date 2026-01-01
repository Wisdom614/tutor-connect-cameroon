import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/main.css';

// Import Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TutorProfile from './components/tutors/TutorProfile';
import TutorSearch from './components/tutors/TutorSearch';
import TutorProfileSetup from './components/tutors/TutorProfileSetup';
import BookingForm from './components/booking/BookingForm';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import EmailVerified from './components/auth/EmailVerified';

// Private Route Component
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, userData } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userData?.userType !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<TutorSearch />} />
            <Route path="/tutor/:id" element={<TutorProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            
            {/* Protected Routes */}
            <Route path="/book/:tutorId" element={
              <PrivateRoute>
                <BookingForm />
              </PrivateRoute>
            } />
            
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/admin/*" element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/tutor/profile-setup" element={
              <PrivateRoute requiredRole="tutor">
                <TutorProfileSetup />
              </PrivateRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;