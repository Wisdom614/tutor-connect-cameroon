import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaUser, FaSignOutAlt, FaChalkboardTeacher, FaBars, FaTimes, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const Navbar = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <FaChalkboardTeacher className="logo-icon" />
          <span>TutorConnect Cameroon</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome /> Home
            </Link>
          </li>
          <li>
            <Link 
              to="/search" 
              className={isActive('/search') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaSearch /> Find Tutors
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={isActive('/about') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaInfoCircle /> About Us
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className={isActive('/contact') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaEnvelope /> Contact
            </Link>
          </li>
          
          {user ? (
            <>
              <li>
                <Link 
                  to="/dashboard" 
                  className={isActive('/dashboard') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser /> Dashboard
                </Link>
              </li>
              {userData?.userType === 'admin' && (
                <li>
                  <Link 
                    to="/admin" 
                    className={isActive('/admin') ? 'active' : ''}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="btn btn-outline">
                  <FaSignOutAlt /> Logout
                </button>
              </li>
              <li className="user-info">
                <span className="user-greeting">Hi, {userData?.fullName?.split(' ')[0] || 'User'}!</span>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login" 
                  className="btn btn-outline" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="btn btn-primary" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;