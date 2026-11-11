import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, Quote, Share2, Heart } from 'lucide-react';
import { useData } from '../context/DataContext';
import ShareGraphicModal from '../components/ShareGraphicModal';
import './WordDetail.css';

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, recordPostView } = useData();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const post = posts.find(p => p.id === id);

  useEffect(() => {
    if (id) {
      recordPostView(id);
    }
  }, [id]);

  if (!post) {
    return (
      <div className="word-detail-container not-found">
        <h2>Message Not Found</h2>
        <p>The devotional you are looking for may have been moved or removed.</p>
        <Link to="/word-for-the-day" className="back-btn">
          <ArrowLeft size={16} />
          <span>Back to Archive</span>
        </Link>
      </div>
    );
  }

  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const handleShare = () => {
    setIsShareOpen(true);
  };

  return (
    <div className="word-detail-page">
      <div className="word-detail-container">
        {/* Navigation Bar */}
        <div className="detail-top-nav">
          <button onClick={() => navigate(-1)} className="back-link-btn">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <button onClick={handleShare} className="share-btn">
            <Share2 size={16} />
            <span>Share Message</span>
          </button>
        </div>

        {/* Main Article */}
        <article className="detail-article">
          <header className="detail-header">
            <div className="detail-meta">
              <span className="detail-date">
                <Calendar size={15} />
                {formattedDate}
              </span>
              {post.status === 'draft' && (
                <span className="draft-badge">Draft Preview</span>
              )}
            </div>

            <h1 className="detail-title">{post.title}</h1>
          </header>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="detail-image-box">
              <img src={post.cover_image} alt={post.title} className="detail-cover-img" />
            </div>
          )}

          {/* Scripture Callout */}
          <div className="detail-scripture-callout">
            <Quote size={28} className="detail-quote-icon" />
            <p className="detail-verse-text">"{post.scripture}"</p>
            <div className="detail-verse-ref">
              <BookOpen size={16} />
              <span>{post.scripture_reference}</span>
            </div>
          </div>

          {/* Detailed Write-up Body with Full Line-Break Preservation */}
          <div className="detail-body">
            {post.content.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index} className="detail-paragraph">
                {paragraph.split('\n').map((line, lineIdx) => (
                  <span key={lineIdx}>
                    {line}
                    {lineIdx < paragraph.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {/* Blessing Footer */}
          <div className="detail-blessing-card">
            <Heart size={24} className="blessing-icon" />
            <h3>May This Word Bless Your Home Today</h3>
            <p>
              Take a moment to reflect on this truth, pray together, and intentionally extend grace to the ones you love.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleShare} className="share-btn" style={{ backgroundColor: 'var(--brand-primary)', color: '#fff', borderColor: 'var(--brand-primary)' }}>
                <Share2 size={16} />
                <span>Share Graphic & Link</span>
              </button>
              <Link to="/word-for-the-day" className="explore-more-btn">
                Explore More Messages
              </Link>
            </div>
          </div>
        </article>
      </div>

      <ShareGraphicModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        post={post}
      />
    </div>
  );
}
