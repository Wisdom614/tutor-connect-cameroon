import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, addDoc, doc, getDoc, updateDoc, 
  serverTimestamp, query, where, getDocs 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaCalendarAlt, FaClock, FaBook, FaUserGraduate, 
  FaMoneyBill, FaCheckCircle, FaExclamationCircle 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const RealBookingForm = () => {
  const { tutorId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: new Date(),
    duration: '1',
    subject: '',
    level: '',
    notes: '',
    meetingType: 'online',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'Computer Science', 'Economics',
    'Accounting', 'History', 'Geography', 'Literature'
  ];

  const levels = [
    'Primary', 'Form 1-2', 'Form 3-5', 'Lower Sixth',
    'Upper Sixth', 'University', 'Professional'
  ];

  const meetingTypes = [
    { value: 'online', label: 'Online (Zoom/Google Meet)' },
    { value: 'in-person', label: 'In Person' },
    { value: 'both', label: 'Either is fine' }
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
    const duration = parseFloat(bookingData.duration);
    return (rate * duration).toFixed(2);
  };

  const validateBooking = () => {
    if (!bookingData.subject) {
      setError('Please select a subject');
      return false;
    }

    if (!bookingData.level) {
      setError('Please select academic level');
      return false;
    }

    if (bookingData.date < new Date()) {
      setError('Please select a future date and time');
      return false;
    }

    if (bookingData.meetingType === 'in-person' && !bookingData.location.trim()) {
      setError('Please specify meeting location for in-person sessions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: `/book/${tutorId}` } });
      return;
    }

    if (!validateBooking()) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Create booking document
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        studentId: user.uid,
        tutorId: tutorId,
        studentName: userData?.fullName || user.email,
        tutorName: tutor?.fullName,
        date: bookingData.date,
        duration: parseFloat(bookingData.duration),
        subject: bookingData.subject,
        level: bookingData.level,
        notes: bookingData.notes,
        meetingType: bookingData.meetingType,
        location: bookingData.location,
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: 'pending',
        meetingLink: '', // Will be set by tutor
        studentEmail: user.email,
        tutorEmail: tutor?.email
      });

      // Update tutor's total sessions count
      await updateDoc(doc(db, 'tutors', tutorId), {
        totalSessions: (tutor?.totalSessions || 0) + 1
      });

      // Create notification for tutor
      await addDoc(collection(db, 'notifications'), {
        userId: tutorId,
        type: 'new_booking',
        title: 'New Booking Request',
        message: `${userData?.fullName || 'A student'} has requested a ${bookingData.duration}-hour session`,
        bookingId: bookingRef.id,
        read: false,
        createdAt: serverTimestamp()
      });

      setSuccess('Booking request sent successfully! The tutor will review your request.');
      
      setTimeout(() => {
        navigate('/dashboard/bookings');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking form...</p>
        </div>
      </>
    );
  }

  if (!tutor) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Tutor not found</h2>
          <p>The tutor profile is no longer available.</p>
          <button onClick={() => navigate('/search')} className="btn btn-primary">
            Browse Other Tutors
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="booking-container">
        <div className="container">
          <div className="booking-header">
            <h1>Book Session with {tutor.fullName}</h1>
            <p>Schedule your tutoring session with this verified tutor</p>
          </div>

          <div className="booking-layout">
            {/* Tutor Summary */}
            <div className="booking-sidebar">
              <div className="tutor-summary">
                <div className="tutor-avatar">
                  <img 
                    src={tutor.profileImage || 'https://via.placeholder.com/150'} 
                    alt={tutor.fullName}
                  />
                </div>
                <h3>{tutor.fullName}</h3>
                <div className="tutor-rating">
                  <FaCheckCircle className="verified-icon" /> Verified Tutor
                  <span className="rating">
                    ★ {tutor.rating?.toFixed(1) || 'New'} ({tutor.totalReviews || 0})
                  </span>
                </div>
                <div className="tutor-details">
                  <p><FaBook /> {tutor.subjects?.slice(0, 2).join(', ')}</p>
                  <p><FaUserGraduate /> {tutor.education || 'Professional'}</p>
                  <p><FaClock /> {tutor.totalSessions || 0} sessions completed</p>
                </div>
              </div>

              <div className="price-summary">
                <h4>Price Summary</h4>
                <div className="price-item">
                  <span>Hourly Rate</span>
                  <span>${tutor.hourlyRate}/hour</span>
                </div>
                <div className="price-item">
                  <span>Duration</span>
                  <span>{bookingData.duration} hour(s)</span>
                </div>
                <div className="price-total">
                  <span>Total Amount</span>
                  <span className="total">${calculateTotal()}</span>
                </div>
                <p className="price-note">Payment will be processed after the tutor confirms the session</p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="booking-main">
              {error && (
                <div className="error-message">
                  <FaExclamationCircle /> {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <FaCheckCircle /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3><FaCalendarAlt /> Session Details</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date & Time *</label>
                      <DatePicker
                        selected={bookingData.date}
                        onChange={(date) => setBookingData({...bookingData, date})}
                        showTimeSelect
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="date-picker"
                        placeholderText="Select date and time"
                      />
                    </div>

                    <div className="form-group">
                      <label>Duration (hours) *</label>
                      <select
                        value={bookingData.duration}
                        onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                        required
                      >
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                        <option value="2.5">2.5 hours</option>
                        <option value="3">3 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject *</label>
                      <select
                        value={bookingData.subject}
                        onChange={(e) => setBookingData({...bookingData, subject: e.target.value})}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Academic Level *</label>
                      <select
                        value={bookingData.level}
                        onChange={(e) => setBookingData({...bookingData, level: e.target.value})}
                        required
                      >
                        <option value="">Select Level</option>
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Meeting Type *</label>
                    <div className="meeting-type-selector">
                      {meetingTypes.map(type => (
                        <label key={type.value} className="meeting-type-option">
                          <input
                            type="radio"
                            name="meetingType"
                            value={type.value}
                            checked={bookingData.meetingType === type.value}
                            onChange={(e) => setBookingData({...bookingData, meetingType: e.target.value})}
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {bookingData.meetingType === 'in-person' && (
                    <div className="form-group">
                      <label>Meeting Location *</label>
                      <input
                        type="text"
                        value={bookingData.location}
                        onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                        placeholder="Enter meeting address or location"
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      placeholder="Any specific topics, materials, or requirements for the session..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate(`/tutor/${tutorId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Request Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RealBookingForm;