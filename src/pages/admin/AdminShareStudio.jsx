import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Download, Copy, Check, Share2, BookOpen,
  Video as VideoIcon, Smartphone, Square, Palette, Send
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './Admin.css';

const THEMES = {
  velvet: {
    id: 'velvet',
    name: 'Royal Velvet',
    bgStart: '#2e1065',
    bgEnd: '#581c87',
    cardBg: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    eyebrowBg: 'rgba(245, 158, 11, 0.18)',
    eyebrowText: '#fcd34d',
    titleColor: '#ffffff',
    scriptureBg: 'rgba(255, 255, 255, 0.1)',
    scriptureText: '#fef3c7',
    bodyText: '#e9d5ff',
    footerBg: 'rgba(0, 0, 0, 0.25)',
    footerText: '#ffffff',
    accent: '#f59e0b'
  },
  ivory: {
    id: 'ivory',
    name: 'Editorial Ivory',
    bgStart: '#fdfbf7',
    bgEnd: '#f5f0e6',
    cardBg: '#ffffff',
    borderColor: 'rgba(126, 34, 206, 0.25)',
    eyebrowBg: '#f3e8ff',
    eyebrowText: '#6b21a8',
    titleColor: '#1e1b4b',
    scriptureBg: '#faf5ff',
    scriptureText: '#581c87',
    bodyText: '#4c1d95',
    footerBg: '#581c87',
    footerText: '#ffffff',
    accent: '#b45309'
  },
  radiant: {
    id: 'radiant',
    name: 'Radiant Lavender',
    bgStart: '#f5f3ff',
    bgEnd: '#ede9fe',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    eyebrowBg: '#581c87',
    eyebrowText: '#ffffff',
    titleColor: '#3b0764',
    scriptureBg: '#ffffff',
    scriptureText: '#6b21a8',
    bodyText: '#4c1d95',
    footerBg: '#3b0764',
    footerText: '#fef3c7',
    accent: '#7e22ce'
  }
};

// Canvas word-wrap helper returning drawn lines array
function getWrappedLines(ctx, text, maxWidth, maxLines = 6) {
  if (!text) return [];
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
      if (lines.length >= maxLines) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  // Add ellipsis if truncated
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length + 2) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:\s]*$/, '') + '...';
  }
  return lines;
}

