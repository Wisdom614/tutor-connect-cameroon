import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import TutorApproval from '../components/admin/TutorApproval';
import { 
  FaUsers, FaChalkboardTeacher, FaCalendarAlt, 
  FaMoneyBill, FaChartLine, FaShieldAlt, 
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaCog, FaHome, FaUserCheck, FaFileAlt,
  FaLock
} from 'react-icons/fa';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminDashboard = () => {
  const { userData, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="admin-access-denied">
          <div className="access-denied-card">
            <div className="access-denied-icon">
              <FaLock />
            </div>
            <h1>Access Denied</h1>
            <p>You do not have administrator privileges to access this page.</p>
            <div className="access-denied-actions">
              <Link to="/dashboard" className="btn btn-primary">
                Go to User Dashboard
              </Link>
              <Link to="/admin/setup" className="btn btn-outline">
                Request Admin Access
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const AdminHome = () => {
    const [stats, setStats] = useState({
      totalUsers: 0,
      totalTutors: 0,
      totalStudents: 0,
      pendingApprovals: 0,
      totalBookings: 0,
      revenue: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
      try {
        // For development, use mock data
        setStats({
          totalUsers: 156,
          totalTutors: 42,
          totalStudents: 114,
          pendingApprovals: 8,
          totalBookings: 289,
          revenue: 5420
        });

        // Mock recent users
        const mockRecentUsers = [
          {
            id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            userType: 'student',
            createdAt: new Date()
          },
          {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            userType: 'tutor',
            createdAt: new Date(Date.now() - 86400000)
          },
          {
            id: '3',
            fullName: 'Michael Johnson',
            email: 'michael@example.com',
            userType: 'student',
            createdAt: new Date(Date.now() - 172800000)
          }
        ];
        
        // Mock recent bookings
        const mockRecentBookings = [
          {
            id: '1',
            subject: 'Mathematics',
            studentName: 'John Doe',
            tutorName: 'Sarah Wilson',
            status: 'confirmed',
            createdAt: new Date()
          },
          {
            id: '2',
            subject: 'Physics',
            studentName: 'Alice Brown',
            tutorName: 'David Lee',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000)
          }
        ];
        
        setRecentUsers(mockRecentUsers);
        setRecentBookings(mockRecentBookings);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="admin-home">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Admin! Manage your platform efficiently.</p>
        </div>
        
        {/* Admin Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon tutors">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTutors}</h3>
              <p>Verified Tutors</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon students">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Active Students</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon pending">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
              <Link to="/admin/tutor-approval" className="view-link">
                Review Now →
              </Link>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon bookings">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon revenue">
              <FaMoneyBill />
            </div>
            <div className="stat-content">
              <h3>${stats.revenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/tutor-approval" className="action-card">
              <FaUserCheck />
              <h3>Approve Tutors</h3>
              <p>Review and approve tutor applications</p>
              <span className="badge">{stats.pendingApprovals} pending</span>
            </Link>
            
            <Link to="/admin/users" className="action-card">
              <FaUsers />
              <h3>Manage Users</h3>
              <p>View and manage all users</p>
            </Link>
            
            <Link to="/admin/bookings" className="action-card">
              <FaCalendarAlt />
              <h3>View Bookings</h3>
              <p>Monitor all tutoring sessions</p>
            </Link>
            
            <Link to="/admin/settings" className="action-card">
              <FaCog />
              <h3>Platform Settings</h3>
              <p>Configure platform settings</p>
            </Link>
            
            <Link to="/admin/reports" className="action-card">
              <FaChartLine />
              <h3>View Reports</h3>
              <p>Analytics and insights</p>
            </Link>
            
            <Link to="/admin/content" className="action-card">
              <FaFileAlt />
              <h3>Content Management</h3>
              <p>Manage site content</p>
            </Link>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="activity-section">
            <h3>Recent Users</h3>
            <div className="activity-list">
              {recentUsers.map(user => (
                <div key={user.id} className="activity-item">
                  <div className="user-avatar">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="user-info">
                    <h4>{user.fullName || 'User'}</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="user-meta">
                    <span className={`user-type ${user.userType}`}>
                      {user.userType}
                    </span>
                    <span className="user-date">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="activity-section">
            <h3>Recent Bookings</h3>
            <div className="activity-list">
              {recentBookings.map(booking => (
                <div key={booking.id} className="activity-item">
                  <div className="booking-info">
                    <h4>{booking.subject} Session</h4>
                    <p>{booking.studentName} with {booking.tutorName}</p>
                  </div>
                  <div className="booking-meta">
                    <span className={`status ${booking.status}`}>
                      {booking.status}
                    </span>
                    <span className="booking-date">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <div className="admin-sidebar">
          <div className="admin-profile">
            <div className="admin-avatar">
              {userData?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="admin-info">
              <h3>{userData?.fullName || 'Admin'}</h3>
              <p className="admin-role">Administrator</p>
            </div>
          </div>
          
          <nav className="admin-nav">
            <Link to="/admin" className="nav-item">
              <FaHome /> Dashboard
            </Link>
            <Link to="/admin/tutor-approval" className="nav-item">
              <FaUserCheck /> Tutor Approval
            </Link>
            <Link to="/admin/users" className="nav-item">
              <FaUsers /> User Management
            </Link>
            <Link to="/admin/bookings" className="nav-item">
              <FaCalendarAlt /> Bookings
            </Link>
            <Link to="/admin/reports" className="nav-item">
              <FaChartLine /> Reports
            </Link>
            <Link to="/admin/settings" className="nav-item">
              <FaCog /> Settings
            </Link>
            <Link to="/dashboard" className="nav-item back-to-user">
              <FaHome /> Back to User Dashboard
            </Link>
          </nav>
        </div>
        
        <div className="admin-main">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/tutor-approval" element={<TutorApproval />} />
            {/* Add more admin routes as needed */}
          </Routes>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;