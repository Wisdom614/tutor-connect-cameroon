import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  FaCloud, FaUsers, FaShieldAlt, FaRocket, 
  FaGraduationCap, FaGlobeAfrica, FaMobileAlt,
  FaDatabase, FaServer, FaChartLine
} from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaCloud />,
      title: 'Cloud-Powered Platform',
      description: 'Built on Firebase for scalability, reliability, and global accessibility'
    },
    {
      icon: <FaUsers />,
      title: 'Community Focused',
      description: 'Connecting Cameroonian students with local qualified tutors'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure & Verified',
      description: 'All tutors are verified with proper credentials and background checks'
    },
    {
      icon: <FaRocket />,
      title: 'Fast & Responsive',
      description: 'Mobile-first design optimized for performance across all devices'
    },
    {
      icon: <FaGraduationCap />,
      title: 'Quality Education',
      description: 'Supporting academic excellence across all educational levels'
    },
    {
      icon: <FaGlobeAfrica />,
      title: 'Made for Cameroon',
      description: 'Tailored to the specific needs of the Cameroonian education system'
    }
  ];

  const techStack = [
    { name: 'React.js', description: 'Frontend framework for building user interfaces' },
    { name: 'Firebase', description: 'Backend-as-a-Service for authentication, database, and hosting' },
    { name: 'Cloud Firestore', description: 'NoSQL database for real-time data synchronization' },
    { name: 'Firebase Authentication', description: 'Secure user authentication and authorization' },
    { name: 'Firebase Hosting', description: 'Global CDN hosting with automatic SSL' },
    { name: 'Firebase Storage', description: 'Secure file storage for profiles and documents' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About Tutor Connect Cameroon</h1>
            <p className="hero-subtitle">
              A Cloud Computing Project Revolutionizing Education in Cameroon
            </p>
            <p className="hero-description">
              Tutor Connect Cameroon is a cloud-based platform that bridges the gap between 
              students seeking quality education and qualified tutors across Cameroon. 
              Built using modern cloud technologies, our platform demonstrates the power 
              of cloud computing in solving real-world educational challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <h2>Our Mission</h2>
              <p>
                To democratize access to quality education in Cameroon by leveraging 
                cloud technology to connect students with verified tutors, making 
                learning accessible, affordable, and effective for everyone.
              </p>
            </div>
            <div className="mission-card">
              <h2>Our Vision</h2>
              <p>
                To become Cameroon's leading educational technology platform, 
                transforming how students learn and tutors teach through innovative 
                cloud-based solutions that scale across the nation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Computing Features */}
      <section className="cloud-features">
        <div className="container">
          <div className="section-header">
            <h2>Cloud Computing Implementation</h2>
            <p>How we leverage cloud technologies for educational empowerment</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-stack">
        <div className="container">
          <div className="section-header">
            <h2>Technology Stack</h2>
            <p>Modern cloud technologies powering our platform</p>
          </div>
          
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-card">
                <h3>{tech.name}</h3>
                <p>{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Objectives */}
      <section className="objectives">
        <div className="container">
          <div className="section-header">
            <h2>Project Objectives</h2>
            <p>Key goals of our cloud computing project</p>
          </div>
          
          <div className="objectives-list">
            <div className="objective-item">
              <FaMobileAlt />
              <div>
                <h3>Mobile-First Accessibility</h3>
                <p>Ensure the platform is accessible on all devices, especially mobile phones</p>
              </div>
            </div>
            <div className="objective-item">
              <FaDatabase />
              <div>
                <h3>Scalable Architecture</h3>
                <p>Design a serverless architecture that can scale with user growth</p>
              </div>
            </div>
            <div className="objective-item">
              <FaServer />
              <div>
                <h3>Cost-Effective Solution</h3>
                <p>Utilize cloud services that minimize operational costs while maximizing performance</p>
              </div>
            </div>
            <div className="objective-item">
              <FaChartLine />
              <div>
                <h3>Real-Time Updates</h3>
                <p>Implement real-time features for bookings, messages, and notifications</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Project Team</h2>
            <p>Cloud Computing Project - University of Buea</p>
          </div>
          
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">
                <FaUsers />
              </div>
              <h3>BESONG WISDOM</h3>
              <p className="team-role">Project Group Leader</p>
              <p className="team-dept">College Of Technology</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <FaGraduationCap />
              </div>
              <h3>Mr Kometa</h3>
              <p className="team-role">Project Supervisor</p>
              <p className="team-dept">College Of Technology</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <FaGlobeAfrica />
              </div>
              <h3>University of Buea</h3>
              <p className="team-role">Institution</p>
              <p className="team-dept">Cloud Computing Course Project</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Join the Educational Revolution</h2>
            <p>Experience the power of cloud computing in education</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">Sign Up Free</a>
              <a href="/contact" className="btn btn-secondary">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
        <Footer />
    </>
  );
};

export default About;