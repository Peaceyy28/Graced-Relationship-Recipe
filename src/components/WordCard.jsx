import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, ArrowRight, Quote, Clock, Copy, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import './WordCard.css';

export default function WordCard({ post, featured = false }) {
  const [copied, setCopied] = useState(false);
  const { recordScriptureShare } = useData();

  if (!post) return null;

  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  const wordCount = post.content ? post.content.split(/\s+/).length : 200;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));

  const handleCopyScripture = (e) => {
    e.preventDefault();
    e.stopPropagation();
    recordScriptureShare(post.id);
    const shareText = `"${post.scripture}" — ${post.scripture_reference}\n\nRead today's word on Graced Relationship Recipes: ${window.location.origin}/word/${post.id}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (featured) {
    return (
      <article className="featured-word-card">
        {post.cover_image && (
          <div className="featured-image-wrapper">
            <img src={post.cover_image} alt={post.title} className="featured-cover" />
            <div className="featured-badge">Featured Word of the Day</div>
          </div>
        )}
        <div className="featured-content">
          <div className="word-meta-row">
            <span className="word-date">
              <Calendar size={13} />
              {formattedDate}
            </span>
            <span className="read-time-pill">
              <Clock size={12} />
              {readTime} min read
            </span>
          </div>

          <h2 className="featured-title">
            <Link to={`/word/${post.id}`}>{post.title}</Link>
          </h2>

          <div className="scripture-box">
            <span className="decorative-quote-mark" aria-hidden="true">“</span>
            <p className="scripture-text">"{post.scripture}"</p>
            <div className="scripture-footer-row">
              <span className="scripture-ref">— {post.scripture_reference}</span>
              <button 
                onClick={handleCopyScripture} 
                className={`copy-verse-btn ${copied ? 'copied' : ''}`}
                title="Copy scripture for WhatsApp or status"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied Verse!' : 'Copy Verse'}</span>
              </button>
            </div>
          </div>

          <p className="word-excerpt">
            {post.content.length > 220 
              ? `${post.content.substring(0, 220)}...` 
              : post.content}
          </p>

          <Link to={`/word/${post.id}`} className="read-more-btn">
            <span>Read Full Devotional</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  // Standard Archive Card
  return (
    <article className="word-card">
      {post.cover_image && (
        <div className="card-thumb-wrapper">
          <img src={post.cover_image} alt={post.title} className="card-thumb" />
          <span className="thumb-read-time">{readTime} min read</span>
        </div>
      )}
      <div className="card-body">
        <div className="word-meta-row">
          <span className="word-date">
            <Calendar size={13} />
            {formattedDate}
          </span>
          <span className="card-ref-badge">
            <BookOpen size={12} />
            {post.scripture_reference.split(' ')[0]}
          </span>
        </div>

        <h3 className="card-title">
          <Link to={`/word/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="card-excerpt">
          {post.content.length > 130 
            ? `${post.content.substring(0, 130)}...` 
            : post.content}
        </p>

        <div className="card-bottom-row">
          <Link to={`/word/${post.id}`} className="card-link">
            <span>Read Message</span>
            <ArrowRight size={14} />
          </Link>

          <button 
            onClick={handleCopyScripture} 
            className="card-mini-copy"
            title="Copy scripture"
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          </button>
        </div>
      </div>
    </article>
  );
}
