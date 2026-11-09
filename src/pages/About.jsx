import { Link } from 'react-router-dom';
import { Heart, Sparkles, BookOpen, ShieldCheck, Film, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import YoutubeIcon from '../components/YoutubeIcon';
import './About.css';

export default function About() {
  const { settings } = useData();

  return (
    <div className="about-page">
      {/* Header Banner */}
      <section className="about-header-banner">
        <div className="about-header-container">
          <div className="about-badge">
            <Heart size={16} fill="#7e22ce" color="#7e22ce" />
            <span>Visionary & Founder</span>
          </div>
          <h1>About Anuoluwapo Oluwagbayela Serah</h1>
          <p>
            Drama Minister, Chartered Accountant, and Visionary behind The Sent TV & Graced Relationship Recipes.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="about-content-container">
        {/* Creator Bio Section */}
        <section className="about-story-section">
          <div className="story-text">
            <span className="about-subtag">The Heart & Calling</span>
            <h2>Dedicated to Equipping the Next Generation for Godly Relationships</h2>
            
            <p>
              <strong>Anuoluwapo Oluwagbayela Serah</strong> is a child of God, Chartered Accountant, entrepreneur, 
              and drama minister dedicated to helping the next generation build godly relationships and discover 
              their divine purpose.
            </p>

            <p>
              With extensive corporate expertise spanning the Finance, Consulting, Oil & Gas, and Power sectors, 
              she successfully balances the business world with her passions for event planning and evangelical media.
            </p>

            <p>
              Driven by her faith as a Child of God, Anuoluwapo is the visionary behind <strong>The Sent TV</strong>, 
              a platform that equips youths and teenagers with practical relationship tips, exposes spiritual pitfalls 
              through faith-based movie productions, and provides purpose-driven counseling.
            </p>

            <div className="location-pill-row">
              <span className="location-tag">
                <MapPin size={14} />
                Lagos, Nigeria
              </span>
              <span className="family-tag">
                <Heart size={14} />
                Happily Married with Children
              </span>
            </div>
          </div>

          <div className="story-image-card">
            <img 
              src="/anuoluwapo.jpeg" 
              alt="Anuoluwapo Oluwagbayela Serah - Visionary" 
              className="story-image"
            />
            <div className="story-quote-badge">
              <em>"For the Lord has called you back from your grief... with great compassion I will take you back."</em>
              <span>— Isaiah 54:6-7</span>
            </div>
          </div>
        </section>

        {/* The Sent TV Media & Ministry Pillars */}
        <section className="pillars-section">
          <div className="pillars-header">
            <span className="about-subtag">Ministry Dimensions</span>
            <h2>How God Uses The Sent TV & Graced Recipes</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Film size={24} />
              </div>
              <h3>Evangelical Media & Movies</h3>
              <p>
                Exposing spiritual traps and cultural pitfalls through compelling, faith-based movie productions on The Sent TV.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Heart size={24} />
              </div>
              <h3>Purpose-Driven Counseling</h3>
              <p>
                Guiding youths, teenagers, singles, and married couples with biblical wisdom to heal, thrive, and fulfill divine purpose.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <Briefcase size={24} />
              </div>
              <h3>Corporate & Kingdom Balance</h3>
              <p>
                Bringing professional discipline from Chartered Accountancy and high-level corporate governance to kingdom ministry.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <BookOpen size={24} />
              </div>
              <h3>Word for the Day Devotionals</h3>
              <p>
                Providing daily scripture-backed reflections to anchor hearts in God's covenant grace and relentless compassion.
              </p>
            </div>
          </div>
        </section>

        {/* Connect with The Sent TV Banner */}
        <section className="about-cta-card">
          <h2>Experience Faith-Based Productions on The Sent TV</h2>
          <p>
            Watch our latest relationship dramas, youth teachings, and gospel movie releases on our official YouTube channel.
          </p>
          <div className="about-cta-buttons">
            <a 
              href={settings.youtube_channel_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="primary-pill-btn"
            >
              <YoutubeIcon size={18} />
              <span>Watch The Sent TV on YouTube</span>
            </a>
            <Link to="/contact" className="secondary-pill-btn">
              <span>Counseling & Inquiries</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
