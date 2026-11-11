import { Play, ExternalLink, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import './VideoCard.css';

export default function VideoCard({ video }) {
  const { recordVideoClick } = useData();
  if (!video) return null;

  const handleVideoClick = () => {
    if (recordVideoClick) recordVideoClick(video.id);
  };

  const formattedDate = new Date(video.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="video-card">
      <a 
        href={video.youtube_url} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleVideoClick} 
        className="video-thumb-container"
        aria-label={`Watch ${video.title} on YouTube`}
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
      </a>

      <div className="video-info">
        <div className="video-meta">
          <span className="video-date">
            <Calendar size={13} />
            {formattedDate}
          </span>
          <span className="platform-tag">YouTube</span>
        </div>

        <h3 className="video-title">
          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
        onClick={handleVideoClick}>
            {video.title}
          </a>
        </h3>

        {video.description && (
          <p className="video-desc">{video.description}</p>
        )}

        <a 
          href={video.youtube_url} 
          target="_blank" 
          rel="noopener noreferrer"
        onClick={handleVideoClick} 
          className="watch-link"
        >
          <span>Watch on YouTube</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
