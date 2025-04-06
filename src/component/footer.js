import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import './footer.css';

const StudyAppFooter = () => {
  return (
    <footer className="study-app-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-logo-section">
            <h3 className="footer-title">StudyPro</h3>
            <p className="footer-description">
              Empowering learners with innovative study tools and resources.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <nav className="footer-nav">
              <a href="#" className="footer-nav-link">Home</a>
              <a href="#" className="footer-nav-link">Courses</a>
              <a href="#" className="footer-nav-link">Resources</a>
              <a href="#" className="footer-nav-link">About Us</a>
            </nav>
          </div>

          {/* Contact and Social */}
          <div className="footer-contact-section">
            <h4 className="footer-section-title">Connect With Us</h4>
            <div className="footer-social-icons">
              <a href="#" className="social-icon"><Facebook size={24} /></a>
              <a href="#" className="social-icon"><Instagram size={24} /></a>
              <a href="#" className="social-icon"><Twitter size={24} /></a>
              <a href="#" className="social-icon"><Linkedin size={24} /></a>
            </div>
            <div className="footer-contact-info">
              <Mail size={20} />
              <a href="mailto:support@studypro.com" className="contact-email">
                support@studypro.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Legal */}
        <div className="footer-copyright">
          <p className="copyright-text">
            © {new Date().getFullYear()} StudyPro. All Rights Reserved.
            <span className="legal-links">
              <a href="#" className="legal-link">Privacy Policy</a>
              <a href="#" className="legal-link">Terms of Service</a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StudyAppFooter;