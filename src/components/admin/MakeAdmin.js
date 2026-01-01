// src/components/admin/MakeAdmin.js
import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MakeAdmin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const makeAdmin = async () => {
    if (!email) {
      setMessage('Please enter an email');
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
        setMessage('User not found');
        return;
      }

      const userDoc = snapshot.docs[0];
      
      // Update user type to admin
      await updateDoc(doc(db, 'users', userDoc.id), {
        userType: 'admin'
      });

      setMessage(`Successfully made ${email} an admin!`);
      setEmail('');
    } catch (error) {
      console.error('Error making admin:', error);
      setMessage('Error making admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="make-admin">
      <h2>Make User Admin</h2>
      <div className="admin-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user's email"
          disabled={loading}
        />
        <button onClick={makeAdmin} disabled={loading}>
          {loading ? 'Processing...' : 'Make Admin'}
        </button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default MakeAdmin;