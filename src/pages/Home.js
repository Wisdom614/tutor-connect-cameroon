import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  FaSearch, 
  FaChalkboardTeacher, 
  FaStar, 
  FaMobileAlt,
  FaClock,
  FaShieldAlt,
  FaUsers,
  FaBookOpen
} from 'react-icons/fa';

const Home = () => {
  const stats = [
    { number: '500+', label: 'Registered Tutors' },
    { number: '2,000+', label: 'Students Helped' },
    { number: '4.8', label: 'Average Rating', icon: <FaStar /> },
    { number: '95%', label: 'Satisfaction Rate' }
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'French', 'Computer Science', 'Economics'
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Qualified Private Tutors in Cameroon
            </h1>
            <p className="hero-subtitle">
              Connect with certified tutors for personalized learning across all academic levels.
              From primary school to university, we've got you covered.
            </p>

            <div className="hero-buttons">
              <Link to="/search" className="btn btn-secondary btn-large">
                <FaSearch /> Browse All Tutors
              </Link>
              <Link to="/register" className="btn btn-primary btn-large">
                <FaChalkboardTeacher /> Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">
                  {stat.icon && <span className="stat-icon">{stat.icon}</span>}
                  {stat.number}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Tutor Connect Cameroon</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FaSearch /></div>
              <h3>Easy Search & Filter</h3>
              <p>Find tutors by subject, location, availability, and price range</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaShieldAlt /></div>
              <h3>Verified Tutors</h3>
              <p>All tutors are verified with proper credentials and background checks</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaMobileAlt /></div>
              <h3>Mobile First Design</h3>
              <p>Access our platform from any device, optimized for smartphones</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaClock /></div>
              <h3>Flexible Scheduling</h3>
              <p>Book sessions at your convenience, with flexible time slots</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaUsers /></div>
              <h3>Community Driven</h3>
              <p>Read reviews and ratings from other students before booking</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaBookOpen /></div>
              <h3>All Subjects Covered</h3>
              <p>From primary school basics to university-level specialized courses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="subjects-section">
        <div className="container">
          <h2 className="section-title">Popular Subjects</h2>
          <div className="subjects-grid">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                to={`/search?subject=${subject}`}
                className="subject-card"
              >
                <div className="subject-name">{subject}</div>
                <div className="subject-tutors">50+ tutors available</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account as a student or tutor</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Search & Filter</h3>
              <p>Find the perfect tutor based on your needs</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Book a Session</h3>
              <p>Schedule your session at a convenient time</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Learn & Grow</h3>
              <p>Connect with your tutor and achieve your goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>
              Join thousands of students who are improving their grades with
              Tutor Connect Cameroon
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Sign Up Free
              </Link>
              <Link to="/search" className="btn btn-secondary btn-large">
                Browse Tutors
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
