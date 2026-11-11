import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Download, Copy, Check, Share2, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  EDITORIAL_THEMES,
  buildPostShareCaption,
  renderEditorialGraphicToCanvas
} from '../utils/graphicGenerator';
import './ShareGraphicModal.css';

export default function ShareGraphicModal({ isOpen, onClose, post }) {
  const { settings, recordScriptureShare } = useData();
  const canvasRef = useRef(null);

  const [themeKey, setThemeKey] = useState('linen');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const baseUrl = useMemo(() => {
    if (settings?.public_website_url) return settings.public_website_url.replace(/\/+$/, '');
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://gracedrelationships.vercel.app';
  }, [settings]);

  const domainLabel = useMemo(() => {
    try {
      return new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`).host;
    } catch {
      return 'gracedrelationships.vercel.app';
    }
  }, [baseUrl]);

  const shareCaption = useMemo(() => {
    return buildPostShareCaption(post, baseUrl);
  }, [post, baseUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !post) return;
    let cancelled = false;
    renderEditorialGraphicToCanvas({
      canvas: canvasRef.current,
      contentType: 'post',
      post,
      aspectRatio: 'portrait',
      themeKey,
      domainLabel,
      isCancelled: () => cancelled
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, post, themeKey, domainLabel]);

  if (!isOpen || !post) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      if (recordScriptureShare) recordScriptureShare(post.id);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const slug = (post.title || 'word').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28);
      link.download = `graced-${slug}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch {
      alert('Unable to download image on this browser.');
    }
  };

  const handleCopyCaptionAndLink = () => {
    if (recordScriptureShare) recordScriptureShare(post.id);
    navigator.clipboard.writeText(shareCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShareWithGraphic = () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;
    if (recordScriptureShare) recordScriptureShare(post.id);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'graced-word-for-the-day.png', { type: 'image/png' });
      const postUrl = `${baseUrl}/word/${post.id}`;
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: post.title,
            text: shareCaption,
            url: postUrl
          });
        } else {
          await navigator.share({
            title: post.title,
            text: shareCaption,
            url: postUrl
          });
        }
      } catch {
        // user dismissed native share dialog
      }
    }, 'image/png');
  };

  const handleWhatsAppShare = () => {
    if (recordScriptureShare) recordScriptureShare(post.id);
    window.open(`https://wa.me/?text=${encodeURIComponent(shareCaption)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="share-graphic-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share Word Graphic and Link"
    >
      <div className="share-graphic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div>
            <span className="share-modal-eyebrow">Share This Word</span>
            <h3>Graphic & Direct Link Ready</h3>
          </div>
          <button type="button" className="share-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="share-modal-body">
          {/* Left: Generated Graphic */}
          <div className="share-canvas-col">
            <div className="share-theme-pills">
              {Object.values(EDITORIAL_THEMES).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`share-theme-pill ${themeKey === t.id ? 'active' : ''}`}
                  onClick={() => setThemeKey(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="share-canvas-frame">
              <canvas ref={canvasRef} className="share-preview-canvas" />
            </div>
          </div>

          {/* Right: Attached Caption + Actions */}
          <div className="share-actions-col">
            <label className="share-caption-label">Attached Message & Website Link</label>
            <textarea
              readOnly
              rows={7}
              value={shareCaption}
              className="share-caption-preview"
            />

            <div className="share-btn-stack">
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShareWithGraphic}
                  className="share-action-primary"
                >
                  <Share2 size={17} />
                  <span>Share Graphic + Link</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className={typeof navigator !== 'undefined' && navigator.share ? 'share-action-secondary' : 'share-action-primary'}
              >
                {downloaded ? <Check size={17} /> : <Download size={17} />}
                <span>{downloaded ? 'Graphic Saved!' : 'Download Graphic (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaptionAndLink}
                className={`share-action-secondary ${copied ? 'copied' : ''}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Message & Link Copied!' : 'Copy Caption & Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="share-action-whatsapp"
              >
                <Send size={16} />
                <span>Send Link to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
