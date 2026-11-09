import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import YoutubeIcon from './YoutubeIcon';
import { useData } from '../context/DataContext';
import './Footer.css';

export default function Footer() {
  const { settings } = useData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand & Mission */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span className="footer-icon">
              <Heart size={20} fill="#ffffff" color="#ffffff" />
            </span>
            <h3>Graced Relationship Recipes</h3>
          </div>
          <p className="footer-tagline">
            {settings.about_mission || "Equipping hearts and homes with biblical wisdom for flourishing, Christ-centered relationships."}
          </p>
          <div className="footer-scripture-highlight">
            <em>"And over all these virtues put on love, which binds them all together in perfect unity."</em>
            <span>— Colossians 3:14</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/word-for-the-day">Word for the Day</Link></li>
            <li><Link to="/videos">YouTube Videos</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Get in Touch</Link></li>
          </ul>
        </div>

        {/* Connect & Social */}
        <div className="footer-col">
          <h4>Connect With Us</h4>
          <ul className="footer-contact">
            <li>
              <a 
                href={settings.youtube_channel_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
              >
                <YoutubeIcon size={18} color="#ef4444" />
                <span>The Sent TV (@THESENT_TV)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.contact_email}`} className="social-link">
                <Mail size={18} />
                <span>{settings.contact_email}</span>
              </a>
            </li>
            {settings.contact_address && (
              <li>
                <div className="social-link static">
                  <MapPin size={18} />
                  <span>{settings.contact_address}</span>
                </div>
              </li>
            )}
            {settings.contact_phone && (
              <li>
                <div className="social-link static">
                  <Phone size={18} />
                  <span>{settings.contact_phone}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} Graced Relationship Recipes. All rights reserved.</p>
          <p className="powered-tag">Designed with grace and biblical wisdom.</p>
        </div>
      </div>
    </footer>
  );
}
