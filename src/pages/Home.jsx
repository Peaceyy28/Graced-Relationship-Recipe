import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Video, Heart, Sparkles, Calendar, Quote, Compass } from 'lucide-react';
import { useData } from '../context/DataContext';
import WordCard from '../components/WordCard';
import VideoCard from '../components/VideoCard';
import YoutubeIcon from '../components/YoutubeIcon';
import WisdomTicker from '../components/WisdomTicker';
import DailyExerciseCard from '../components/DailyExerciseCard';
import './Home.css';

export default function Home() {
  const { latestPost, publishedPosts, videos, settings } = useData();
  const [selectedTopic, setSelectedTopic] = useState('All');

  const topics = ['All', 'True Love', 'Helpmeet', 'Chastity', 'Restoration'];

  const filteredArchive = publishedPosts.filter(post => {
    if (selectedTopic === 'All') return true;
    const term = selectedTopic.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.scripture.toLowerCase().includes(term)
    );
  });

  const latestVideos = videos.slice(0, 3);
  const recentPosts = filteredArchive.slice(0, 3);

  return (
    <div className="home-page">
      {/* Modern Asymmetrical Editorial Hero */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Column: Mission & Statement */}
            <div className="hero-text-col">
              <div className="live-status-pill">
                <span className="live-dot"></span>
                <span>Biblical Relationship Wisdom & Daily Grace</span>
              </div>

              <h1 className="hero-title">
                Recipes for a God-honoring, thriving love.
              </h1>

              <p className="hero-subtitle">
                Welcome to Graced Relationship Recipes. Daily scripture-backed teachings, 
                devotionals, and video wisdom to strengthen your courtship, marriage, 
                and family life.
              </p>

              <div className="hero-actions">
                <Link to="/word-for-the-day" className="btn-primary">
                  <span>Read Today's Word</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/videos" className="btn-secondary">
                  <Video size={16} />
                  <span>Watch Videos</span>
                </Link>
              </div>

              <div className="hero-trust-bar">
                <div className="trust-item">
                  <strong>Daily</strong>
                  <span>Devotionals</span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <strong>Scripture</strong>
                  <span>First</span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <strong>YouTube</strong>
                  <span>Teachings</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Card with Floating Accent */}
            <div className="hero-card-col">
              {latestPost ? (
                <div className="hero-feature-preview">
                  <div className="floating-seal" aria-hidden="true">
                    <span>✦</span>
                  </div>

                  <div className="preview-badge-row">
                    <span className="preview-tag">Today's Word of the Day</span>
                    <span className="preview-date">
                      <Calendar size={13} />
                      {new Date(latestPost.published_at || latestPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="preview-title">
                    <Link to={`/word/${latestPost.id}`}>{latestPost.title}</Link>
                  </h3>

                  <div className="preview-scripture-quote">
                    <Quote size={18} className="quote-mark" />
                    <p>"{latestPost.scripture}"</p>
                    <span className="preview-ref">— {latestPost.scripture_reference}</span>
                  </div>

                  <Link to={`/word/${latestPost.id}`} className="preview-read-btn">
                    <span>Read Full Reflection</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="hero-feature-preview empty">
                  <p>Welcome to Graced Relationship Recipes. Check back daily for new words.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Editorial Ticker */}
      <WisdomTicker />

      {/* Featured Deep-Dive Section */}
      {latestPost && (
        <section className="featured-section">
          <div className="section-container">
            <div className="section-meta-row">
              <div>
                <span className="editorial-eyebrow">Featured Devotional</span>
                <h2 className="section-title">Deep Dive of the Day</h2>
              </div>
              <Link to="/word-for-the-day" className="editorial-view-all">
                <span>Explore all devotionals</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <WordCard post={latestPost} featured={true} />
          </div>
        </section>
      )}

      {/* Daily Interactive Exercise & Streak Section */}
      <section className="daily-exercise-section">
        <div className="section-container">
          <div className="section-meta-row">
            <div>
              <span className="editorial-eyebrow">Interactive Growth</span>
              <h2 className="section-title">Today's Grace Exercise</h2>
            </div>
            <Link to="/daily-exercise" className="editorial-view-all">
              <span>Dedicated exercise room</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <DailyExerciseCard />
        </div>
      </section>

      {/* Interactive Topics & Archive Highlights */}
      <section className="recent-posts-section">
        <div className="section-container">
          <div className="section-meta-row">
            <div>
              <span className="editorial-eyebrow">Explore by Topic</span>
              <h2 className="section-title">Wisdom for Every Season</h2>
            </div>
            <Link to="/word-for-the-day" className="editorial-view-all">
              <span>View full archive</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Creative Interactive Topic Filter Pills */}
          <div className="topic-filter-pills-row">
            {topics.map(topic => (
              <button 
                key={topic}
                className={`topic-filter-btn ${selectedTopic === topic ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="posts-grid">
            {recentPosts.length > 0 ? (
              recentPosts.map(post => (
                <WordCard key={post.id} post={post} />
              ))
            ) : (
              <div className="no-topic-results">
                <p>No messages found under "{selectedTopic}".</p>
                <button onClick={() => setSelectedTopic('All')} className="reset-topic-btn">
                  Show all messages
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest YouTube Videos Showcase */}
      <section className="videos-section">
        <div className="section-container">
          <div className="section-meta-row">
            <div>
              <span className="editorial-eyebrow">Watch & Grow</span>
              <h2 className="section-title">Video Teachings</h2>
            </div>
            <a 
              href={settings.youtube_channel_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="youtube-badge-btn"
            >
              <YoutubeIcon size={16} />
              <span>YouTube Channel</span>
            </a>
          </div>

          <div className="videos-grid">
            {latestVideos.length > 0 ? (
              latestVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))
            ) : (
              <div className="empty-videos-banner" style={{ gridColumn: '1 / -1', padding: '3.5rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <YoutubeIcon size={44} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '0.6rem' }}>The Sent TV Video Ministry</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  Faith-based movies, drama productions, and relationship counseling episodes are being uploaded. Subscribe on YouTube to be notified as soon as new videos premier!
                </p>
                <a href={settings.youtube_channel_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex' }}>
                  <YoutubeIcon size={16} />
                  <span>Subscribe on YouTube (@THESENT_TV)</span>
                </a>
              </div>
            )}
          </div>

          <div className="center-cta-wrap">
            <Link to="/videos" className="btn-outline-wide">
              <span>View Video Library</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Creative Mission Card */}
      <section className="mission-banner-section">
        <div className="section-container">
          <div className="mission-card">
            <div className="mission-content">
              <span className="mission-pill">Our Calling</span>
              <h2>Building families that reflect God's steadfast grace.</h2>
              <p>
                Relationships thrive when partners cultivate intentional patience, 
                honest vulnerability, and daily forgiveness. We are here to provide 
                sound biblical recipes for every season of your journey.
              </p>
              <Link to="/about" className="btn-light">
                <span>Read our story</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
