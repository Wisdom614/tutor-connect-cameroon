import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaBook, 
  FaUserGraduate, 
  FaMoneyBill, 
  FaCheckCircle,
  FaVideo,
  FaUserFriends,
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaSpinner,
  FaArrowLeft,
  FaBell
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const BookingForm = () => {
  const { tutorId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date(),
    duration: '1',
    subject: '',
    level: '',
    notes: '',
    meetingType: 'online',
    location: ''
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'Computer Science', 'Economics',
    'Accounting', 'History', 'Geography', 'Literature'
  ];

  const levels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary-junior', label: 'Secondary (Form 1-2)' },
    { value: 'secondary-senior', label: 'Secondary (Form 3-5)' },
    { value: 'sixth-lower', label: 'Sixth Form (Lower)' },
    { value: 'sixth-upper', label: 'Sixth Form (Upper)' },
    { value: 'university', label: 'University' },
    { value: 'professional', label: 'Professional' }
  ];

  const durations = [
    { value: '1', label: '1 hour' },
    { value: '1.5', label: '1.5 hours' },
    { value: '2', label: '2 hours' },
    { value: '2.5', label: '2.5 hours' },
    { value: '3', label: '3 hours' }
  ];

  const meetingTypes = [
    { value: 'online', label: 'Online Session', icon: <FaVideo />, desc: 'Video call via Zoom/Google Meet' },
    { value: 'in-person', label: 'In Person', icon: <FaUserFriends />, desc: 'Face-to-face meeting' },
    { value: 'both', label: 'Either is fine', icon: <FaCheckCircle />, desc: 'Open to both options' }
  ];

  useEffect(() => {
    fetchTutorData();
    checkExistingBookings();
  }, [tutorId]);

  const fetchTutorData = async () => {
    try {
      const tutorDoc = await getDoc(doc(db, 'tutors', tutorId));
      const userDoc = await getDoc(doc(db, 'users', tutorId));
      
      if (tutorDoc.exists() && userDoc.exists()) {
        setTutor({ ...tutorDoc.data(), ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching tutor data:', error);
      setError('Failed to load tutor information');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingBookings = async () => {
    if (!user) return;
    
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('studentId', '==', user.uid),
        where('tutorId', '==', tutorId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      
      const snapshot = await getDocs(bookingsQuery);
      if (!snapshot.empty) {
        setError('You already have a pending or confirmed booking with this tutor');
      }
    } catch (error) {
      console.error('Error checking existing bookings:', error);
    }
  };

  const calculateTotal = () => {
    const rate = tutor?.hourlyRate || 0;
    const duration = parseFloat(formData.duration);
    return (rate * duration).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: `/book/${tutorId}` } });
      return;
    }

    // Validation
    if (!formData.subject) {
      setError('Please select a subject');
      return;
    }

    if (!formData.level) {
      setError('Please select academic level');
      return;
    }

    if (formData.date < new Date()) {
      setError('Please select a future date and time');
      return;
    }

    if (formData.meetingType === 'in-person' && !formData.location.trim()) {
      setError('Please specify meeting location for in-person sessions');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Create booking document in Firestore
      const bookingData = {
        studentId: user.uid,
        tutorId: tutorId,
        studentName: userData?.fullName || user.email,
        tutorName: tutor?.fullName,
        date: formData.date,
        duration: parseFloat(formData.duration),
        subject: formData.subject,
        level: formData.level,
        notes: formData.notes,
        meetingType: formData.meetingType,
        location: formData.location,
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: 'pending',
        meetingLink: '', // Will be set by tutor
        studentEmail: user.email,
        tutorEmail: tutor?.email
      };

      console.log('Creating booking with data:', bookingData);

      // Save booking to Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('Booking created with ID:', bookingRef.id);

      // Update tutor's total sessions count
      await updateDoc(doc(db, 'tutors', tutorId), {
        totalSessions: (tutor?.totalSessions || 0) + 1
      });

      // Create notification for tutor
      const notificationData = {
        userId: tutorId,
        type: 'new_booking',
        title: 'New Booking Request',
        message: `${userData?.fullName || 'A student'} has requested a ${formData.duration}-hour session`,
        bookingId: bookingRef.id,
        read: false,
        createdAt: serverTimestamp(),
        actionUrl: `/dashboard/bookings/${bookingRef.id}`
      };

      await addDoc(collection(db, 'notifications'), notificationData);

      setSuccess('Booking request sent successfully! The tutor will review your request.');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/bookings');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle specific errors
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please make sure you are logged in and have proper permissions.');
      } else if (error.code === 'unavailable') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to create booking: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="booking-form-page">
          <div className="booking-form-container">
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner-large"></div>
                <p>Loading booking information...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!tutor) {
    return (
      <>
        <Navbar />
        <div className="booking-form-page">
          <div className="booking-form-container">
            <div className="error-message" style={{ textAlign: 'center', padding: '60px' }}>
              <FaExclamationCircle style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '20px' }} />
              <h2>Tutor not found</h2>
              <p>The tutor profile is no longer available.</p>
              <button 
                onClick={() => navigate('/search')} 
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
              >
                Browse Other Tutors
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="booking-form-page">
        <div className="booking-form-container">
          {/* Header */}
          <div className="booking-form-header">
            <h1>
              <FaCalendarAlt /> Book a Session
            </h1>
            <p>Schedule your personalized learning session with {tutor.fullName}</p>
          </div>

          <div className="booking-form-layout">
            {/* Main Form */}
            <div className="form-card">
              {error && (
                <div className="form-message error">
                  <FaExclamationCircle className="icon" />
                  {error}
                </div>
              )}

              {success && (
                <div className="form-message success">
                  <FaCheckCircle className="icon" />
                  {success}
                </div>
              )}

              <h2>Session Details</h2>

              <form onSubmit={handleSubmit}>
                {/* Date & Time Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FaCalendarAlt /> Select Date & Time
                  </h3>
                  <div className="form-group">
                    <label className="form-label required">When would you like to have your session?</label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({...formData, date})}
                      showTimeSelect
                      minDate={new Date()}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Choose date and time"
                      className="date-picker-input"
                    />
                  </div>
                </div>

                {/* Duration Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FaClock /> Session Duration
                  </h3>
                  <div className="duration-selector">
                    {durations.map(duration => (
                      <div key={duration.value} className="duration-option">
                        <input
                          type="radio"
                          id={`duration-${duration.value}`}
                          name="duration"
                          value={duration.value}
                          checked={formData.duration === duration.value}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        />
                        <label htmlFor={`duration-${duration.value}`} className="duration-label">
                          {duration.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject & Level Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FaBook /> Learning Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Subject</label>
                      <select
                        className="form-select"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        required
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Academic Level</label>
                      <div className="subject-level-selector">
                        {levels.map(level => (
                          <div key={level.value} className="subject-level-option">
                            <input
                              type="radio"
                              id={`level-${level.value}`}
                              name="level"
                              value={level.value}
                              checked={formData.level === level.value}
                              onChange={(e) => setFormData({...formData, level: e.target.value})}
                            />
                            <label htmlFor={`level-${level.value}`} className="subject-level-label">
                              {level.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Type Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FaVideo /> Meeting Type
                  </h3>
                  <div className="meeting-type-selector">
                    {meetingTypes.map(type => (
                      <div key={type.value} className="meeting-type-option">
                        <input
                          type="radio"
                          id={`type-${type.value}`}
                          name="meetingType"
                          value={type.value}
                          checked={formData.meetingType === type.value}
                          onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                        />
                        <label htmlFor={`type-${type.value}`} className="meeting-type-label">
                          <div className="meeting-type-icon">
                            {type.icon}
                          </div>
                          <span className="meeting-type-text">{type.label}</span>
                          <small style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '5px' }}>
                            {type.desc}
                          </small>
                        </label>
                      </div>
                    ))}
                  </div>

                  {formData.meetingType === 'in-person' && (
                    <div className="form-group" style={{ marginTop: '20px' }}>
                      <label className="form-label required">
                        <FaMapMarkerAlt /> Meeting Location
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Enter meeting address or preferred location"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FaUserGraduate /> Additional Information
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Special Requests or Topics</label>
                    <textarea
                      className="form-textarea"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any specific topics, materials, or learning goals you'd like to focus on during the session..."
                      rows="4"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate(`/tutor/${tutorId}`)}
                    disabled={submitting}
                  >
                    <FaArrowLeft /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="spinner-icon" /> Processing...
                      </>
                    ) : (
                      <>
                        <FaBell /> Request Booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Summary Sidebar */}
            <div className="summary-card">
              {/* Tutor Summary */}
              <div className="tutor-summary-card">
                <div className="tutor-avatar-large">
                  <img 
                    src={tutor.profileImage || 'https://via.placeholder.com/150'} 
                    alt={tutor.fullName}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <h3 className="tutor-name">{tutor.fullName}</h3>
                <p className="tutor-subjects">
                  {tutor.subjects?.slice(0, 3).join(' • ') || 'General Tutor'}
                </p>
                <div className="tutor-rating-badge">
                  ★ {tutor.rating?.toFixed(1) || 'New'} ({tutor.totalReviews || 0})
                </div>
              </div>

              {/* Price Summary */}
              <div className="price-summary-card">
                <h3>
                  <FaMoneyBill /> Price Summary
                </h3>
                <div className="price-item">
                  <span className="price-label">Hourly Rate</span>
                  <span className="price-value">${tutor.hourlyRate || 0}/hour</span>
                </div>
                <div className="price-item">
                  <span className="price-label">Duration</span>
                  <span className="price-value">{formData.duration} hour(s)</span>
                </div>
                <div className="price-total">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">${calculateTotal()}</span>
                </div>
              </div>

              {/* Booking Notes */}
              <div className="booking-notes">
                <h4>
                  <FaCheckCircle /> Important Notes
                </h4>
                <ul>
                  <li>Payment is processed after the tutor confirms the session</li>
                  <li>24-hour cancellation policy applies</li>
                  <li>You'll receive a confirmation email</li>
                  <li>Meeting link will be provided for online sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingForm;