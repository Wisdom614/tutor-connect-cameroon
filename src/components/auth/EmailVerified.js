import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { 
  FaCheckCircle, FaExclamationCircle, FaSpinner, 
  FaEnvelope, FaArrowRight, FaUserCheck 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);

  // Get verification code from URL
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  const continueUrl = searchParams.get('continueUrl');

  useEffect(() => {
    if (!oobCode || mode !== 'verifyEmail') {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [oobCode, mode]);

  const verifyEmail = async () => {
    try {
      // Get email from action code
      const info = await checkActionCode(auth, oobCode);
      setEmail(info.data.email);
      
      // Apply the action code
      await applyActionCode(auth, oobCode);
      
      setVerified(true);
      setSuccess('Email verified successfully!');
      
      // Update user's emailVerified status in Firestore if needed
      // You can add Firestore update logic here
      
    } catch (error) {
      console.error('Email verification error:', error);
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          setError('Invalid or expired verification link.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        default:
          setError('Failed to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (continueUrl) {
      window.location.href = continueUrl;
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="auth-container">
          <div className="auth-card">
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <p>Verifying your email...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="verification-result">
            {error ? (
              <div className="error-state">
                <div className="error-icon">
                  <FaExclamationCircle />
                </div>
                <h3>Verification Failed</h3>
                <p>{error}</p>
                <div className="error-actions">
                  <Link to="/login" className="btn btn-outline">
                    Go to Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Create New Account
                  </Link>
                </div>
              </div>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <FaUserCheck />
                </div>
                <h3>Email Verified Successfully!</h3>
                <div className="verified-email">
                  <FaEnvelope />
                  <strong>{email}</strong>
                </div>
                <p className="success-message">
                  Your email has been verified. You can now access all features of Tutor Connect.
                </p>
                
                <div className="verified-benefits">
                  <h4><FaCheckCircle /> What you can do now:</h4>
                  <ul>
                    <li>Complete your profile</li>
                    <li>Book tutoring sessions</li>
                    <li>Connect with tutors/students</li>
                    <li>Access premium features</li>
                  </ul>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={handleContinue}
                  >
                    Continue to Dashboard <FaArrowRight />
                  </button>
                  <Link to="/login" className="btn btn-outline">
                    Go to Login
                  </Link>
                </div>
                
                <div className="next-steps">
                  <h4>Next Steps:</h4>
                  <ol>
                    <li>Complete your profile setup</li>
                    <li>Verify your phone number for added security</li>
                    <li>Explore available tutors or students</li>
                    <li>Set up your availability (for tutors)</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerified;