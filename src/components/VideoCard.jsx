import { useState, useEffect } from 'react';
import { Play, ExternalLink, Calendar, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { extractYouTubeVideoId } from '../services/youtubeSync';
import './VideoCard.css';

export default function VideoCard({ video }) {
  const { recordVideoClick } = useData();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  if (!video) return null;

  const videoId = extractYouTubeVideoId(video.youtube_url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;

  useEffect(() => {
    if (!isPlayerOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsPlayerOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPlayerOpen]);

  const handleOpenPlayer = (e) => {
    e.preventDefault();
    if (recordVideoClick) recordVideoClick(video.id);
    if (embedUrl) {
      setIsPlayerOpen(true);
    } else if (video.youtube_url) {
      window.open(video.youtube_url, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedDate = new Date(video.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      <div className="video-card">
        <button
          type="button"
          onClick={handleOpenPlayer}
          className="video-thumb-container video-trigger-btn"
          aria-label={`Play ${video.title}`}
        >
          <img
            src={video.thumbnail_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
            alt={video.title}
            className="video-thumb"
          />
          <div className="play-overlay">
            <div className="play-btn">
              <Play size={22} fill="#ffffff" color="#ffffff" />
            </div>
          </div>
        </button>

        <div className="video-info">
          <div className="video-meta">
            <span className="video-date">
              <Calendar size={13} />
              {formattedDate}
            </span>
            <span className="platform-tag">The Sent TV</span>
          </div>

          <h3 className="video-title">
            <button type="button" onClick={handleOpenPlayer} className="video-title-trigger">
              {video.title}
            </button>
          </h3>

          {video.description && (
            <p className="video-desc">{video.description}</p>
          )}

          <button
            type="button"
            onClick={handleOpenPlayer}
            className="watch-link video-watch-btn"
          >
            <Play size={14} />
            <span>Watch Teaching Here</span>
          </button>
        </div>
      </div>

      {/* In-Website Modal Video Player */}
      {isPlayerOpen && embedUrl && (
        <div
          className="video-modal-backdrop"
          onClick={() => setIsPlayerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <div className="video-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <div>
                <span className="video-modal-eyebrow">The Sent TV • Graced Relationship Recipes</span>
                <h4>{video.title}</h4>
              </div>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setIsPlayerOpen(false)}
                aria-label="Close video player"
              >
                <X size={20} />
              </button>
            </div>

            <div className="video-embed-frame">
              <iframe
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="video-modal-footer">
              {video.description && (
                <p className="video-modal-desc">{video.description}</p>
              )}
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-youtube-ext-link"
              >
                <span>Open on YouTube to Subscribe / Comment</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
