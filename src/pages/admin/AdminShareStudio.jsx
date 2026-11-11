import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Download, Copy, Check, Share2, BookOpen,
  Video as VideoIcon, Smartphone, Square, RectangleVertical, Palette, Send, Globe
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import './Admin.css';

const EDITORIAL_THEMES = {
  linen: {
    id: 'linen',
    name: 'Alabaster Linen',
    bgStart: '#FBF8F3',
    bgEnd: '#F3ECE1',
    glowColor: 'rgba(255, 253, 249, 0.95)',
    borderColor: '#DDD2C2',
    eyebrowColor: '#8A7B6D',
    brandColor: '#4A3B31',
    titleColor: '#261E18',
    scriptureColor: '#4D4138',
    referenceColor: '#9C6644',
    accentColor: '#B08968',
    botanicalColor: '#7D8B74',
    footerLine: '#E2D8CA',
    footerText: '#6F6256',
    grainAlpha: 0.025
  },
  mauve: {
    id: 'mauve',
    name: 'Soft Dusk Mauve',
    bgStart: '#FDF9FB',
    bgEnd: '#F4ECF6',
    glowColor: 'rgba(255, 250, 255, 0.92)',
    borderColor: '#DECFE4',
    eyebrowColor: '#8B6D8E',
    brandColor: '#4A1D66',
    titleColor: '#2E1142',
    scriptureColor: '#4C3657',
    referenceColor: '#7E22CE',
    accentColor: '#C5A059',
    botanicalColor: '#9A7AA0',
    footerLine: '#E4D5EA',
    footerText: '#6C5375',
    grainAlpha: 0.022
  },
  velvet: {
    id: 'velvet',
    name: 'Velvet Evening',
    bgStart: '#2A123E',
    bgEnd: '#3F1B5C',
    glowColor: 'rgba(139, 92, 246, 0.16)',
    borderColor: 'rgba(229, 194, 122, 0.34)',
    eyebrowColor: '#D4B98C',
    brandColor: '#FAF4EA',
    titleColor: '#FFFFFF',
    scriptureColor: '#EAE1F2',
    referenceColor: '#E5C27A',
    accentColor: '#E5C27A',
    botanicalColor: '#D4B98C',
    footerLine: 'rgba(229, 194, 122, 0.22)',
    footerText: '#D9CBE6',
    grainAlpha: 0.03
  }
};

const FORMAT_DIMENSIONS = {
  portrait: { width: 1080, height: 1350, label: 'Portrait (4:5)' },
  square: { width: 1080, height: 1080, label: 'Square (1:1)' },
  status: { width: 1080, height: 1920, label: 'Status (9:16)' }
};

