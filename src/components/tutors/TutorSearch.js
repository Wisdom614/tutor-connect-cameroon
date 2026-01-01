import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import TutorCard from './TutorCard';
import { 
  FaFilter, FaSearch, FaMapMarkerAlt, FaGraduationCap, 
  FaMoneyBill, FaSort, FaStar, FaClock 
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';

const TutorSearch = () => {
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    subject: '',
    location: '',
    maxRate: '',
    minRate: '',
    level: '',
    availability: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'History', 'Geography',
    'Computer Science', 'Economics', 'Accounting',
    'Further Mathematics', 'Literature'
  ];

  const levels = [
    'Primary', 'Form 1-2', 'Form 3-5', 'Lower Sixth',
    'Upper Sixth', 'University', 'Professional'
  ];

  const cities = [
    'All Locations', 'Yaoundé', 'Douala', 'Bamenda', 'Buea', 'Limbe',
    'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Kumba'
  ];

  const availabilityOptions = [
    'All', 'Weekdays', 'Weekends', 'Morning', 'Afternoon', 'Evening'
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rating' },
    { value: 'rate', label: 'Lowest Rate' },
    { value: 'sessions', label: 'Most Experienced' },
    { value: 'name', label: 'Name A-Z' }
  ];

  useEffect(() => {
    fetchAllTutors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tutors, searchQuery, sortBy]);

  const fetchAllTutors = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Starting to fetch all tutors...');

      // Try multiple approaches to get tutors

      // APPROACH 1: Get all users who are tutors
      console.log('Approach 1: Fetching from users collection...');
      const usersQuery = query(collection(db, 'users'), where('userType', '==', 'tutor'));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log(`Found ${usersSnapshot.size} users marked as tutors`);
      
      if (usersSnapshot.size === 0) {
        console.log('No tutors found in users collection, trying tutors collection...');
        await fetchFromTutorsCollection();
        return;
      }

      const tutorsData = [];
      const tutorsPromises = [];

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('User tutor found:', userData.email, userData.fullName);
        
        // Create a promise to get tutor details and merge data
        const promise = (async () => {
          try {
            // Try to get tutor-specific data
            const tutorQuery = query(collection(db, 'tutors'), where('uid', '==', userData.uid || doc.id));
            const tutorSnapshot = await getDocs(tutorQuery);
            
            let mergedData = { 
              id: doc.id, 
              uid: userData.uid || doc.id,
              ...userData 
            };
            
            if (!tutorSnapshot.empty) {
              const tutorData = tutorSnapshot.docs[0].data();
              console.log('Tutor data found for user:', userData.email, tutorData);
              mergedData = { ...mergedData, ...tutorData };
              
              // Ensure status is set (default to 'approved' if not in tutor data)
              if (!mergedData.status && userData.status) {
                mergedData.status = userData.status;
              } else if (!mergedData.status) {
                mergedData.status = 'approved'; // Default status
              }
            } else {
              console.log('No tutor-specific data found for:', userData.email);
              // Set default values for missing tutor data
              mergedData = {
                ...mergedData,
                subjects: userData.subjects || [],
                hourlyRate: userData.hourlyRate || 15,
                rating: userData.rating || 0,
                totalSessions: userData.totalSessions || 0,
                status: userData.status || 'approved',
                profileComplete: userData.profileComplete || false
              };
            }
            
            return mergedData;
          } catch (err) {
            console.error('Error fetching tutor details:', err);
            return { 
              id: doc.id, 
              uid: userData.uid || doc.id,
              ...userData,
              subjects: userData.subjects || [],
              hourlyRate: userData.hourlyRate || 15,
              rating: userData.rating || 0,
              totalSessions: userData.totalSessions || 0,
              status: userData.status || 'approved'
            };
          }
        })();
        
        tutorsPromises.push(promise);
      });

      // Wait for all promises to resolve
      const allTutors = await Promise.all(tutorsPromises);
      
      // Filter only approved tutors
      const approvedTutors = allTutors.filter(tutor => 
        tutor.status === 'approved' || tutor.status === undefined
      );
      
      console.log(`Total tutors found: ${allTutors.length}, Approved: ${approvedTutors.length}`);
      console.log('Approved tutors:', approvedTutors);
      
      if (approvedTutors.length === 0) {
        console.log('No approved tutors found, showing all tutors for debugging...');
        setTutors(allTutors);
        setFilteredTutors(allTutors);
      } else {
        setTutors(approvedTutors);
        setFilteredTutors(approvedTutors);
      }

    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError(`Error loading tutors: ${error.message}`);
      
      // Fallback to mock data for testing
      setTutors([
        {
          id: '1',
          uid: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          location: 'Yaoundé',
          subjects: ['Mathematics', 'Physics'],
          hourlyRate: 20,
          rating: 4.5,
          totalSessions: 50,
          profileImage: 'https://via.placeholder.com/150',
          status: 'approved',
          profileComplete: true
        },
        {
          id: '2',
          uid: '2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          location: 'Douala',
          subjects: ['English', 'French'],
          hourlyRate: 25,
          rating: 4.8,
          totalSessions: 75,
          profileImage: 'https://via.placeholder.com/150',
          status: 'approved',
          profileComplete: true
        },
        {
          id: '3',
          uid: '3',
          fullName: 'Michael Johnson',
          email: 'michael@example.com',
          location: 'Bamenda',
          subjects: ['Chemistry', 'Biology'],
          hourlyRate: 18,
          rating: 4.7,
          totalSessions: 45,
          profileImage: 'https://via.placeholder.com/150',
          status: 'approved',
          profileComplete: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromTutorsCollection = async () => {
    try {
      console.log('Approach 2: Fetching from tutors collection directly...');
      const tutorsSnapshot = await getDocs(collection(db, 'tutors'));
      
      console.log(`Found ${tutorsSnapshot.size} documents in tutors collection`);
      
      if (tutorsSnapshot.size === 0) {
        console.log('No documents in tutors collection either');
        return;
      }

      const tutorsData = [];
      const tutorsPromises = [];

      tutorsSnapshot.forEach((doc) => {
        const tutorData = doc.data();
        console.log('Tutor document found:', doc.id, tutorData);
        
        const promise = (async () => {
          try {
            // Try to get user data for this tutor
            const userQuery = query(collection(db, 'users'), where('uid', '==', tutorData.uid || doc.id));
            const userSnapshot = await getDocs(userQuery);
            
            let mergedData = { 
              id: doc.id, 
              uid: tutorData.uid || doc.id,
              ...tutorData 
            };
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              mergedData = { ...mergedData, ...userData };
            }
            
            return mergedData;
          } catch (err) {
            console.error('Error fetching user data:', err);
            return { 
              id: doc.id, 
              uid: tutorData.uid || doc.id,
              ...tutorData 
            };
          }
        })();
        
        tutorsPromises.push(promise);
      });

      const allTutors = await Promise.all(tutorsPromises);
      const approvedTutors = allTutors.filter(tutor => 
        tutor.status === 'approved' || tutor.status === undefined
      );
      
      console.log(`Tutors from tutors collection: ${allTutors.length}, Approved: ${approvedTutors.length}`);
      
      if (approvedTutors.length > 0) {
        setTutors(approvedTutors);
        setFilteredTutors(approvedTutors);
      }
    } catch (error) {
      console.error('Error fetching from tutors collection:', error);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters...');
    let filtered = [...tutors];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutor => {
        const nameMatch = tutor.fullName?.toLowerCase().includes(query);
        const locationMatch = tutor.location?.toLowerCase().includes(query);
        const subjectMatch = tutor.subjects?.some(subject => 
          subject?.toLowerCase().includes(query)
        );
        const bioMatch = tutor.bio?.toLowerCase().includes(query);
        
        return nameMatch || locationMatch || subjectMatch || bioMatch;
      });
    }

    // Apply subject filter
    if (filters.subject && filters.subject !== 'All Subjects') {
      filtered = filtered.filter(tutor => 
        tutor.subjects?.includes(filters.subject)
      );
    }

    // Apply location filter
    if (filters.location && filters.location !== 'All Locations') {
      filtered = filtered.filter(tutor => 
        tutor.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Apply rate filters
    if (filters.minRate) {
      filtered = filtered.filter(tutor => 
        tutor.hourlyRate >= parseFloat(filters.minRate)
      );
    }

    if (filters.maxRate) {
      filtered = filtered.filter(tutor => 
        tutor.hourlyRate <= parseFloat(filters.maxRate)
      );
    }

    // Apply level filter
    if (filters.level && filters.level !== 'All Levels') {
      filtered = filtered.filter(tutor => 
        tutor.levels?.includes(filters.level)
      );
    }

    // Apply availability filter
    if (filters.availability && filters.availability !== 'All') {
      filtered = filtered.filter(tutor => {
        if (!tutor.availability || !Array.isArray(tutor.availability)) return false;
        
        return tutor.availability.some(slot => {
          if (!slot || !slot.day) return false;
          
          if (filters.availability === 'Weekdays') {
            return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(slot.day);
          } else if (filters.availability === 'Weekends') {
            return ['Saturday', 'Sunday'].includes(slot.day);
          }
          return true;
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'rate':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'sessions':
          return (b.totalSessions || 0) - (a.totalSessions || 0);
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        default:
          return 0;
      }
    });

    console.log('Filtered tutors count:', filtered.length);
    setFilteredTutors(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      location: '',
      maxRate: '',
      minRate: '',
      level: '',
      availability: ''
    });
    setSearchQuery('');
    setFilteredTutors(tutors);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <>
      <Navbar />
      <div className="search-page">
        <section className="search-hero">
          <div className="container">
            <div className="search-hero-content">
              <h1 className="search-hero-title">Find Your Perfect Tutor</h1>
              <p className="search-hero-subtitle">Connect with qualified tutors across Cameroon</p>
              
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search by subject, tutor name, or keyword..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <button 
                  className="btn btn-outline filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          {error && (
            <div className="error-message" style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '15px',
              borderRadius: '8px',
              margin: '20px 0',
              border: '1px solid #f44336'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="search-layout">
            {/* Filters Sidebar */}
            <div className={`filters-sidebar ${showFilters ? 'active' : ''}`}>
              <div className="filters-header">
                <h3><FaFilter /> Filters</h3>
                <button className="btn-text" onClick={resetFilters}>
                  Clear All
                </button>
              </div>
              
              <div className="filter-section">
                <h4><FaGraduationCap /> Subjects</h4>
                <select 
                  name="subject" 
                  className="filter-select"
                  value={filters.subject}
                  onChange={handleFilterChange}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-section">
                <h4><FaMapMarkerAlt /> Location</h4>
                <select 
                  name="location" 
                  className="filter-select"
                  value={filters.location}
                  onChange={handleFilterChange}
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-section">
                <h4>Academic Level</h4>
                <select 
                  name="level" 
                  className="filter-select"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-section">
                <h4><FaClock /> Availability</h4>
                <select 
                  name="availability" 
                  className="filter-select"
                  value={filters.availability}
                  onChange={handleFilterChange}
                >
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-section">
                <h4><FaMoneyBill /> Hourly Rate</h4>
                <div className="rate-range">
                  <div className="rate-input-group">
                    <span className="rate-label">Min:</span>
                    <input
                      type="number"
                      name="minRate"
                      className="filter-input"
                      placeholder="$0"
                      value={filters.minRate}
                      onChange={handleFilterChange}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="rate-input-group">
                    <span className="rate-label">Max:</span>
                    <input
                      type="number"
                      name="maxRate"
                      className="filter-input"
                      placeholder="$100"
                      value={filters.maxRate}
                      onChange={handleFilterChange}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
              
              <button className="btn btn-primary btn-full apply-filters">
                Apply Filters
              </button>
            </div>
            
            {/* Results Section */}
            <div className="results-section">
              <div className="results-header">
                <div>
                  <h2>
                    Available Tutors 
                    <span className="results-count"> ({filteredTutors.length} found)</span>
                  </h2>
                  <p className="results-subtitle">Verified tutors ready to help you learn</p>
                </div>
                <div className="sort-options">
                  <FaSort />
                  <select className="sort-select" value={sortBy} onChange={handleSortChange}>
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading tutors...</p>
                </div>
              ) : filteredTutors.length > 0 ? (
                <>
                  <div className="tutors-grid">
                    {filteredTutors.map(tutor => (
                      <TutorCard key={tutor.id || tutor.uid} tutor={tutor} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FaSearch />
                  </div>
                  <h3>No tutors found</h3>
                  <p>{tutors.length === 0 
                    ? 'No tutors are currently available. Please check back later.' 
                    : 'No tutors match your current filters. Try adjusting your search criteria.'}
                  </p>
                  <button className="btn btn-primary" onClick={resetFilters}>
                    Reset All Filters
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={fetchAllTutors}
                    style={{ marginTop: '10px' }}
                  >
                    Refresh Tutors
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorSearch;