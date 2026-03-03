import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Footer.css';
import siteLogo from '../assets/icons/logo.png';

const Footer = () => {
  const navigate = useNavigate();

  const handleContactUsClick = () => {
    navigate('/contact-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const servicesLinks = [
    { label: 'Online Food Ordering', path: '/ai-web-application-development' },
    { label: 'Restaurant Management', path: '/ai-software-development' },
    { label: 'Delivery Partner Network', path: '/full-stack-web-development' },
    { label: 'Real-Time Order Tracking', path: '/ai-website-design-development' },
    { label: 'Secure Payments', path: '/ai-software-development' },
    { label: 'Offers & Promotions', path: '/seo-ai-search-optimization' },
  ];

  const knowledgebaseLinks = [
    { label: 'Order Food Near You', path: '/ai-web-application-development' },
    { label: 'Grow Your Restaurant', path: '/ai-software-development' },
    { label: 'Become a Delivery Partner', path: '/ai-software-development' },
    { label: 'Faster Delivery', path: '/ecommerce-development-optimization' },
    { label: 'Manage Orders Easily', path: '/seo-services' },
  ];

  const companyLinks = [
    { label: 'Website Growth Guides', path: '/google-search---console' },
    { label: 'AI for Business', path: '/ai-seo' },
    { label: 'Modern Slavary Statement', path: '/seo-services' },
    { label: 'Privacy', path: '/case-studies' },
     { label: 'Terms of Service', path: '/terms-conditions' }
  ];

  const exploreLinks = [
    { label: 'Get Help', path: '/about' },
    { label: 'How We Work', path: '/about' },
    { label: 'Add Your Resturant', path: '/contact-us' },
    { label: 'Contact Us', path: '/contact-us' },
    { label: 'SignUp to Deliver', path: '/privacy-policy' },
   
  ];

  return (
    <footer className="footer">

      {/* TOP SECTION */}
      <div className="footer-top">
        <div className="footer-top-container">

          {/* LEFT SIDE — STATS + BUTTON */}
         

            {/* BUTTON UNDER BOTH */}
            

          {/* RIGHT SIDE — CTA BOX */}
         </div>
        
        {/* Full-width line */}
        
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="footer-main">
        <div className="footer-container">

          {/* Branding */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={siteLogo} alt="techco" className="logo-text-img" />
            </div>

            <div className="footer-contact-box">
              <h4 className="contact-heading">
                Ready to speak with a marketing expert? Give us a ring
              </h4>

              <a
                href="https://wa.me/94740309534?text=Hi%20ZonzocTech%20Team,%20I%20would%20like%20to%20discuss%20a%20project."
                className="phone-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp"></i>
                +94 75 200 9845
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="footer-column">
            <h4 className="footer-column-title">Core Services</h4>
            <ul className="footer-links">
              {servicesLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Solutions by Need</h4>
            <ul className="footer-links">
              {knowledgebaseLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Legal Pages</h4>
            <ul className="footer-links">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Important Links</h4>
            <ul className="footer-links">
              {exploreLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Full-width line before footer bottom */}
      <div className="line">
        <hr style={{
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 1)',
          margin: '20px 0',
          width: '100%'
        }} />
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            Order.UK© 2020-2025
          </p>
          <div className="social-icons">
             <a href="#" className="social-icon">
              <i class="fa-brands fa-facebook"></i>
            </a>
            <a href="#" className="social-icon">
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a href="#" className="social-icon">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" className="social-icon">
              <i class="fa-brands fa-snapchat"></i>
            </a>  
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
