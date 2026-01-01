import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { 
  FaEnvelope, FaCheckCircle, FaExclamationCircle, 
  FaArrowLeft, FaSpinner, FaShieldAlt 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Enter email, 2: Success, 3: Check inbox
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false
      });

      setStep(2); // Move to success step
      setSuccess(`Password reset email sent to ${email}`);
      
      // Auto-advance to check inbox step after 3 seconds
      setTimeout(() => {
        setStep(3);
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Reset email resent! Please check your inbox.');
    } catch (error) {
      setError('Failed to resend email. Please try again.');
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
            <h2><FaShieldAlt /> Reset Your Password</h2>
            <p>Enter your email to receive a password reset link</p>
          </div>
          
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              {error && (
                <div className="error-message">
                  <FaExclamationCircle /> {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" /> Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
              
              <div className="password-reset-info">
                <h4><FaCheckCircle /> What to expect:</h4>
                <ul>
                  <li>You'll receive an email with a password reset link</li>
                  <li>The link expires in 1 hour for security</li>
                  <li>Check your spam folder if you don't see it</li>
                  <li>Contact support if you continue having issues</li>
                </ul>
              </div>
              
              <div className="auth-footer">
                <Link to="/login" className="back-to-login">
                  <FaArrowLeft /> Back to Login
                </Link>
              </div>
            </>
          )}
          
          {/* Step 2: Success Message */}
          {step === 2 && (
            <div className="success-state">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h3>Email Sent Successfully!</h3>
              <p>We've sent a password reset link to:</p>
              <div className="email-display">
                <FaEnvelope />
                <strong>{email}</strong>
              </div>
              <p className="success-message">
                Please check your inbox and click the link to reset your password.
              </p>
              <button 
                className="btn btn-outline"
                onClick={() => setStep(3)}
              >
                Next: Check Your Inbox
              </button>
            </div>
          )}
          
          {/* Step 3: Check Inbox */}
          {step === 3 && (
            <div className="check-inbox-state">
              <div className="inbox-icon">
                📧
              </div>
              <h3>Check Your Inbox</h3>
              <p>We've sent the password reset instructions to your email.</p>
              
              <div className="instructions">
                <h4><FaCheckCircle /> Next Steps:</h4>
                <ol>
                  <li>Open the email from Tutor Connect</li>
                  <li>Click the "Reset Password" button/link</li>
                  <li>Create a new strong password</li>
                  <li>Login with your new password</li>
                </ol>
              </div>
              
              <div className="troubleshooting">
                <h4><FaExclamationCircle /> Didn't receive the email?</h4>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and check again</li>
                  <li>Add noreply@firebaseapp.com to safe senders</li>
                </ul>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn btn-outline"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinner" /> : <FaEnvelope />}
                  Resend Email
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </button>
              </div>
              
              <div className="contact-support">
                <p>
                  Still having trouble? <Link to="/contact">Contact Support</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;