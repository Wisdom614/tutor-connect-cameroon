import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase/config';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, 
  FaGraduationCap, FaGoogle, FaCheckCircle 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    userType: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const cities = [
    'Yaoundé', 'Douala', 'Bamenda', 'Buea', 'Limbe',
    'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Kumba',
    'Other'
  ];

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.phone.match(/^[0-9\-\+]{9,15}$/)) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const createUserProfile = async (userCredential, additionalData = {}) => {
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: formData.fullName || user.displayName
    });

    // Create user profile in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      fullName: formData.fullName || user.displayName,
      phone: formData.phone || '',
      location: formData.location || '',
      userType: formData.userType,
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      profileCompleted: formData.userType === 'student',
      status: 'active',
      ...additionalData
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // If user is a tutor, create additional tutor profile
    if (formData.userType === 'tutor') {
      const tutorData = {
        uid: user.uid,
        subjects: [],
        qualifications: [],
        hourlyRate: 0,
        availability: [],
        rating: 0,
        totalSessions: 0,
        totalReviews: 0,
        status: 'pending',
        profileComplete: false,
        createdAt: new Date(),
        education: '',
        experience: '',
        bio: '',
        teachingStyle: ''
      };

      await setDoc(doc(db, 'tutors', user.uid), tutorData);
    }

    return userData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUserProfile(userCredential);
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect based on user type
      setTimeout(() => {
        if (formData.userType === 'tutor') {
          navigate('/tutor/profile-setup');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Please login or use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const additionalData = {
        fullName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };
      
      await createUserProfile(result, additionalData);
      
      setSuccess('Account created successfully with Google! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Google sign up error:', error);
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2><FaUser /> Join Tutor Connect</h2>
            <p>Create your account as a Student or Tutor</p>
          </div>
          
          {error && (
            <div className="error-message">
              <FaCheckCircle /> {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <FaCheckCircle /> {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
            
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
                placeholder="Create a password (min 6 characters)"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaLock /> Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaPhone /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+237 6XX XXX XXX"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
                disabled={loading}
              >
                <option value="">Select your city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <FaGraduationCap /> I want to join as
              </label>
              <div className="user-type-selector">
                <label className={`user-type-option ${formData.userType === 'student' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === 'student'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    disabled={loading}
                  />
                  <span>Student</span>
                  <small>Looking for tutors</small>
                </label>
                <label className={`user-type-option ${formData.userType === 'tutor' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="tutor"
                    checked={formData.userType === 'tutor'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    disabled={loading}
                  />
                  <span>Tutor</span>
                  <small>Offer tutoring services</small>
                </label>
              </div>
            </div>
            
            <div className="terms-agreement">
              <input 
                type="checkbox" 
                id="terms" 
                required 
                disabled={loading}
              />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or sign up with</span>
          </div>
          
          <button 
            className="btn btn-google btn-full"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <FaGoogle /> Sign up with Google
          </button>
          
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;