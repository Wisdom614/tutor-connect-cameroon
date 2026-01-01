import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera,
  FaSave, FaEdit, FaTimes, FaCalendarAlt, FaGraduationCap,
  FaBook, FaLanguage, FaBriefcase, FaSchool, FaUpload,
  FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const UserProfile = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    education: '',
    profession: '',
    languages: [],
    interests: [],
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  const cities = [
    'Yaoundé', 'Douala', 'Bamenda', 'Buea', 'Limbe',
    'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Kumba'
  ];
  
  const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Arabic'];
  const interests = [
    'Mathematics', 'Science', 'Literature', 'History', 'Technology',
    'Arts', 'Sports', 'Music', 'Travel', 'Cooking', 'Reading'
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          education: data.education || '',
          profession: data.profession || '',
          languages: data.languages || [],
          interests: data.interests || [],
          profileImage: data.profileImage || ''
        });
        
        if (data.profileImage) {
          setImagePreview(data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageToggle = (language) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a reference to the storage location
      const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update local state
      setProfile(prev => ({ ...prev, profileImage: downloadURL }));
      setImagePreview(downloadURL);
      setSuccess('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!profile.email.trim()) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        education: profile.education,
        profession: profile.profession,
        languages: profile.languages,
        interests: profile.interests,
        profileImage: profile.profileImage,
        profileComplete: true,
        updatedAt: new Date()
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Refresh user data
      setTimeout(() => {
        window.location.reload(); // Simple refresh to update context
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
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
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="container">
          {/* Header */}
          <div className="profile-header">
            <div className="header-content">
              <h1>
                <FaUser /> My Profile
              </h1>
              <p>Manage your personal information and preferences</p>
            </div>
            
            <div className="header-actions">
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
                      fetchUserProfile(); // Reset changes
                    }}
                  >
                    <FaTimes /> Cancel
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

          {/* Messages */}
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

          <div className="profile-content">
            {/* Left Column - Profile Image & Basic Info */}
            <div className="profile-sidebar">
              <div className="profile-image-section">
                <div className="image-container">
                  <div className="image-wrapper">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUser />
                      </div>
                    )}
                    {uploading && (
                      <div className="uploading-overlay">
                        Uploading...
                      </div>
                    )}
                  </div>
                  
                  {editing && (
                    <div className="image-actions">
                      <label className="btn btn-outline btn-small">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                        <FaCamera /> Change Photo
                      </label>
                      {profile.profileImage && (
                        <button 
                          className="btn-text btn-small"
                          onClick={() => {
                            setProfile(prev => ({ ...prev, profileImage: '' }));
                            setImagePreview('');
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {!editing && (
                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-label">Member Since</span>
                      <span className="stat-value">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Account Type</span>
                      <span className={`stat-value type-${userData?.userType}`}>
                        {userData?.userType?.toUpperCase()}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Profile Complete</span>
                      <span className="stat-value">
                        {userData?.profileComplete ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="profile-main">
              <div className="profile-section">
                <h2>
                  <FaUser /> Personal Information
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaUser /> Full Name *
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <div className="profile-field">{profile.fullName || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaEnvelope /> Email Address
                    </label>
                    <div className="profile-field">{profile.email}</div>
                    <small className="field-note">Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaPhone /> Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                        placeholder="+237 6XX XXX XXX"
                      />
                    ) : (
                      <div className="profile-field">{profile.phone || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt /> Location
                    </label>
                    {editing ? (
                      <select
                        name="location"
                        value={profile.location}
                        onChange={handleInputChange}
                      >
                        <option value="">Select your city</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="profile-field">{profile.location || 'Not set'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="profile-section">
                <h2>
                  <FaUser /> About Me
                </h2>
                {editing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="bio-textarea"
                  />
                ) : (
                  <div className="profile-bio">
                    {profile.bio || 'No bio added yet.'}
                  </div>
                )}
              </div>

              {/* Education & Profession */}
              <div className="profile-section">
                <h2>
                  <FaGraduationCap /> Education & Profession
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaSchool /> Education
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="education"
                        value={profile.education}
                        onChange={handleInputChange}
                        placeholder="e.g., BSc in Computer Science"
                      />
                    ) : (
                      <div className="profile-field">{profile.education || 'Not specified'}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaBriefcase /> Profession
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="profession"
                        value={profile.profession}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Developer"
                      />
                    ) : (
                      <div className="profile-field">{profile.profession || 'Not specified'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages */}
              {editing && (
                <div className="profile-section">
                  <h2>
                    <FaLanguage /> Languages
                  </h2>
                  <p className="section-subtitle">Select languages you speak</p>
                  <div className="languages-selector">
                    {languages.map(language => (
                      <button
                        key={language}
                        type="button"
                        className={`language-tag ${profile.languages.includes(language) ? 'selected' : ''}`}
                        onClick={() => handleLanguageToggle(language)}
                      >
                        {language}
                        {profile.languages.includes(language) && <FaCheckCircle />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {editing && (
                <div className="profile-section">
                  <h2>
                    <FaBook /> Interests
                  </h2>
                  <p className="section-subtitle">Select your interests</p>
                  <div className="interests-selector">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        className={`interest-tag ${profile.interests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                        {profile.interests.includes(interest) && <FaCheckCircle />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View Mode - Show Languages & Interests */}
              {!editing && (profile.languages.length > 0 || profile.interests.length > 0) && (
                <>
                  {profile.languages.length > 0 && (
                    <div className="profile-section">
                      <h2>
                        <FaLanguage /> Languages
                      </h2>
                      <div className="tags-list">
                        {profile.languages.map(language => (
                          <span key={language} className="tag">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.interests.length > 0 && (
                    <div className="profile-section">
                      <h2>
                        <FaBook /> Interests
                      </h2>
                      <div className="tags-list">
                        {profile.interests.map(interest => (
                          <span key={interest} className="tag">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;