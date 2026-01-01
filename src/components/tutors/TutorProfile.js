import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../layout/Navbar';
import {
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaClock,
  FaMoneyBill,
  FaCheckCircle,
  FaBook,
  FaUserGraduate,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaExclamationTriangle
} from 'react-icons/fa';

const TutorProfile = () => {
  const { id } = useParams();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTutorData();
  }, [id]);

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', id));
      
      if (!userDoc.exists()) {
        setError('Tutor profile not found');
        setLoading(false);
        return;
      }
      
      const userData = userDoc.data();
      
      // Fetch tutor-specific data
      const tutorDoc = await getDoc(doc(db, 'tutors', id));
      
      if (tutorDoc.exists()) {
        const tutorData = tutorDoc.data();
        setTutor({ ...userData, ...tutorData });
      } else {
        // If no tutor-specific data exists, just use user data
        setTutor(userData);
      }
      
      // Fetch reviews
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('tutorId', '==', id),
          where('status', '==', 'approved')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching tutor data:', error);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely render availability
  const renderAvailability = () => {
    if (!tutor?.availability || tutor.availability.length === 0) {
      return <p>No availability schedule set.</p>;
    }

    // Handle different availability data structures
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="availability-grid">
        {days.map(day => {
          let dayAvailability = null;
          
          // Try to find availability for this day
          if (Array.isArray(tutor.availability)) {
            dayAvailability = tutor.availability.find(a => {
              if (typeof a === 'string') {
                return a.includes(day);
              } else if (a && typeof a === 'object') {
                return a.day === day || a.day?.toLowerCase() === day.toLowerCase();
              }
              return false;
            });
          }
          
          return (
            <div key={day} className="availability-day">
              <h4>{day}</h4>
              {dayAvailability ? (
                <div className="time-slots">
                  {/* Handle different availability structures */}
                  {(() => {
                    if (typeof dayAvailability === 'string') {
                      return <span className="time-slot">{dayAvailability}</span>;
                    } else if (dayAvailability.time) {
                      return <span className="time-slot">{dayAvailability.time}</span>;
                    } else if (dayAvailability.slots && Array.isArray(dayAvailability.slots)) {
                      return dayAvailability.slots.map((slot, index) => (
                        <span key={index} className="time-slot">
                          {slot.start} - {slot.end}
                        </span>
                      ));
                    } else if (dayAvailability.start && dayAvailability.end) {
                      return (
                        <span className="time-slot">
                          {dayAvailability.start} - {dayAvailability.end}
                        </span>
                      );
                    } else {
                      return <span className="time-slot">Available</span>;
                    }
                  })()}
                </div>
              ) : (
                <p className="not-available">Not available</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to safely render subjects
  const renderSubjects = () => {
    if (!tutor?.subjects || tutor.subjects.length === 0) {
      return <p>No subjects listed.</p>;
    }

    if (Array.isArray(tutor.subjects)) {
      return (
        <div className="subjects-grid">
          {tutor.subjects.map((subject, index) => {
            // Handle both string and object subjects
            const subjectName = typeof subject === 'object' ? subject.name || subject.subject : subject;
            const subjectRate = typeof subject === 'object' ? subject.rate : tutor.hourlyRate;
            const subjectLevel = typeof subject === 'object' ? subject.level : 'All Levels';
            
            return (
              <div key={index} className="subject-card">
                <h4>{subjectName}</h4>
                <p className="subject-level">{subjectLevel}</p>
                <p className="subject-rate">${subjectRate || tutor.hourlyRate || 0}/hour</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    return <p>Subjects information not available.</p>;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tutor profile...</p>
        </div>
      </>
    );
  }

  if (error || !tutor) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <FaExclamationTriangle style={{ fontSize: '3rem', color: '#f44336', marginBottom: '20px' }} />
          <h2>{error || 'Tutor not found'}</h2>
          <p>The tutor profile you're looking for doesn't exist or cannot be loaded.</p>
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
      <div className="tutor-profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-image">
            <img 
              src={tutor.profileImage || '/default-avatar.png'} 
              alt={tutor.fullName}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
          <div className="profile-info">
            <h1>{tutor.fullName}</h1>
            <div className="profile-badges">
              {tutor.status === 'approved' && (
                <span className="badge verified">
                  <FaCheckCircle /> Verified Tutor
                </span>
              )}
              <span className="badge rating">
                <FaStar /> {tutor.rating?.toFixed(1) || 'New'} ({tutor.totalReviews || 0} reviews)
              </span>
              <span className="badge sessions">
                <FaClock /> {tutor.totalSessions || 0} sessions completed
              </span>
            </div>
            
            <div className="profile-details">
              {tutor.location && (
                <div className="detail-item">
                  <FaMapMarkerAlt />
                  <span>{tutor.location}</span>
                </div>
              )}
              {tutor.educationLevel && (
                <div className="detail-item">
                  <FaGraduationCap />
                  <span>{tutor.educationLevel}</span>
                </div>
              )}
              <div className="detail-item">
                <FaMoneyBill />
                <span>${tutor.hourlyRate || 0}/hour</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/book/${tutor.uid || tutor.id}`)}
              >
                <FaCalendarAlt /> Book a Session
              </button>
              <button className="btn btn-secondary">
                <FaEnvelope /> Send Message
              </button>
              {tutor.whatsapp && (
                <a 
                  href={`https://wa.me/${tutor.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subjects & Rates
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            className={`tab ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Availability
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="about-section">
                <h3>About Me</h3>
                <p>{tutor.bio || 'No biography provided.'}</p>
              </div>
              
              <div className="education-section">
                <h3>Education & Qualifications</h3>
                {tutor.qualifications?.length > 0 ? (
                  <ul className="qualifications-list">
                    {tutor.qualifications.map((qual, index) => (
                      <li key={index}>
                        <FaGraduationCap />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                ) : tutor.education ? (
                  <p>{tutor.education}</p>
                ) : (
                  <p>No qualifications listed.</p>
                )}
              </div>
              
              <div className="teaching-style">
                <h3>Teaching Style</h3>
                <p>{tutor.teachingStyle || 'Not specified.'}</p>
              </div>

              <div className="languages-section">
                <h3>Languages</h3>
                <p>{tutor.languages?.join(', ') || 'Not specified'}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'subjects' && (
            <div className="subjects-tab">
              <h3>Subjects & Rates</h3>
              {renderSubjects()}
              
              <div className="rates-info">
                <h4>Rates Information</h4>
                <ul>
                  <li>Minimum session duration: 1 hour</li>
                  <li>Group sessions available at discounted rates</li>
                  <li>First session discount: 20% off</li>
                  <li>Package deals available for multiple sessions</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="reviews-stats">
                <div className="average-rating">
                  <h2>{tutor.rating?.toFixed(1) || '0.0'}</h2>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar 
                        key={star} 
                        className={star <= (tutor.rating || 0) ? 'filled' : 'empty'} 
                      />
                    ))}
                  </div>
                  <p>{tutor.totalReviews || 0} reviews</p>
                </div>
              </div>
              
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.studentName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h4>{review.studentName || 'Anonymous'}</h4>
                            <div className="review-rating">
                              {[1, 2, 3, 4, 5].map(star => (
                                <FaStar 
                                  key={star} 
                                  className={star <= (review.rating || 0) ? 'filled' : 'empty'}
                                  size={12}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="review-date">
                          {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                      <div className="review-content">
                        <p>{review.comment || 'No comment provided.'}</p>
                      </div>
                      {review.subject && (
                        <div className="review-subject">
                          <FaBook /> {review.subject}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this tutor!</p>
                  </div>
                )}
              </div>
              
              {userData?.userType === 'student' && (
                <div className="write-review">
                  <button className="btn btn-primary">
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'availability' && (
            <div className="availability-tab">
              <h3>Availability Schedule</h3>
              {renderAvailability()}
              
              <div className="booking-note">
                <h4>Booking Instructions</h4>
                <ul>
                  <li>Book at least 24 hours in advance</li>
                  <li>Cancellation policy: 12 hours notice required</li>
                  <li>Rescheduling available up to 6 hours before session</li>
                  <li>Sessions conducted online via Zoom/Google Meet</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorProfile;