import React from 'react';
import { FaStar, FaMapMarkerAlt, FaGraduationCap, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  // Format subjects display
  const displaySubjects = tutor.subjects?.slice(0, 2).join(', ') || 'General Tutoring';
  const hasMoreSubjects = tutor.subjects?.length > 2;

  return (
    <div className="tutor-card">
      <div className="tutor-card-header">
        <div className="tutor-image">
          <img 
            src={tutor.profileImage || 'https://via.placeholder.com/150'} 
            alt={tutor.fullName}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150';
            }}
          />
          {tutor.status === 'approved' && (
            <div className="tutor-verified">
              <FaCheckCircle /> Verified
            </div>
          )}
        </div>
        
        <div className="tutor-rating">
          <FaStar className="star-icon" />
          <span className="rating-value">{tutor.rating?.toFixed(1) || 'New'}</span>
          <span className="rating-count">({tutor.totalReviews || 0} reviews)</span>
        </div>
      </div>
      
      <div className="tutor-card-body">
        <h3 className="tutor-name">{tutor.fullName || 'Unknown Tutor'}</h3>
        
        <div className="tutor-specialty">
          <FaGraduationCap />
          <span>{displaySubjects}</span>
          {hasMoreSubjects && (
            <span className="more-subjects">+{tutor.subjects.length - 2} more</span>
          )}
        </div>
        
        <div className="tutor-location">
          <FaMapMarkerAlt />
          <span>{tutor.location || 'Location not specified'}</span>
        </div>
        
        <div className="tutor-experience">
          <FaClock />
          <span>{tutor.totalSessions || 0} sessions completed</span>
        </div>
        
        {tutor.educationLevel && (
          <div className="tutor-education">
            <span className="education-level">{tutor.educationLevel}</span>
          </div>
        )}
      </div>
      
      <div className="tutor-card-footer">
        <div className="tutor-rate">
          <span className="rate-amount">${tutor.hourlyRate || 15}</span>
          <span className="rate-period">/hour</span>
        </div>
        
        <div className="tutor-actions">
          <button 
            className="btn btn-outline btn-small"
            onClick={() => navigate(`/tutor/${tutor.uid}`)}
          >
            View Profile
          </button>
          <button 
            className="btn btn-primary btn-small"
            onClick={() => navigate(`/book/${tutor.uid}`)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;