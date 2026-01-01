import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaHistory, 
  FaStar, 
  FaCog,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBill,
  FaComments,
  FaSearch  // Add this import
} from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const Dashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalBookings: 0,
    averageRating: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where(userData.userType === 'student' ? 'studentId' : 'tutorId', '==', userData.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentBookings(bookings);
      
      // Calculate stats
      const upcoming = bookings.filter(b => 
        new Date(b.date) > new Date() && b.status === 'confirmed'
      ).length;
      
      const completed = bookings.filter(b => 
        new Date(b.date) < new Date() && b.status === 'completed'
      ).length;

      setStats({
        upcomingSessions: upcoming,
        completedSessions: completed,
        totalBookings: bookings.length,
        averageRating: userData.userType === 'tutor' ? userData.rating || 0 : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">
              {userData?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <h3>{userData?.fullName || 'User'}</h3>
              <p className="user-role">{userData?.userType?.toUpperCase()}</p>
              <p className="user-location">{userData?.location}</p>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="nav-item active">
              <FaUser /> Overview
            </Link>
            {userData?.userType === 'student' ? (
              <>
                <Link to="/dashboard/bookings" className="nav-item">
                  <FaCalendarAlt /> My Bookings
                </Link>
                <Link to="/dashboard/tutors" className="nav-item">
                  <FaChalkboardTeacher /> My Tutors
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard/schedule" className="nav-item">
                  <FaCalendarAlt /> My Schedule
                </Link>
                <Link to="/dashboard/students" className="nav-item">
                  <FaBook /> My Students
                </Link>
                <Link to="/dashboard/earnings" className="nav-item">
                  <FaMoneyBill /> Earnings
                </Link>
              </>
            )}
            <Link to="/dashboard/reviews" className="nav-item">
              <FaStar /> Reviews
            </Link>
            <Link to="/dashboard/messages" className="nav-item">
              <FaComments /> Messages
            </Link>
            <Link to="/dashboard/settings" className="nav-item">
              <FaCog /> Settings
            </Link>
          </nav>
        </div>
        
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Welcome back, {userData?.fullName?.split(' ')[0] || 'there'}!</h1>
            <p>Here's what's happening with your account</p>
          </div>
          
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon upcoming">
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <h3>{stats.upcomingSessions}</h3>
                <p>Upcoming Sessions</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon completed">
                <FaHistory />
              </div>
              <div className="stat-content">
                <h3>{stats.completedSessions}</h3>
                <p>Completed Sessions</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon total">
                <FaBook />
              </div>
              <div className="stat-content">
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            
            {userData?.userType === 'tutor' && (
              <div className="stat-card">
                <div className="stat-icon rating">
                  <FaStar />
                </div>
                <div className="stat-content">
                  <h3>{stats.averageRating.toFixed(1)}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Bookings */}
          <div className="recent-bookings">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/dashboard/bookings" className="view-all">View All</Link>
            </div>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : recentBookings.length > 0 ? (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>{userData?.userType === 'student' ? 'Tutor' : 'Student'}</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{new Date(booking.date).toLocaleString()}</td>
                        <td>
                          {userData?.userType === 'student' 
                            ? booking.tutorName 
                            : booking.studentName}
                        </td>
                        <td>{booking.subject}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-small"
                            onClick={() => navigate(`/booking/${booking.id}`)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No bookings yet</p>
                {userData?.userType === 'student' && (
                  <Link to="/search" className="btn-primary">
                    Find a Tutor
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {userData?.userType === 'student' ? (
                <>
                  <button className="action-card" onClick={() => navigate('/search')}>
                    <FaSearch /> Find a Tutor
                  </button>
                  <button className="action-card" onClick={() => navigate('/dashboard/bookings')}>
                    <FaCalendarAlt /> View Schedule
                  </button>
                  <button className="action-card" onClick={() => navigate('/dashboard/reviews')}>
                    <FaStar /> Write a Review
                  </button>
                </>
              ) : (
                <>
                  <button className="action-card" onClick={() => navigate('/tutor/profile')}>
                    <FaUser /> Update Profile
                  </button>
                  <button className="action-card" onClick={() => navigate('/dashboard/schedule')}>
                    <FaCalendarAlt /> Manage Availability
                  </button>
                  <button className="action-card" onClick={() => navigate('/dashboard/earnings')}>
                    <FaMoneyBill /> View Earnings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;