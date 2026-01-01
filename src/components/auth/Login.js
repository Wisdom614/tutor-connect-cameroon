import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/config';
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaExclamationCircle } from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2><FaSignInAlt /> Welcome Back</h2>
            <p>Sign in to your Tutor Connect account</p>
          </div>
          
          {error && (
            <div className="error-message">
              <FaExclamationCircle /> {error}
            </div>
          )}
          
          {resetEmailSent && (
            <div className="success-message">
              <p>Password reset email sent! Check your inbox.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaLock /> Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          
          <button 
            className="btn btn-google btn-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle /> Sign in with Google
          </button>
          
          <div className="auth-footer">
            <div className="auth-links">
              <button 
                type="button" 
                className="btn-text"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot your password?
              </button>
              <span className="divider">•</span>
              <Link to="/register" className="btn-text">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;