import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaGraduationCap, FaBook, FaMoneyBill, FaClock, 
  FaCheckCircle, FaUpload, FaCalendar, FaCamera,
  FaTimes, FaStar, FaLanguage, FaUserGraduate
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const TutorProfileSetup = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subjects: [],
    hourlyRate: 15,
    education: '',
    experience: '',
    bio: '',
    teachingStyle: '',
    availability: [],
    profileImage: null,
    qualifications: [],
    languages: ['English'],
    levels: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'History', 'Geography',
    'Computer Science', 'Economics', 'Accounting',
    'Further Mathematics', 'Literature', 'Business Studies'
  ];

  const educationLevels = [
    'High School Graduate',
    'Undergraduate Student',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Certification'
  ];

  const teachingLevels = [
    'Primary', 'Form 1-2', 'Form 3-5', 'Lower Sixth',
    'Upper Sixth', 'University', 'Professional'
  ];

  const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Arabic'];

  useEffect(() => {
    if (userData?.profileImage) {
      setImagePreview(userData.profileImage);
      setFormData(prev => ({ ...prev, profileImage: userData.profileImage }));
    } else {
      // Set a default profile image URL if none exists
      const defaultImage = 'https://via.placeholder.com/150';
      setImagePreview(defaultImage);
      setFormData(prev => ({ ...prev, profileImage: defaultImage }));
    }
  }, [userData]);

  // Validate Step 1 whenever form data changes
  useEffect(() => {
    validateStep1();
  }, [formData]);

  const validateStep1 = () => {
    const newErrors = {};
    
    // Check required fields
    if (!formData.education.trim()) {
      newErrors.education = 'Education level is required';
    }
    
    if (!formData.experience || formData.experience === '' || formData.experience < 0) {
      newErrors.experience = 'Please enter years of experience';
    } else if (formData.experience < 0) {
      newErrors.experience = 'Experience cannot be negative';
    }
    
    setErrors(newErrors);
    
    // Step 1 is valid if education and experience are filled
    const isValid = formData.education.trim() !== '' && 
                    formData.experience !== '' && 
                    formData.experience >= 0;
    
    setIsStep1Valid(isValid);
    
    return isValid && Object.keys(newErrors).length === 0;
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleLevelToggle = (level) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level]
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create a reference to the storage location
      const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update form data
      setFormData(prev => ({ ...prev, profileImage: downloadURL }));
      setImagePreview(downloadURL);
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: downloadURL
      });
      
      console.log('Image uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addQualification = () => {
    const qualification = prompt('Enter your qualification (e.g., BSc in Mathematics):');
    if (qualification && qualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification.trim()]
      }));
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addAvailabilitySlot = () => {
    const day = prompt('Enter day (e.g., Monday):');
    const time = prompt('Enter time slot (e.g., 9:00 AM - 12:00 PM):');
    
    if (day && time) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, { day, time }]
      }));
    }
  };

  const removeAvailabilitySlot = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && formData.subjects.length > 0 && formData.levels.length > 0) {
      setStep(3);
    } else {
      alert('Please complete all required fields');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess('');

    try {
      // Ensure profileImage is not undefined
      const profileImageToSave = formData.profileImage || userData?.profileImage || 'https://via.placeholder.com/150';
      
      console.log('Saving profile with data:', {
        ...formData,
        profileImage: profileImageToSave
      });

      // Prepare tutor data
      const tutorData = {
        subjects: formData.subjects,
        hourlyRate: parseFloat(formData.hourlyRate) || 15,
        education: formData.education,
        experience: parseInt(formData.experience) || 0,
        bio: formData.bio || '',
        teachingStyle: formData.teachingStyle || '',
        availability: formData.availability || [],
        qualifications: formData.qualifications || [],
        languages: formData.languages || ['English'],
        levels: formData.levels || [],
        profileComplete: true,
        status: 'pending',
        updatedAt: new Date(),
        createdAt: userData?.createdAt || new Date()
      };

      // Prepare user data
      const userUpdateData = {
        profileCompleted: true,
        profileImage: profileImageToSave,
        updatedAt: new Date()
      };

      console.log('Updating tutor document with:', tutorData);
      console.log('Updating user document with:', userUpdateData);

      // Update tutor profile in Firestore
      await updateDoc(doc(db, 'tutors', user.uid), tutorData);

      // Update user profile
      await updateDoc(doc(db, 'users', user.uid), userUpdateData);

      setSuccess('Profile setup complete! Your profile is under review.');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      console.error('Error details:', error.message);
      alert('Failed to save profile. Please try again. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-setup-container">
        <div className="setup-header">
          <h1>Complete Your Tutor Profile</h1>
          <p>Step {step} of 3 • Complete all steps to start accepting students</p>
          
          <div className="setup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Basic Info</p>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Teaching Details</p>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Availability</p>
            </div>
          </div>
        </div>

        <div className="setup-content">
          {success && (
            <div className="success-message">
              <FaCheckCircle /> {success}
            </div>
          )}

          {/* Debug Info - Remove in production */}
          <div className="debug-info" style={{
            background: '#f0f0f0',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <strong>Debug Info:</strong> Profile Image: {formData.profileImage ? 'Set' : 'Not set'} | 
            User UID: {user?.uid}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="setup-step">
              <div className="step-header">
                <h2><FaGraduationCap /> Basic Information</h2>
                <p>Tell us about your education and experience</p>
              </div>
              
              <div className="profile-image-section">
                <div className="image-upload">
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" />
                    ) : (
                      <div className="image-placeholder">
                        <FaCamera />
                        <span>Upload Profile Photo</span>
                      </div>
                    )}
                    {uploading && <div className="uploading-overlay">Uploading...</div>}
                  </div>
                  <label className="upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <FaUpload /> {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <p className="help-text" style={{ marginTop: '10px', fontSize: '12px' }}>
                    {formData.profileImage ? 'Photo uploaded' : 'Photo is optional'}
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Highest Education Level *</label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    required
                    className={errors.education ? 'error' : ''}
                  >
                    <option value="">Select your education level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.education && (
                    <span className="error-text">{errors.education}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Years of Tutoring Experience *</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 3"
                    min="0"
                    max="50"
                    required
                    className={errors.experience ? 'error' : ''}
                  />
                  {errors.experience && (
                    <span className="error-text">{errors.experience}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Teaching Style & Approach (Optional)</label>
                <textarea
                  value={formData.teachingStyle}
                  onChange={(e) => setFormData({...formData, teachingStyle: e.target.value})}
                  placeholder="Describe your teaching methodology..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Brief Biography (Optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell students about yourself..."
                  rows="4"
                />
              </div>

              <div className="qualifications-section">
                <label>Qualifications & Certifications (Optional)</label>
                <div className="qualifications-list">
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="qualification-item">
                      <FaGraduationCap />
                      <span>{qual}</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeQualification(index)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addQualification}
                >
                  <FaGraduationCap /> Add Qualification
                </button>
              </div>

              <div className="step-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                >
                  {isStep1Valid ? 'Next: Teaching Details' : 'Please fill required fields'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Teaching Details */}
          {step === 2 && (
            <div className="setup-step">
              <div className="step-header">
                <h2><FaBook /> Teaching Details</h2>
                <p>Define what and who you teach</p>
              </div>
              
              <div className="form-group">
                <label>Subjects You Teach *</label>
                <div className="subjects-selector">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      className={`subject-tag ${formData.subjects.includes(subject) ? 'selected' : ''}`}
                      onClick={() => handleSubjectToggle(subject)}
                    >
                      {subject}
                      {formData.subjects.includes(subject) && <FaCheckCircle />}
                    </button>
                  ))}
                </div>
                <p className="help-text">Select all subjects you're qualified to teach</p>
                {formData.subjects.length === 0 && (
                  <span className="error-text">Please select at least one subject</span>
                )}
              </div>

              <div className="form-group">
                <label>Teaching Levels *</label>
                <div className="levels-selector">
                  {teachingLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`level-tag ${formData.levels.includes(level) ? 'selected' : ''}`}
                      onClick={() => handleLevelToggle(level)}
                    >
                      {level}
                      {formData.levels.includes(level) && <FaCheckCircle />}
                    </button>
                  ))}
                </div>
                <p className="help-text">Select all levels you can teach</p>
                {formData.levels.length === 0 && (
                  <span className="error-text">Please select at least one teaching level</span>
                )}
              </div>

              <div className="form-group">
                <label>Languages You Speak (Optional)</label>
                <div className="languages-selector">
                  {languages.map(language => (
                    <button
                      key={language}
                      type="button"
                      className={`language-tag ${formData.languages.includes(language) ? 'selected' : ''}`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      <FaLanguage /> {language}
                      {formData.languages.includes(language) && <FaCheckCircle />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Hourly Rate (USD) *</label>
                <div className="rate-input-group">
                  <span className="rate-prefix">$</span>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 15})}
                    min="5"
                    max="100"
                    step="5"
                    required
                  />
                  <span className="rate-suffix">/ hour</span>
                </div>
                <p className="help-text">Recommended rate for Cameroon: $10 - $30 per hour</p>
              </div>

              <div className="step-actions">
                <button
                  className="btn btn-outline"
                  onClick={handlePrevStep}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={formData.subjects.length === 0 || formData.levels.length === 0}
                >
                  {formData.subjects.length === 0 || formData.levels.length === 0 
                    ? 'Please select subjects and levels' 
                    : 'Next: Availability'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="setup-step">
              <div className="step-header">
                <h2><FaClock /> Availability Schedule</h2>
                <p>Set your available time slots for tutoring sessions</p>
              </div>
              
              <div className="availability-section">
                <div className="availability-header">
                  <h3>Weekly Schedule (Optional)</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={addAvailabilitySlot}
                  >
                    <FaCalendar /> Add Time Slot
                  </button>
                </div>
                
                {formData.availability.length > 0 ? (
                  <div className="availability-list">
                    {formData.availability.map((slot, index) => (
                      <div key={index} className="availability-slot">
                        <div className="slot-info">
                          <FaCalendar />
                          <div>
                            <strong>{slot.day}</strong>
                            <span>{slot.time}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeAvailabilitySlot(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-availability">
                    <FaCalendar />
                    <p>No availability slots added yet</p>
                    <p className="help-text">You can add your availability later from your dashboard</p>
                  </div>
                )}
                
                <div className="availability-note">
                  <h4><FaStar /> Important Notes</h4>
                  <ul>
                    <li>Students can book sessions only during your available time slots</li>
                    <li>You can update your availability anytime from your dashboard</li>
                    <li>24-hour cancellation policy is recommended</li>
                    <li>Consider time zones when setting availability</li>
                  </ul>
                </div>
              </div>

              <div className="step-actions">
                <button
                  className="btn btn-outline"
                  onClick={handlePrevStep}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving Profile...' : 'Complete Setup'}
                </button>
                
                {/* Debug button for testing */}
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    console.log('Current form data:', formData);
                    console.log('Profile image:', formData.profileImage);
                    console.log('User data:', userData);
                    alert('Check console for debug info');
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  Debug Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorProfileSetup;