import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Download, Copy, Check, Share2, BookOpen,
  Video as VideoIcon, Smartphone, Square, RectangleVertical, Palette, Send, Globe
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  EDITORIAL_THEMES,
  buildPostShareCaption,
  buildVideoShareCaption,
  renderEditorialGraphicToCanvas
} from '../../utils/graphicGenerator';
import './Admin.css';

export default function AdminShareStudio() {
  const { publishedPosts, posts, videos, settings, updateSettings } = useData();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);

  const availablePosts = publishedPosts.length > 0 ? publishedPosts : posts;

  const [contentType, setContentType] = useState(() => {
    return searchParams.get('type') === 'video' ? 'video' : 'post';
  });

  const [selectedPostId, setSelectedPostId] = useState(() => {
    const paramId = searchParams.get('id');
    if (searchParams.get('type') !== 'video' && paramId) return paramId;
    return availablePosts[0]?.id || '';
  });

  const [selectedVideoId, setSelectedVideoId] = useState(() => {
    const paramId = searchParams.get('id');
    if (searchParams.get('type') === 'video' && paramId) return paramId;
    return videos[0]?.id || '';
  });

  const [aspectRatio, setAspectRatio] = useState('portrait');
  const [themeKey, setThemeKey] = useState('linen');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const defaultOrigin = useMemo(() => {
    if (settings?.public_website_url) return settings.public_website_url.replace(/\/+$/, '');
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    return 'https://gracedrelationships.vercel.app';
  }, [settings?.public_website_url]);

  const [websiteBaseUrl, setWebsiteBaseUrl] = useState(defaultOrigin);
  const [captionEdits, setCaptionEdits] = useState({});

  const selectedPost = useMemo(
    () => availablePosts.find(p => p.id === selectedPostId) || availablePosts[0] || null,
    [availablePosts, selectedPostId]
  );

  const selectedVideo = useMemo(
    () => videos.find(v => v.id === selectedVideoId) || videos[0] || null,
    [videos, selectedVideoId]
  );

  const cleanDomainLabel = useMemo(() => {
    try {
      return new URL(websiteBaseUrl.startsWith('http') ? websiteBaseUrl : `https://${websiteBaseUrl}`).host;
    } catch {
      return 'gracedrelationships.vercel.app';
    }
  }, [websiteBaseUrl]);

  const cleanBaseUrl = websiteBaseUrl.trim().replace(/\/+$/, '');
  const activeItemKey = `${contentType}-${contentType === 'post' ? selectedPost?.id : selectedVideo?.id}-${cleanBaseUrl}`;

  const generatedCaption = useMemo(() => {
    if (contentType === 'post') return buildPostShareCaption(selectedPost, cleanBaseUrl);
    if (contentType === 'video') return buildVideoShareCaption(selectedVideo, cleanBaseUrl);
    return '';
  }, [contentType, selectedPost, selectedVideo, cleanBaseUrl]);

  const customCaption = captionEdits[activeItemKey] ?? generatedCaption;

  const handleSaveWebsiteUrl = () => {
    if (websiteBaseUrl.trim()) {
      updateSettings({ public_website_url: websiteBaseUrl.trim().replace(/\/+$/, '') });
    }
  };

  useEffect(() => {
    let cancelled = false;
    renderEditorialGraphicToCanvas({
      canvas: canvasRef.current,
      contentType,
      post: selectedPost,
      video: selectedVideo,
      aspectRatio,
      themeKey,
      domainLabel: cleanDomainLabel,
      isCancelled: () => cancelled
    });
    return () => {
      cancelled = true;
    };
  }, [contentType, selectedPost, selectedVideo, aspectRatio, themeKey, cleanDomainLabel]);

  const handleDownloadGraphic = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const slug = contentType === 'post'
        ? `word-${(selectedPost?.title || 'daily').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`
        : `video-${(selectedVideo?.title || 'teaching').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`;
      link.download = `graced-${slug}-${aspectRatio}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      alert('Unable to export image. Please try again.');
    }
  };

  const handleMobileShareAll = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'graced-daily-graphic.png', { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Graced Relationship Recipes',
            text: customCaption
          });
        } else {
          await navigator.share({
            title: 'Graced Relationship Recipes',
            text: customCaption
          });
        }
      } catch {
        // share dismissed
      }
    }, 'image/png');
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(customCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(customCaption);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="admin-page-view">
      <div className="page-header">
        <div>
          <h2>Daily Graphics & Caption Studio</h2>
          <p>Soft, human-crafted editorial templates & ready-to-post captions with direct website links.</p>
        </div>
      </div>

      <div className="studio-layout">
        <div className="admin-card studio-preview-card">
          <div className="studio-tabs-row">
            <button
              type="button"
              className={`studio-tab-btn ${contentType === 'post' ? 'active' : ''}`}
              onClick={() => setContentType('post')}
            >
              <BookOpen size={16} />
              <span>Word for the Day Graphic</span>
            </button>
            <button
              type="button"
              className={`studio-tab-btn ${contentType === 'video' ? 'active' : ''}`}
              onClick={() => setContentType('video')}
            >
              <VideoIcon size={16} />
              <span>YouTube Video Flyer</span>
            </button>
          </div>

          <div className="studio-controls-grid">
            <div className="form-group">
              <label>{contentType === 'post' ? 'Select Devotional Message' : 'Select YouTube Teaching'}</label>
              {contentType === 'post' ? (
                <select
                  value={selectedPost?.id || ''}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                >
                  {availablePosts.map(post => (
                    <option key={post.id} value={post.id}>
                      {post.title} ({post.scripture_reference})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedVideo?.id || ''}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                >
                  {videos.map(vid => (
                    <option key={vid.id} value={vid.id}>
                      {vid.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="studio-options-row">
              <div className="studio-option-group">
                <label>Size Format</label>
                <div className="pill-toggle-group">
                  <button
                    type="button"
                    className={`pill-toggle-btn ${aspectRatio === 'portrait' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('portrait')}
                  >
                    <RectangleVertical size={14} />
                    <span>IG Portrait (4:5)</span>
                  </button>
                  <button
                    type="button"
                    className={`pill-toggle-btn ${aspectRatio === 'square' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('square')}
                  >
                    <Square size={14} />
                    <span>Feed (1:1)</span>
                  </button>
                  <button
                    type="button"
                    className={`pill-toggle-btn ${aspectRatio === 'status' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('status')}
                  >
                    <Smartphone size={14} />
                    <span>Status (9:16)</span>
                  </button>
                </div>
              </div>

              <div className="studio-option-group">
                <label><Palette size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Editorial Palette</label>
                <div className="pill-toggle-group">
                  {Object.values(EDITORIAL_THEMES).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`pill-toggle-btn ${themeKey === t.id ? 'active' : ''}`}
                      onClick={() => setThemeKey(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`canvas-preview-stage ${aspectRatio}`}>
            <canvas ref={canvasRef} className="studio-canvas-element" />
          </div>

          <div className="studio-export-actions">
            <button
              type="button"
              onClick={handleDownloadGraphic}
              className="admin-primary-btn"
            >
              {downloadSuccess ? <Check size={17} /> : <Download size={17} />}
              <span>{downloadSuccess ? 'Graphic Downloaded!' : 'Download High-Res Graphic (PNG)'}</span>
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                type="button"
                onClick={handleMobileShareAll}
                className="admin-secondary-btn"
              >
                <Share2 size={17} />
                <span>Share Graphic + Caption</span>
              </button>
            )}
          </div>
        </div>

        <div className="admin-card studio-caption-card">
          <div className="card-header-flex">
            <div>
              <h3><Sparkles size={18} style={{ verticalAlign: 'middle', color: '#7e22ce', marginRight: 6 }} />Ready-to-Post Caption</h3>
              <span className="subtext">Includes scripture, hook & direct link back to your Sanctuary</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={13} color="#7e22ce" />
              <span>Website Link Used in Captions (No Localhost)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                value={websiteBaseUrl}
                onChange={(e) => setWebsiteBaseUrl(e.target.value)}
                onBlur={handleSaveWebsiteUrl}
                placeholder="https://gracedrelationships.vercel.app"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div className="caption-editor-wrap">
            <textarea
              className="caption-textarea"
              rows={12}
              value={customCaption}
              onChange={(e) => setCaptionEdits(prev => ({ ...prev, [activeItemKey]: e.target.value }))}
            />
          </div>

          <div className="caption-actions-stack">
            <button
              type="button"
              onClick={handleCopyCaption}
              className={`copy-caption-btn ${copiedCaption ? 'copied' : ''}`}
            >
              {copiedCaption ? <Check size={17} /> : <Copy size={17} />}
              <span>{copiedCaption ? 'Caption & Link Copied!' : 'Copy Caption with Website Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="whatsapp-share-btn"
            >
              <Send size={16} />
              <span>Send Caption Directly to WhatsApp</span>
            </button>
          </div>

          <div className="morning-workflow-tip">
            <strong>Daily Morning Routine (30 Seconds):</strong>
            <ol>
              <li>Download the generated graphic above.</li>
              <li>Click <strong>Copy Caption with Website Link</strong>.</li>
              <li>Post on WhatsApp Status, Instagram, or Facebook so readers click right back to your full Word!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
