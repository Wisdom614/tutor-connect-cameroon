import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, query, where, getDocs, doc, 
  updateDoc, getDoc, orderBy, Timestamp,
  addDoc  // Added missing import
} from 'firebase/firestore';
import { db } from '../../firebase/config'; // Removed unused 'storage'
import { 
  FaUserCheck, FaUserTimes, FaEye, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaGraduationCap,
  FaMoneyBill, FaClock, FaFileAlt,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaCertificate, FaCalendar, FaBook  // Added FaBook
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const TutorApproval = () => {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const approvedQuery = query(
        collection(db, 'tutors'),
        where('status', '==', 'approved')
      );
      const rejectedQuery = query(
        collection(db, 'tutors'),
        where('status', '==', 'rejected')
      );
      const totalQuery = collection(db, 'tutors');
      
      const [approvedSnap, rejectedSnap, totalSnap] = await Promise.all([
        getDocs(approvedQuery),
        getDocs(rejectedQuery),
        getDocs(totalQuery)
      ]);
      
      setStats({
        pending: pendingTutors.length,
        approved: approvedSnap.size,
        rejected: rejectedSnap.size,
        total: totalSnap.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [pendingTutors.length]);

  const fetchPendingTutors = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch tutors with pending status
      const tutorsQuery = query(
        collection(db, 'tutors'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const tutorsSnapshot = await getDocs(tutorsQuery);
      const tutors = [];
      
      for (const docSnap of tutorsSnapshot.docs) {
        const tutorData = docSnap.data();
        
        // Fetch user data for each tutor
        const userDoc = await getDoc(doc(db, 'users', docSnap.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          tutors.push({
            id: docSnap.id,
            ...tutorData,
            ...userData,
            createdAt: tutorData.createdAt?.toDate?.() || new Date()
          });
        }
      }
      
      setPendingTutors(tutors);
      fetchStats(); // Update stats after fetching tutors
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchPendingTutors();
  }, [fetchPendingTutors]);

  const viewTutorDetails = async (tutorId) => {
    try {
      const tutorDoc = await getDoc(doc(db, 'tutors', tutorId));
      const userDoc = await getDoc(doc(db, 'users', tutorId));
      
      if (tutorDoc.exists() && userDoc.exists()) {
        setSelectedTutor({
          id: tutorId,
          ...tutorDoc.data(),
          ...userDoc.data(),
          createdAt: tutorDoc.data().createdAt?.toDate?.() || new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching tutor details:', error);
    }
  };

  const createNotification = async (userId, type, title, message) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const approveTutor = async (tutorId, tutorData) => {
    if (!window.confirm('Are you sure you want to approve this tutor?')) {
      return;
    }

    setApproving(true);

    try {
      // Update tutor status to approved
      await updateDoc(doc(db, 'tutors', tutorId), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: 'admin', // In real app, use admin user ID
        profileComplete: true
      });

      // Update user status
      await updateDoc(doc(db, 'users', tutorId), {
        status: 'active',
        profileCompleted: true
      });

      // Create notification for tutor
      await createNotification(tutorId, 'tutor_approved', 
        'Congratulations! Your tutor profile has been approved.',
        'You can now start accepting students and booking sessions.'
      );

      // Send approval email (in production, use Firebase Functions)
      console.log('Tutor approved:', tutorId);
      
      // Refresh data
      await fetchPendingTutors();
      setSelectedTutor(null);
      
      alert('Tutor approved successfully!');
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Failed to approve tutor. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const rejectTutor = async (tutorId, reason) => {
    if (!reason || reason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (min 10 characters).');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this tutor?')) {
      return;
    }

    setRejecting(true);

    try {
      // Update tutor status to rejected
      await updateDoc(doc(db, 'tutors', tutorId), {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: 'admin',
        rejectionReason: reason,
        profileComplete: false
      });

      // Update user status
      await updateDoc(doc(db, 'users', tutorId), {
        status: 'suspended',
        suspensionReason: 'Tutor application rejected'
      });

      // Create notification for tutor
      await createNotification(tutorId, 'tutor_rejected', 
        'Your tutor profile has been reviewed',
        `Unfortunately, your application was rejected. Reason: ${reason}`
      );

      // Refresh data
      await fetchPendingTutors();
      setSelectedTutor(null);
      
      alert('Tutor rejected successfully!');
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Failed to reject tutor. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="container">
          <div className="admin-header">
            <h1><FaUserCheck /> Tutor Approval Dashboard</h1>
            <p>Review and approve tutor applications</p>
          </div>

          {/* Stats Cards */}
          <div className="approval-stats">
            <div className="stat-card stat-pending">
              <div className="stat-icon">
                <FaSpinner />
              </div>
              <div className="stat-content">
                <h3>{stats.pending}</h3>
                <p>Pending Review</p>
              </div>
            </div>
            
            <div className="stat-card stat-approved">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.approved}</h3>
                <p>Approved Tutors</p>
              </div>
            </div>
            
            <div className="stat-card stat-rejected">
              <div className="stat-icon">
                <FaTimesCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.rejected}</h3>
                <p>Rejected Applications</p>
              </div>
            </div>
            
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <FaUserCheck />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Tutors</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="approval-content">
            {/* Pending Tutors List */}
            <div className="pending-tutors-section">
              <div className="section-header">
                <h2><FaSpinner /> Pending Applications ({pendingTutors.length})</h2>
                <button 
                  className="btn btn-outline"
                  onClick={fetchPendingTutors}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <FaSpinner className="spinner" />
                  <p>Loading pending tutors...</p>
                </div>
              ) : pendingTutors.length === 0 ? (
                <div className="empty-state">
                  <FaCheckCircle />
                  <h3>No pending applications</h3>
                  <p>All tutor applications have been reviewed</p>
                </div>
              ) : (
                <div className="tutors-list">
                  {pendingTutors.map(tutor => (
                    <div key={tutor.id} className="tutor-card">
                      <div className="tutor-card-header">
                        <div className="tutor-avatar">
                          {tutor.profileImage ? (
                            <img src={tutor.profileImage} alt={tutor.fullName} />
                          ) : (
                            <div className="avatar-placeholder">
                              {tutor.fullName?.charAt(0) || 'T'}
                            </div>
                          )}
                        </div>
                        <div className="tutor-info">
                          <h3>{tutor.fullName}</h3>
                          <div className="tutor-meta">
                            <span><FaEnvelope /> {tutor.email}</span>
                            <span><FaPhone /> {tutor.phone || 'Not provided'}</span>
                            <span><FaMapMarkerAlt /> {tutor.location}</span>
                          </div>
                        </div>
                        <div className="tutor-stats">
                          <span className="stat">
                            <FaMoneyBill /> ${tutor.hourlyRate}/hr
                          </span>
                          <span className="stat">
                            <FaGraduationCap /> {tutor.subjects?.length || 0} subjects
                          </span>
                          <span className="stat">
                            <FaClock /> Applied {formatDate(tutor.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="tutor-card-footer">
                        <button
                          className="btn btn-outline"
                          onClick={() => viewTutorDetails(tutor.id)}
                        >
                          <FaEye /> View Details
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => approveTutor(tutor.id, tutor)}
                          disabled={approving}
                        >
                          <FaUserCheck /> Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            const reason = prompt('Please provide rejection reason:');
                            if (reason) {
                              rejectTutor(tutor.id, reason);
                            }
                          }}
                          disabled={rejecting}
                        >
                          <FaUserTimes /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tutor Details Modal */}
            {selectedTutor && (
              <div className="tutor-details-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Tutor Application Details</h2>
                    <button 
                      className="close-btn"
                      onClick={() => setSelectedTutor(null)}
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    {/* Personal Information */}
                    <div className="details-section">
                      <h3><FaUserCheck /> Personal Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Full Name:</label>
                          <span>{selectedTutor.fullName}</span>
                        </div>
                        <div className="info-item">
                          <label>Email:</label>
                          <span>{selectedTutor.email}</span>
                        </div>
                        <div className="info-item">
                          <label>Phone:</label>
                          <span>{selectedTutor.phone || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                          <label>Location:</label>
                          <span>{selectedTutor.location}</span>
                        </div>
                        <div className="info-item">
                          <label>Applied On:</label>
                          <span>{formatDate(selectedTutor.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Education & Experience */}
                    <div className="details-section">
                      <h3><FaGraduationCap /> Education & Experience</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Education Level:</label>
                          <span>{selectedTutor.education || 'Not specified'}</span>
                        </div>
                        <div className="info-item">
                          <label>Experience:</label>
                          <span>{selectedTutor.experience || '0'} years</span>
                        </div>
                        <div className="info-item">
                          <label>Hourly Rate:</label>
                          <span className="rate">${selectedTutor.hourlyRate}/hour</span>
                        </div>
                      </div>
                    </div>

                    {/* Teaching Details */}
                    <div className="details-section">
                      <h3><FaBook /> Teaching Details</h3>
                      
                      <div className="info-item">
                        <label>Subjects:</label>
                        <div className="tags-list">
                          {selectedTutor.subjects?.map((subject, index) => (
                            <span key={index} className="tag">{subject}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <label>Teaching Levels:</label>
                        <div className="tags-list">
                          {selectedTutor.levels?.map((level, index) => (
                            <span key={index} className="tag">{level}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <label>Languages:</label>
                        <div className="tags-list">
                          {selectedTutor.languages?.map((lang, index) => (
                            <span key={index} className="tag">{lang}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <label>Qualifications:</label>
                        <div className="qualifications-list">
                          {selectedTutor.qualifications?.map((qual, index) => (
                            <div key={index} className="qualification">
                              <FaCertificate /> {qual}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="details-section">
                      <h3><FaFileAlt /> Biography</h3>
                      <div className="bio-content">
                        {selectedTutor.bio || 'No biography provided.'}
                      </div>
                    </div>

                    {/* Teaching Style */}
                    <div className="details-section">
                      <h3>Teaching Style</h3>
                      <div className="teaching-style">
                        {selectedTutor.teachingStyle || 'Not specified.'}
                      </div>
                    </div>

                    {/* Availability */}
                    {selectedTutor.availability?.length > 0 && (
                      <div className="details-section">
                        <h3><FaCalendar /> Availability</h3>
                        <div className="availability-grid">
                          {selectedTutor.availability.map((slot, index) => (
                            <div key={index} className="availability-slot">
                              <strong>{slot.day}</strong>
                              <span>{slot.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      className="btn btn-outline"
                      onClick={() => setSelectedTutor(null)}
                    >
                      Close
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => approveTutor(selectedTutor.id, selectedTutor)}
                      disabled={approving}
                    >
                      {approving ? (
                        <>
                          <FaSpinner className="spinner" /> Approving...
                        </>
                      ) : (
                        <>
                          <FaUserCheck /> Approve Tutor
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        const reason = prompt('Please provide rejection reason:');
                        if (reason) {
                          rejectTutor(selectedTutor.id, reason);
                        }
                      }}
                      disabled={rejecting}
                    >
                      {rejecting ? (
                        <>
                          <FaSpinner className="spinner" /> Rejecting...
                        </>
                      ) : (
                        <>
                          <FaUserTimes /> Reject Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorApproval;