import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, FaSchool, FaBook, FaCalendarAlt, FaGraduationCap,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaSave, FaEdit
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const StudentProfile = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    educationLevel: '',
    school: '',
    grade: '',
    subjects: [],
    goals: '',
    learningStyle: '',
    availability: []
  });
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const educationLevels = [
    'Primary School',
    'Secondary School - Form 1-2',
    'Secondary School - Form 3-5',
    'High School - Lower Sixth',
    'High School - Upper Sixth',
    'University - Undergraduate',
    'University - Postgraduate',
    'Professional Development'
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'History', 'Geography',
    'Computer Science', 'Economics', 'Accounting',
    'Further Mathematics', 'Literature', 'Business Studies'
  ];

  useEffect(() => {
    if (user && userData?.userType === 'student') {
      fetchStudentProfile();
    } else {
      navigate('/dashboard');
    }
  }, [user, userData]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setProfile({
          fullName: userData?.fullName || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          location: userData?.location || '',
          educationLevel: data.educationLevel || '',
          school: data.school || '',
          grade: data.grade || '',
          subjects: data.subjects || [],
          goals: data.goals || '',
          learningStyle: data.learningStyle || '',
          availability: data.availability || []
        });
      } else {
        // Create initial student profile
        setProfile({
          fullName: userData?.fullName || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          location: userData?.location || '',
          educationLevel: '',
          school: '',
          grade: '',
          subjects: [],
          goals: '',
          learningStyle: '',
          availability: []
        });
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'students', user.uid), {
        educationLevel: profile.educationLevel,
        school: profile.school,
        grade: profile.grade,
        subjects: profile.subjects,
        goals: profile.goals,
        learningStyle: profile.learningStyle,
        availability: profile.availability,
        updatedAt: new Date()
      });

      setSuccess('Student profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error saving student profile:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading student profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="container">
          <div className="profile-header">
            <h1>
              <FaUser /> Student Profile
            </h1>
            <p>Manage your academic information and learning preferences</p>
          </div>

          <div className="profile-content">
            <div className="profile-main">
              {/* Academic Information */}
              <div className="profile-section">
                <h2>
                  <FaSchool /> Academic Information
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaGraduationCap /> Education Level
                    </label>
                    {editing ? (
                      <select
                        value={profile.educationLevel}
                        onChange={(e) => setProfile({...profile, educationLevel: e.target.value})}
                      >
                        <option value="">Select education level</option>
                        {educationLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="profile-field">{profile.educationLevel || 'Not specified'}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>School/Institution</label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.school}
                        onChange={(e) => setProfile({...profile, school: e.target.value})}
                        placeholder="Enter your school name"
                      />
                    ) : (
                      <div className="profile-field">{profile.school || 'Not specified'}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Grade/Class</label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.grade}
                        onChange={(e) => setProfile({...profile, grade: e.target.value})}
                        placeholder="e.g., Form 4, Year 2"
                      />
                    ) : (
                      <div className="profile-field">{profile.grade || 'Not specified'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subjects of Interest */}
              <div className="profile-section">
                <h2>
                  <FaBook /> Subjects of Interest
                </h2>
                {editing ? (
                  <div className="subjects-selector">
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        className={`subject-tag ${profile.subjects.includes(subject) ? 'selected' : ''}`}
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            subjects: prev.subjects.includes(subject)
                              ? prev.subjects.filter(s => s !== subject)
                              : [...prev.subjects, subject]
                          }));
                        }}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="tags-list">
                    {profile.subjects.map(subject => (
                      <span key={subject} className="tag">
                        {subject}
                      </span>
                    ))}
                    {profile.subjects.length === 0 && 'No subjects selected'}
                  </div>
                )}
              </div>

              {/* Learning Goals */}
              <div className="profile-section">
                <h2>Learning Goals</h2>
                {editing ? (
                  <textarea
                    value={profile.goals}
                    onChange={(e) => setProfile({...profile, goals: e.target.value})}
                    placeholder="Describe your learning goals and what you hope to achieve..."
                    rows="4"
                    className="goals-textarea"
                  />
                ) : (
                  <div className="profile-bio">
                    {profile.goals || 'No learning goals specified'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="profile-actions">
                {!editing ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        setEditing(false);
                        fetchStudentProfile();
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                      {!saving && <FaSave />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;