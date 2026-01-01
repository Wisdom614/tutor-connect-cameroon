import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaPaperPlane, FaUser, FaComment
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: 'Email Us',
      details: ['contact@tutorconnectcm.com', 'support@tutorconnectcm.com'],
      link: 'mailto:wisdombesong123@gmail.com'
    },
    {
      icon: <FaPhone />,
      title: 'Call Us',
      details: ['+237 671657357', '+237 674464389'],
      link: 'tel:+237671657357'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Visit Us',
      details: ['University of Buea', 'College Of Technology', 'Buea, Cameroon'],
      link: 'https://www.google.com/maps/place/College+of+Technology/@4.1488955,9.2852767,17z/data=!4m14!1m7!3m6!1s0x1061319236ca3443:0xbeb6c7b0ea934477!2sCentral+Administration+University+of+Buea!8m2!3d4.1488902!4d9.2878516!16s%2Fm%2F09k4c3b!3m5!1s0x10613185f7b2b123:0x4c2ded8004d52d6b!8m2!3d4.1490716!4d9.2851536!16s%2Fg%2F11f3zghlxf?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      details: ['Monday - Friday: 8:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 1:00 PM', 'Sunday: Closed'],
      link: null
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Thank you for your message! We will get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1>Contact Us</h1>
            <p className="hero-subtitle">
              Get in touch with the Tutor Connect Cameroon team
            </p>
            <p className="hero-description">
              Have questions about our platform, need technical support, or want to 
              provide feedback? We're here to help! Reach out to us through any of 
              the channels below.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          {/* Contact Information */}
          <div className="contact-info-section">
            <h2>Get In Touch</h2>
            <p className="section-subtitle">
              Connect with us through multiple channels
            </p>
            
            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-card">
                  <div className="contact-icon">
                    {info.icon}
                  </div>
                  <h3>{info.title}</h3>
                  <div className="contact-details">
                    {info.details.map((detail, idx) => (
                      <p key={idx}>{detail}</p>
                    ))}
                  </div>
                  {info.link && (
                    <a 
                      href={info.link} 
                      className="contact-link"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {info.title === 'Email Us' ? 'Send Email' : 
                       info.title === 'Call Us' ? 'Make Call' : 
                       'View on Map'}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Project Information */}
            <div className="project-info">
              <h3>Cloud Computing Project</h3>
              <div className="project-details">
                <p><strong>Course:</strong> Cloud Computing</p>
                <p><strong>Institution:</strong> University of Buea</p>
                <p><strong>Department:</strong> College Of Technology</p>
                <p><strong>Team Leader:</strong> BESONG WISDOM</p>
                <p><strong>Academic Year:</strong> 2025/2026</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll respond as soon as possible</p>
            </div>

            {success && (
              <div className="success-message">
                <FaPaperPlane /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>
                  <FaUser /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope /> Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaComment /> Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="academic">Academic Project Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  rows="6"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>

            {/* FAQ Section */}
            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-list">
                <div className="faq-item">
                  <h4>Is Tutor Connect Cameroon free to use?</h4>
                  <p>Yes, the platform is completely free for students to search and find tutors. Tutors can register for free and only pay a small commission on successful bookings.</p>
                </div>
                <div className="faq-item">
                  <h4>How are tutors verified?</h4>
                  <p>All tutors undergo a verification process where we check their educational qualifications, teaching experience, and conduct background checks.</p>
                </div>
                <div className="faq-item">
                  <h4>Is this a real commercial platform?</h4>
                  <p>Tutor Connect Cameroon is a cloud computing academic project developed for the University of Buea. It demonstrates real-world cloud implementation but is not a commercial product.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2>Our Location</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <FaMapMarkerAlt />
              <h3>University of Buea</h3>
              <p>College Of Technology</p>
              <p>Buea, South West Region, Cameroon</p>
              <a 
                href="https://maps.google.com/?q=University+of+Buea"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
        <Footer />
    </>
  );
};

export default Contact;