// Creates subtle organic paper grain tile (zero muddiness, ultra crisp)
function createGrainPattern(ctx, alpha = 0.025) {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const imgData = tctx.createImageData(128, 128);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const shade = Math.random() > 0.5 ? 255 : 0;
    data[i] = shade;
    data[i + 1] = shade;
    data[i + 2] = shade;
    data[i + 3] = Math.floor(Math.random() * 255 * alpha);
  }
  tctx.putImageData(imgData, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

// Draws crisp fine-art botanical olive sprig using clean vector Bezier curves
function drawBotanicalCorner(ctx, x, y, scale, rotationDeg, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 2.2;

  // Main delicate stem
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(45, 55, 95, 115, 165, 165);
  ctx.stroke();

  // Leaves along stem
  const leaves = [
    { lx: 35, ly: 42, angle: -0.7, len: 34 },
    { lx: 58, ly: 72, angle: 0.9, len: 36 },
    { lx: 85, ly: 100, angle: -0.6, len: 32 },
    { lx: 112, ly: 124, angle: 0.85, len: 30 },
    { lx: 140, ly: 146, angle: -0.5, len: 26 },
    { lx: 165, ly: 165, angle: 0.4, len: 24 }
  ];

  leaves.forEach(({ lx, ly, angle, len }) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.35, len, 0);
    ctx.quadraticCurveTo(len * 0.5, len * 0.35, 0, 0);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

// Word-wrap helper with clean ellipsis if truncated
function getWrappedLines(ctx, text, maxWidth, maxLines = 6) {
  if (!text) return [];
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
      if (lines.length >= maxLines) break;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length + 2) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:\s]*$/, '') + '...';
  }
  return lines;
}

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

  const [aspectRatio, setAspectRatio] = useState('portrait'); // Default to 4:5 editorial portrait
  const [themeKey, setThemeKey] = useState('linen');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Live website domain setting (prevents accidental localhost links in captions)
  const defaultOrigin = useMemo(() => {
    if (settings?.public_website_url) return settings.public_website_url.replace(/\/+$/, '');
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    return 'https://gracedrelationships.vercel.app';
  }, [settings?.public_website_url]);

  const [websiteBaseUrl, setWebsiteBaseUrl] = useState(defaultOrigin);
  const [customCaption, setCustomCaption] = useState('');

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

  // Generate warm, high-converting morning caption
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

      return `🌅 *WORD FOR THE DAY* ✨\n*${selectedPost.title}*\n\n📖 _"${selectedPost.scripture}"_\n— *${selectedPost.scripture_reference}*\n\n${hook}\n\n👇 Read the complete Word of the Day on our Sanctuary:\n🔗 ${cleanBaseUrl}/word/${selectedPost.id}\n\n#GracedRelationshipRecipes #WordForTheDay #GodlyRelationships #TheSentTV`;
    }

    if (contentType === 'video' && selectedVideo) {
      const desc = (selectedVideo.description || 'Watch this practical, faith-rooted teaching from The Sent TV.').trim();
      return `🎬 *NEW TEACHING ON THE SENT TV* 🔥\n*${selectedVideo.title}*\n\n${desc}\n\n👇 Watch the full teaching on our Sanctuary:\n🔗 ${cleanBaseUrl}/videos\n\n📺 Direct YouTube:\n${selectedVideo.youtube_url}\n\n#TheSentTV #GracedRelationshipRecipes #ChristianRelationships`;
    }

    return '';
  }, [contentType, selectedPost, selectedVideo, cleanBaseUrl]);

  useEffect(() => {
    setCustomCaption(generatedCaption);
  }, [generatedCaption]);

  const handleSaveWebsiteUrl = () => {
    if (websiteBaseUrl.trim()) {
      updateSettings({ public_website_url: websiteBaseUrl.trim().replace(/\/+$/, '') });
    }
  };

  // Render crisp editorial human-styled canvas
  useEffect(() => {
    let cancelled = false;

    const renderGraphic = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const theme = EDITORIAL_THEMES[themeKey] || EDITORIAL_THEMES.linen;
      const dims = FORMAT_DIMENSIONS[aspectRatio] || FORMAT_DIMENSIONS.portrait;

      const width = dims.width;
      const height = dims.height;
      canvas.width = width;
      canvas.height = height;

      const isStatus = aspectRatio === 'status';
      const isPortrait = aspectRatio === 'portrait';

      const paintGraphic = (thumbImage = null) => {
        // 1. Soft full-bleed warm background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
        bgGrad.addColorStop(0, theme.bgStart);
        bgGrad.addColorStop(1, theme.bgEnd);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Soft sunlit radial wash from upper left
        const sunGlow = ctx.createRadialGradient(width * 0.2, height * 0.15, 40, width * 0.25, height * 0.2, width * 0.85);
        sunGlow.addColorStop(0, theme.glowColor);
        sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, height);

        // 3. Subtle tactile paper film grain
        const pattern = createGrainPattern(ctx, theme.grainAlpha);
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }

        // 4. Delicate fine-art botanical sprigs on opposing outer corners (clean vector)
        drawBotanicalCorner(ctx, 26, 26, 1.05, 0, theme.botanicalColor);
        drawBotanicalCorner(ctx, width - 26, height - 26, 1.05, 180, theme.botanicalColor);

        // 5. Crisp 1.5px architectural hairline frame inset gently
        const margin = 58;
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

        const centerX = width / 2;

        // 6. Top Editorial Masthead
        let y = isStatus ? 185 : isPortrait ? 145 : 125;

        ctx.fillStyle = theme.eyebrowColor;
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const eyebrowText = contentType === 'post'
          ? 'W O R D   F O R   T H E   D A Y'
          : 'T H E   S E N T   T V   •   T E A C H I N G';
        ctx.fillText(eyebrowText, centerX, y);

        y += 44;
        ctx.fillStyle = theme.brandColor;
        ctx.font = '600 34px "Cormorant Garamond", Georgia, serif';
        ctx.fillText('Graced Relationship Recipes', centerX, y);

        // Delicate hairline rule + small diamond center mark
        y += 38;
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 110, y);
        ctx.lineTo(centerX - 14, y);
        ctx.moveTo(centerX + 14, y);
        ctx.lineTo(centerX + 110, y);
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = theme.accentColor;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();

        // Reserve bottom footer space
        const footerY = height - margin - 62;

        if (contentType === 'post' && selectedPost) {
          // WORD FOR THE DAY CENTERPIECE (Airy Editorial Flow — Zero Heavy Boxes)
          const titleFontSize = isStatus ? 76 : isPortrait ? 66 : 56;
          const titleLineH = isStatus ? 88 : isPortrait ? 76 : 65;

          ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
          const titleLines = getWrappedLines(ctx, selectedPost.title, width - 220, 3);

          const verseFontSize = isStatus ? 40 : isPortrait ? 35 : 31;
          const verseLineH = isStatus ? 58 : isPortrait ? 50 : 44;
          ctx.font = `italic 400 ${verseFontSize}px "Source Serif 4", Georgia, serif`;
          const verseLines = getWrappedLines(ctx, `"${selectedPost.scripture || ''}"`, width - 240, isStatus ? 7 : isPortrait ? 6 : 4);

          // Vertically balance the centerpiece cleanly in the open canvas zone
          const contentHeight =
            titleLines.length * titleLineH +
            54 + // spacing + ornament
            verseLines.length * verseLineH +
            56; // reference spacing

          const availableTop = y + 36;
          const availableBottom = footerY - 60;
          let curY = availableTop + Math.max(24, (availableBottom - availableTop - contentHeight) / 2);

          // Title
          ctx.fillStyle = theme.titleColor;
          ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
          ctx.textBaseline = 'top';
          titleLines.forEach((line) => {
            ctx.fillText(line, centerX, curY);
            curY += titleLineH;
          });

          // Subtle editorial accent dash
          curY += 26;
          ctx.fillStyle = theme.accentColor;
          ctx.fillRect(centerX - 28, curY, 56, 2);
          curY += 36;

          // Italic Scripture
          ctx.fillStyle = theme.scriptureColor;
          ctx.font = `italic 400 ${verseFontSize}px "Source Serif 4", Georgia, serif`;
          verseLines.forEach((line) => {
            ctx.fillText(line, centerX, curY);
            curY += verseLineH;
          });

          // Tracked Reference
          curY += 22;
          ctx.fillStyle = theme.referenceColor;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          const refText = `— ${(selectedPost.scripture_reference || '').toUpperCase().split('').join(' ').replace(/\s{2,}/g, '   ')}`;
          ctx.fillText(refText, centerX, curY);
        } else if (contentType === 'video' && selectedVideo) {
          // THE SENT TV VIDEO EDITORIAL FLYER
          const frameW = width - 220;
          const frameH = Math.round((frameW * 9) / 16);
          const frameX = 110;

          const titleFontSize = isStatus ? 64 : isPortrait ? 54 : 46;
          const titleLineH = isStatus ? 74 : isPortrait ? 62 : 54;
          ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
          const vidTitleLines = getWrappedLines(ctx, selectedVideo.title, width - 220, 3);

          const descFontSize = isStatus ? 28 : 24;
          ctx.font = `400 ${descFontSize}px "Plus Jakarta Sans", sans-serif`;
          const descLines = getWrappedLines(ctx, selectedVideo.description || '', width - 240, isStatus ? 4 : 2);

          const totalBlockH = frameH + 46 + vidTitleLines.length * titleLineH + (descLines.length ? 22 + descLines.length * 36 : 0);
          const availableTop = y + 30;
          const availableBottom = footerY - 50;
          let curY = availableTop + Math.max(16, (availableBottom - availableTop - totalBlockH) / 2);

          // Draw clean framed thumbnail
          ctx.save();
          drawRoundedRect(ctx, frameX, curY, frameW, frameH, 16);
          ctx.clip();

          if (thumbImage) {
            const imgRatio = thumbImage.width / thumbImage.height;
            const boxRatio = frameW / frameH;
            let drawW = frameW;
            let drawH = frameH;
            let offsetX = frameX;
            let offsetY = curY;

            if (imgRatio > boxRatio) {
              drawW = frameH * imgRatio;
              offsetX = frameX - (drawW - frameW) / 2;
            } else {
              drawH = frameW / imgRatio;
              offsetY = curY - (drawH - frameH) / 2;
            }
            ctx.drawImage(thumbImage, offsetX, offsetY, drawW, drawH);
            ctx.fillStyle = 'rgba(20, 12, 28, 0.22)';
            ctx.fillRect(frameX, curY, frameW, frameH);
          } else {
            ctx.fillStyle = theme.brandColor;
            ctx.fillRect(frameX, curY, frameW, frameH);
          }

          // Translucent frosted play disc (modern editorial, not cartoonish)
          ctx.beginPath();
          ctx.arc(centerX, curY + frameH / 2, 46, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(centerX - 10, curY + frameH / 2 - 18);
          ctx.lineTo(centerX + 20, curY + frameH / 2);
          ctx.lineTo(centerX - 10, curY + frameH / 2 + 18);
          ctx.closePath();
          ctx.fillStyle = theme.brandColor;
          ctx.fill();
          ctx.restore();

          // Hairline frame around thumbnail
          drawRoundedRect(ctx, frameX, curY, frameW, frameH, 16);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = theme.borderColor;
          ctx.stroke();

          curY += frameH + 46;

          ctx.fillStyle = theme.titleColor;
          ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
          ctx.textBaseline = 'top';
          vidTitleLines.forEach((line) => {
            ctx.fillText(line, centerX, curY);
            curY += titleLineH;
          });

          if (descLines.length > 0) {
            curY += 18;
            ctx.fillStyle = theme.scriptureColor;
            ctx.font = `400 ${descFontSize}px "Plus Jakarta Sans", sans-serif`;
            descLines.forEach((line) => {
              ctx.fillText(line, centerX, curY);
              curY += 36;
            });
          }
        }

        // 7. Editorial Footer Bar
        ctx.strokeStyle = theme.footerLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin + 60, footerY - 26);
        ctx.lineTo(width - margin - 60, footerY - 26);
        ctx.stroke();

        ctx.fillStyle = theme.footerText;
        ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const ctaText = contentType === 'post'
          ? `Read the full teaching via the link in caption  •  ${cleanDomainLabel}`
          : `Watch the full video via the link in caption  •  ${cleanDomainLabel}`;
        ctx.fillText(ctaText, centerX, footerY + 12);
      };

      if (contentType === 'video' && selectedVideo?.thumbnail_url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (cancelled) return;
          try {
            paintGraphic(img);
            canvas.toDataURL('image/png');
          } catch {
            paintGraphic(null);
          }
        };
        img.onerror = () => {
          if (!cancelled) paintGraphic(null);
        };
        img.src = selectedVideo.thumbnail_url;
      } else {
        paintGraphic(null);
      }
    };

    renderGraphic();
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
        {/* Left Side: Controls & Live Vector Canvas */}
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

        {/* Right Side: Live Domain Override + Auto-Generated Caption */}
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