// Rounded rect helper
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function AdminShareStudio() {
  const { publishedPosts, posts, videos } = useData();
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

  const [aspectRatio, setAspectRatio] = useState('square'); // 'square' (1080x1080) | 'status' (1080x1920)
  const [themeKey, setThemeKey] = useState('velvet');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [customCaption, setCustomCaption] = useState('');

  const selectedPost = useMemo(
    () => availablePosts.find(p => p.id === selectedPostId) || availablePosts[0] || null,
    [availablePosts, selectedPostId]
  );

  const selectedVideo = useMemo(
    () => videos.find(v => v.id === selectedVideoId) || videos[0] || null,
    [videos, selectedVideoId]
  );

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://gracedrelationships.com';
  const displayDomain = typeof window !== 'undefined' ? window.location.host : 'gracedrelationships.com';

  // Generate default high-converting social caption whenever selection changes
  const generatedCaption = useMemo(() => {
    if (contentType === 'post' && selectedPost) {
      const cleanContent = (selectedPost.content || '')
        .replace(/[#*_`]/g, '')
        .split(/\n+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(' ')
        .trim();
      const hook = cleanContent.length > 165 ? `${cleanContent.slice(0, 162).trim()}...` : cleanContent;

      return `🌅 *WORD FOR THE DAY* ✨\n*${selectedPost.title}*\n\n📖 _"${selectedPost.scripture}"_\n— *${selectedPost.scripture_reference}*\n\n${hook}\n\n👇 Read the complete teaching & reflection on our Sanctuary:\n🔗 ${siteOrigin}/word/${selectedPost.id}\n\n#GracedRelationshipRecipes #WordForTheDay #GodlyRelationships #TheSentTV`;
    }

    if (contentType === 'video' && selectedVideo) {
      const desc = (selectedVideo.description || 'Watch this life-changing relationship wisdom teaching from The Sent TV.').trim();
      return `🎬 *NEW TEACHING ON THE SENT TV* 🔥\n*${selectedVideo.title}*\n\n${desc}\n\n👇 Watch the complete message on our Sanctuary:\n🔗 ${siteOrigin}/videos\n\n📺 YouTube Direct Link:\n${selectedVideo.youtube_url}\n\n#TheSentTV #GracedRelationshipRecipes #ChristianRelationships #YouthMinistry`;
    }

    return '';
  }, [contentType, selectedPost, selectedVideo, siteOrigin]);

  useEffect(() => {
    setCustomCaption(generatedCaption);
  }, [generatedCaption]);

  // Render high-resolution graphic onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const theme = THEMES[themeKey] || THEMES.velvet;

    const width = 1080;
    const height = aspectRatio === 'square' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const isStatus = aspectRatio === 'status';

    const renderBaseAndText = (thumbImage = null) => {
      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, theme.bgStart);
      grad.addColorStop(1, theme.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle decorative glowing circles in background
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(width * 0.9, height * 0.12, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width * 0.1, height * 0.86, 310, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Outer Editorial Frame
      const pad = 54;
      drawRoundedRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 36);
      ctx.fillStyle = theme.cardBg;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = theme.borderColor;
      ctx.stroke();

      // Inner subtle gold hairline border
      drawRoundedRect(ctx, pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2, 26);
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.borderColor;
      ctx.stroke();

      const centerX = width / 2;
      let cursorY = isStatus ? 210 : 145;

      // 3. Eyebrow Badge Pill
      const badgeLabel = contentType === 'post' ? 'WORD FOR THE DAY' : 'THE SENT TV • VIDEO TEACHING';
      ctx.font = '700 22px "Inter", system-ui, sans-serif';
      const badgeW = ctx.measureText(badgeLabel).width + 64;
      const badgeH = 52;
      drawRoundedRect(ctx, centerX - badgeW / 2, cursorY, badgeW, badgeH, 26);
      ctx.fillStyle = theme.eyebrowBg;
      ctx.fill();

      ctx.fillStyle = theme.eyebrowText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeLabel, centerX, cursorY + badgeH / 2 + 1);

      cursorY += badgeH + (isStatus ? 75 : 46);

      if (contentType === 'post' && selectedPost) {
        // 4A. WORD FOR THE DAY GRAPHIC LAYOUT
        // Title
        ctx.fillStyle = theme.titleColor;
        ctx.font = isStatus
          ? '700 66px Georgia, "Times New Roman", serif'
          : '700 56px Georgia, "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const titleLines = getWrappedLines(ctx, selectedPost.title, width - 220, isStatus ? 4 : 3);
        const titleLineHeight = isStatus ? 82 : 70;
        titleLines.forEach((line) => {
          ctx.fillText(line, centerX, cursorY);
          cursorY += titleLineHeight;
        });

        // Decorative divider
        cursorY += 22;
        ctx.fillStyle = theme.accent;
        drawRoundedRect(ctx, centerX - 60, cursorY, 120, 5, 3);
        ctx.fill();
        cursorY += isStatus ? 65 : 42;

        // Scripture Box
        const boxW = width - 200;
        const boxX = 100;
        ctx.font = isStatus
          ? 'italic 36px Georgia, "Times New Roman", serif'
          : 'italic 31px Georgia, "Times New Roman", serif';

        const verseText = `"${selectedPost.scripture || ''}"`;
        const verseLines = getWrappedLines(ctx, verseText, boxW - 90, isStatus ? 8 : 5);
        const verseLineHeight = isStatus ? 52 : 44;
        const verseBoxHeight = verseLines.length * verseLineHeight + 130;

        drawRoundedRect(ctx, boxX, cursorY, boxW, verseBoxHeight, 24);
        ctx.fillStyle = theme.scriptureBg;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = theme.borderColor;
        ctx.stroke();

        // Verse lines
        let verseY = cursorY + 42;
        ctx.fillStyle = theme.scriptureText;
        ctx.textAlign = 'center';
        verseLines.forEach((line) => {
          ctx.fillText(line, centerX, verseY);
          verseY += verseLineHeight;
        });

        // Scripture Reference
        verseY += 16;
        ctx.font = '700 24px "Inter", system-ui, sans-serif';
        ctx.fillStyle = theme.accent;
        ctx.fillText(`— ${(selectedPost.scripture_reference || '').toUpperCase()}`, centerX, verseY);

        cursorY += verseBoxHeight + (isStatus ? 65 : 36);

        // Teaser CTA Note
        if (isStatus || height - cursorY > 250) {
          ctx.font = '500 26px "Inter", system-ui, sans-serif';
          ctx.fillStyle = theme.bodyText;
          const teaserNote = 'Read the complete devotional & reflection today.';
          ctx.fillText(teaserNote, centerX, cursorY);
        }
      } else if (contentType === 'video' && selectedVideo) {
        // 4B. YOUTUBE VIDEO PROMO GRAPHIC LAYOUT
        const frameW = width - 220;
        const frameH = Math.round(frameW * 9 / 16); // 16:9 thumbnail ratio
        const frameX = 110;

        // Thumbnail frame shadow & container
        ctx.save();
        drawRoundedRect(ctx, frameX, cursorY, frameW, frameH, 24);
        ctx.clip();

        if (thumbImage) {
          // Cover crop inside 16:9 box
          const imgRatio = thumbImage.width / thumbImage.height;
          const boxRatio = frameW / frameH;
          let drawW = frameW;
          let drawH = frameH;
          let offsetX = frameX;
          let offsetY = cursorY;

          if (imgRatio > boxRatio) {
            drawW = frameH * imgRatio;
            offsetX = frameX - (drawW - frameW) / 2;
          } else {
            drawH = frameW / imgRatio;
            offsetY = cursorY - (drawH - frameH) / 2;
          }
          ctx.drawImage(thumbImage, offsetX, offsetY, drawW, drawH);

          // Dark vignette for play icon pop
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fillRect(frameX, cursorY, frameW, frameH);
        } else {
          // Rich vector fallback if CORS prevents image pixel reading
          const thumbGrad = ctx.createLinearGradient(frameX, cursorY, frameX + frameW, cursorY + frameH);
          thumbGrad.addColorStop(0, '#4c1d95');
          thumbGrad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = thumbGrad;
          ctx.fillRect(frameX, cursorY, frameW, frameH);

          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.font = '700 44px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('THE SENT TV', centerX, cursorY + frameH / 2 + 85);
        }

        // Play Button Circle in center of frame
        const playR = 52;
        ctx.beginPath();
        ctx.arc(centerX, cursorY + frameH / 2, playR, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Play Triangle
        ctx.beginPath();
        ctx.moveTo(centerX - 14, cursorY + frameH / 2 - 22);
        ctx.lineTo(centerX + 26, cursorY + frameH / 2);
        ctx.lineTo(centerX - 14, cursorY + frameH / 2 + 22);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Frame border
        drawRoundedRect(ctx, frameX, cursorY, frameW, frameH, 24);
        ctx.lineWidth = 3;
        ctx.strokeStyle = theme.borderColor;
        ctx.stroke();

        cursorY += frameH + (isStatus ? 75 : 44);

        // Video Title
        ctx.fillStyle = theme.titleColor;
        ctx.font = isStatus
          ? '700 54px Georgia, "Times New Roman", serif'
          : '700 46px Georgia, "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const vidTitleLines = getWrappedLines(ctx, selectedVideo.title, width - 200, isStatus ? 4 : 3);
        const vidLineH = isStatus ? 68 : 58;
        vidTitleLines.forEach((line) => {
          ctx.fillText(line, centerX, cursorY);
          cursorY += vidLineH;
        });

        cursorY += 20;

        // Description Snippet
        if (selectedVideo.description) {
          ctx.font = '400 26px "Inter", system-ui, sans-serif';
          ctx.fillStyle = theme.bodyText;
          const descLines = getWrappedLines(ctx, selectedVideo.description, width - 220, isStatus ? 4 : 2);
          descLines.forEach((line) => {
            ctx.fillText(line, centerX, cursorY);
            cursorY += 36;
          });
        }
      }

      // 5. Footer CTA Banner inside Card
      const footerH = isStatus ? 180 : 145;
      const footerY = height - pad - 14 - footerH;
      const footerX = pad + 14;
      const footerW = width - (pad + 14) * 2;

      ctx.save();
      drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 22);
      ctx.fillStyle = theme.footerBg;
      ctx.fill();
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = theme.footerText;
      ctx.font = '700 28px Georgia, "Times New Roman", serif';
      ctx.fillText('GRACED RELATIONSHIP RECIPES', centerX, footerY + footerH * 0.34);

      ctx.fillStyle = theme.accent;
      ctx.font = '600 22px "Inter", system-ui, sans-serif';
      const ctaLabel = contentType === 'post'
        ? `Read complete Word in caption link • ${displayDomain}`
        : `Watch full teaching in caption link • ${displayDomain}`;
      ctx.fillText(ctaLabel, centerX, footerY + footerH * 0.68);
    };

    // Load thumbnail if video mode
    if (contentType === 'video' && selectedVideo?.thumbnail_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          renderBaseAndText(img);
          // Test if canvas gets tainted by external thumbnail
          canvas.toDataURL('image/png');
        } catch {
          // If tainted by CORS, re-render cleanly with vector emblem fallback
          renderBaseAndText(null);
        }
      };
      img.onerror = () => {
        renderBaseAndText(null);
      };
      img.src = selectedVideo.thumbnail_url;
    } else {
      renderBaseAndText(null);
    }
  }, [contentType, selectedPost, selectedVideo, aspectRatio, themeKey, displayDomain]);

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
      alert('Unable to export image. Please try another preset.');
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
        // user cancelled share
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
          <p>Generate branded morning flyers & auto-linked captions to drive daily traffic back to your website.</p>
        </div>
      </div>

      <div className="studio-layout">
        {/* Left Side: Controls & Canvas Preview */}
        <div className="admin-card studio-preview-card">
          {/* Source Selector Tabs */}
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

          {/* Content Dropdown */}
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

            {/* Format & Theme Selectors */}
            <div className="studio-options-row">
              <div className="studio-option-group">
                <label>Size Format</label>
                <div className="pill-toggle-group">
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
                <label><Palette size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Visual Theme</label>
                <div className="pill-toggle-group">
                  {Object.values(THEMES).map(t => (
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

          {/* Live Canvas Preview */}
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

        {/* Right Side: Auto-Generated Caption & Direct Link Box */}
        <div className="admin-card studio-caption-card">
          <div className="card-header-flex">
            <div>
              <h3><Sparkles size={18} style={{ verticalAlign: 'middle', color: '#7e22ce', marginRight: 6 }} />Ready-to-Post Caption</h3>
              <span className="subtext">Includes scripture, hook & direct link back to your Sanctuary</span>
            </div>
          </div>

          <div className="caption-editor-wrap">
            <textarea
              className="caption-textarea"
              rows={13}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
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
