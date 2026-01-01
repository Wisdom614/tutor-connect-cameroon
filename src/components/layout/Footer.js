import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaFacebook, 
  FaTwitter, 
  FaLinkedin,
  FaCloud,
  FaUniversity
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <FaChalkboardTeacher />
              <h3>Tutor Connect Cameroon</h3>
            </div>
            <p className="tagline">Connecting students with qualified tutors across Cameroon</p>
            <div className="project-badges">
              <span className="badge cloud-badge">
                <FaCloud /> Cloud Project
              </span>
              <span className="badge university-badge">
                <FaUniversity /> University of Buea
              </span>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>For Students</h4>
              <ul>
                <li><Link to="/search">Find Tutors</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/dashboard">My Dashboard</Link></li>
              </ul>
            </div>

            <div className="link-group">
              <h4>For Tutors</h4>
              <ul>
                <li><Link to="/register">Become a Tutor</Link></li>
                <li><Link to="/login">Tutor Login</Link></li>
                <li><Link to="/tutor/profile-setup">Setup Profile</Link></li>
              </ul>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="contact-info">
            <div className="contact-item">
              <FaMapMarkerAlt />
              <span>University of Buea, Cameroon</span>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <span>contact@tutorconnectcm.com</span>
            </div>
            <div className="contact-item">
              <FaPhone />
              <span>+237 671 657 357</span>
            </div>
          </div>

          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="tech-stack">
            <span>Built with: React.js • Firebase • Cloud Firestore • Firebase Auth • Firebase Hosting</span>
          </div>
          <div className="copyright">
            <p>&copy; {currentYear} Tutor Connect Cameroon - Cloud Computing Project. All rights reserved.</p>
            <p className="developer">Developed by: BESONG WISDOM | University of Buea</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;