import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaUserShield, FaKey, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  // Secret admin key for security (in production, use environment variables)
  const ADMIN_SECRET_KEY = 'TUTOR_CONNECT_ADMIN_2024';

  const makeAdmin = async () => {
    if (!email.trim()) {
      setMessage('Please enter an email address');
      setMessageType('error');
      return;
    }

    if (adminKey !== ADMIN_SECRET_KEY) {
      setMessage('Invalid admin key');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase().trim())
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        setMessage('User not found. Please make sure the user is registered.');
        setMessageType('error');
        return;
      }

      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Check if already admin
      if (userData.userType === 'admin') {
        setMessage(`${email} is already an admin`);
        setMessageType('error');
        return;
      }

      // Update user type to admin
      await updateDoc(doc(db, 'users', userId), {
        userType: 'admin',
        updatedAt: new Date()
      });

      setMessage(`Success! ${email} is now an administrator. You can now access the admin dashboard.`);
      setMessageType('success');
      
      // Clear form
      setEmail('');
      setAdminKey('');
      
      // Redirect to admin dashboard after 3 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (error) {
      console.error('Error making admin:', error);
      setMessage('Error making admin. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-setup-container">
        <div className="admin-setup-card">
          <div className="admin-setup-header">
            <div className="admin-icon">
              <FaUserShield />
            </div>
            <h1>Admin Setup</h1>
            <p className="subtitle">Grant administrator privileges to a user</p>
          </div>

          <div className="admin-setup-warning">
            <FaExclamationTriangle />
            <p>
              <strong>Warning:</strong> This action grants full administrative access. 
              Only trusted users should be made administrators.
            </p>
          </div>

          <div className="admin-setup-form">
            <div className="form-group">
              <label htmlFor="email">
                User Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the user's email address"
                disabled={loading}
                required
              />
              <p className="help-text">
                Enter the email address of the registered user you want to make an admin
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="adminKey">
                Admin Security Key
              </label>
              <input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin security key"
                disabled={loading}
                required
              />
              <p className="help-text">
                Contact the system administrator to get the security key
              </p>
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                <span>{message}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={makeAdmin}
                disabled={loading || !email || !adminKey}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaUserShield /> Make Admin
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="admin-setup-info">
            <h3><FaKey /> Administrator Privileges</h3>
            <ul>
              <li>Access to all user data</li>
              <li>Approve/reject tutor applications</li>
              <li>Manage user accounts</li>
              <li>View all bookings and transactions</li>
              <li>Platform configuration settings</li>
              <li>Generate system reports</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSetup;