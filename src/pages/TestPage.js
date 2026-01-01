import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#4CAF50' }}>✅ Tutor Connect Cameroon</h1>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>
        Application is successfully deployed!
      </p>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h2>Quick Navigation</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <a href="/" style={linkStyle}>🏠 Home Page</a>
          <a href="/search" style={linkStyle}>🔍 Search Tutors</a>
          <a href="/login" style={linkStyle}>🔑 Login</a>
          <a href="/register" style={linkStyle}>📝 Register</a>
        </div>
        
        <div style={{ marginTop: '30px', padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
          <h3>Debug Information</h3>
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Build Date:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const linkStyle = {
  display: 'block',
  padding: '12px 20px',
  background: '#4CAF50',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  textAlign: 'center'
};

export default TestPage;