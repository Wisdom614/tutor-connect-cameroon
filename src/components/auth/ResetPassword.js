import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { 
  FaLock, FaCheckCircle, FaExclamationCircle, 
  FaSpinner, FaShieldAlt, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Get reset code from URL
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setError('Invalid or expired reset link');
      setVerifying(false);
      setLoading(false);
      return;
    }

    verifyResetCode();
  }, [oobCode, mode]);

  const verifyResetCode = async () => {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      setEmail(email);
      setVerifying(false);
      setError('');
    } catch (error) {
      console.error('Reset code verification error:', error);
      setError('Invalid or expired reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await confirmPasswordReset(auth, oobCode, formData.password);
      
      setSuccess('Password reset successful! You can now login with your new password.');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to reset password. The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return { text: '', width: '0%' };
    if (length < 6) return { text: 'Weak', width: '33%', color: '#f44336' };
    if (length < 10) return { text: 'Medium', width: '66%', color: '#ff9800' };
    return { text: 'Strong', width: '100%', color: '#4caf50' };
  };

  const strength = passwordStrength();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="auth-container">
          <div className="auth-card">
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <p>Verifying reset link...</p>
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
          <div className="auth-header">
            <h2><FaShieldAlt /> Create New Password</h2>
            <p>Enter a new password for your account</p>
          </div>
          
          {error && (
            <div className="error-message">
              <FaExclamationCircle /> {error}
              {error.includes('expired') && (
                <div className="expired-link-actions">
                  <Link to="/forgot-password" className="btn btn-outline btn-small">
                    Request New Reset Link
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <FaCheckCircle /> {success}
              <p>Redirecting to login page...</p>
            </div>
          )}
          
          {!verifying && !success && (
            <>
              <div className="reset-info">
                <div className="email-display">
                  <FaCheckCircle />
                  <div>
                    <p>Resetting password for:</p>
                    <strong>{email}</strong>
                  </div>
                </div>
                <p className="security-note">
                  <FaShieldAlt /> For security, choose a strong password you haven't used before.
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    <FaLock /> New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter new password (min 6 characters)"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {formData.password && (
                    <div className="password-strength-indicator">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ 
                            width: strength.width,
                            backgroundColor: strength.color 
                          }}
                        ></div>
                      </div>
                      <span className="strength-text" style={{ color: strength.color }}>
                        {strength.text}
                      </span>
                    </div>
                  )}
                  
                  <div className="password-requirements">
                    <p><strong>Password Requirements:</strong></p>
                    <ul>
                      <li className={formData.password.length >= 6 ? 'met' : ''}>
                        At least 6 characters long
                      </li>
                      <li className={formData.password.match(/[A-Z]/) ? 'met' : ''}>
                        Contains uppercase letter
                      </li>
                      <li className={formData.password.match(/[a-z]/) ? 'met' : ''}>
                        Contains lowercase letter
                      </li>
                      <li className={formData.password.match(/[0-9]/) ? 'met' : ''}>
                        Contains number
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>
                    <FaLock /> Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm your new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {formData.password && formData.confirmPassword && (
                    <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                      {formData.password === formData.confirmPassword 
                        ? '✓ Passwords match' 
                        : '✗ Passwords do not match'
                      }
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full" 
                  disabled={loading || !formData.password || !formData.confirmPassword}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" /> Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
              
              <div className="security-tips">
                <h4><FaShieldAlt /> Security Tips:</h4>
                <ul>
                  <li>Use a unique password for each account</li>
                  <li>Consider using a password manager</li>
                  <li>Enable two-factor authentication for added security</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>
              
              <div className="auth-footer">
                <p>
                  Remember your password? <Link to="/login">Back to Login</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;