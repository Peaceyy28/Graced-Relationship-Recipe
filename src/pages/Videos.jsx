import { useState } from 'react';
import { Search, ExternalLink, Play } from 'lucide-react';
import YoutubeIcon from '../components/YoutubeIcon';
import { useData } from '../context/DataContext';
import VideoCard from '../components/VideoCard';
import './Videos.css';

export default function Videos() {
  const { videos, settings } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(v => {
    const q = searchQuery.toLowerCase();
    return v.title.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q));
  });

  return (
    <div className="videos-page">
      {/* Header Banner */}
      <section className="videos-header-banner">
        <div className="videos-header-container">
          <div className="videos-badge">
            <YoutubeIcon size={16} />
            <span>YouTube Teachings & Discussions</span>
          </div>
          <h1>Video Teachings</h1>
          <p>
            Watch insightful, biblically grounded teachings on communication, marriage, courtship, and emotional wellness.
          </p>

          <div className="videos-channel-cta">
            <a 
              href={settings.youtube_channel_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="subscribe-banner-btn"
            >
              <YoutubeIcon size={20} />
              <span>Subscribe to The Sent TV (@THESENT_TV) on YouTube</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="videos-content-container">
        {/* Search */}
        <div className="videos-toolbar">
          <div className="video-search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search videos by title or topic..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="video-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-btn">
                ✕
              </button>
            )}
          </div>
          <span className="video-count">{filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}</span>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="videos-empty" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <YoutubeIcon size={44} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.6rem' }}>
              The Sent TV Video Library
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
              Our collection of relationship lessons, drama ministry films, and spiritual counseling videos is currently being uploaded. Visit our official YouTube channel to stream directly!
            </p>
            <a 
              href={settings.youtube_channel_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="subscribe-banner-btn"
              style={{ display: 'inline-flex' }}
            >
              <YoutubeIcon size={18} />
              <span>Visit @THESENT_TV on YouTube</span>
            </a>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="videos-empty">
            <p>No video teachings found matching "{searchQuery}".</p>
            <button onClick={() => setSearchQuery('')} className="reset-btn">
              View All Videos
            </button>
          </div>
        ) : (
          <div className="videos-grid-page">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
