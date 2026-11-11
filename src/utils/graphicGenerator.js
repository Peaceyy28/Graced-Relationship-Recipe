export const EDITORIAL_THEMES = {
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

export const FORMAT_DIMENSIONS = {
  portrait: { width: 1080, height: 1350, label: 'Portrait (4:5)' },
  square: { width: 1080, height: 1080, label: 'Square (1:1)' },
  status: { width: 1080, height: 1920, label: 'Status (9:16)' }
};

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

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(45, 55, 95, 115, 165, 165);
  ctx.stroke();

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

export function buildPostShareCaption(post, baseUrl) {
  if (!post) return '';
  const cleanUrl = (baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
  const cleanContent = (post.content || '')
    .replace(/[#*_`]/g, '')
    .split(/\n+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ')
    .trim();
  const hook = cleanContent.length > 165 ? `${cleanContent.slice(0, 162).trim()}...` : cleanContent;

  return `🌅 *WORD FOR THE DAY* ✨\n*${post.title}*\n\n📖 _"${post.scripture}"_\n— *${post.scripture_reference}*\n\n${hook}\n\n👇 Read the complete Word of the Day on our Sanctuary:\n🔗 ${cleanUrl}/word/${post.id}\n\n#GracedRelationshipRecipes #WordForTheDay #GodlyRelationships #TheSentTV`;
}

export function buildVideoShareCaption(video, baseUrl) {
  if (!video) return '';
  const cleanUrl = (baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
  const desc = (video.description || 'Watch this practical, faith-rooted teaching from The Sent TV.').trim();
  return `🎬 *NEW TEACHING ON THE SENT TV* 🔥\n*${video.title}*\n\n${desc}\n\n👇 Watch the full teaching directly on our Sanctuary:\n🔗 ${cleanUrl}/videos\n\n#TheSentTV #GracedRelationshipRecipes #ChristianRelationships`;
}

export async function renderEditorialGraphicToCanvas({
  canvas,
  contentType = 'post',
  post = null,
  video = null,
  aspectRatio = 'portrait',
  themeKey = 'linen',
  domainLabel = 'gracedrelationships.vercel.app',
  isCancelled = () => false
}) {
  if (!canvas) return;
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  if (isCancelled()) return;

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
    if (isCancelled()) return;

    const bgGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const sunGlow = ctx.createRadialGradient(width * 0.2, height * 0.15, 40, width * 0.25, height * 0.2, width * 0.85);
    sunGlow.addColorStop(0, theme.glowColor);
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);

    const pattern = createGrainPattern(ctx, theme.grainAlpha);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }

    drawBotanicalCorner(ctx, 26, 26, 1.05, 0, theme.botanicalColor);
    drawBotanicalCorner(ctx, width - 26, height - 26, 1.05, 180, theme.botanicalColor);

    const margin = 58;
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    const centerX = width / 2;
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

    const footerY = height - margin - 62;

    if (contentType === 'post' && post) {
      const titleFontSize = isStatus ? 76 : isPortrait ? 66 : 56;
      const titleLineH = isStatus ? 88 : isPortrait ? 76 : 65;

      ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
      const titleLines = getWrappedLines(ctx, post.title, width - 220, 3);

      const verseFontSize = isStatus ? 40 : isPortrait ? 35 : 31;
      const verseLineH = isStatus ? 58 : isPortrait ? 50 : 44;
      ctx.font = `italic 400 ${verseFontSize}px "Source Serif 4", Georgia, serif`;
      const verseLines = getWrappedLines(ctx, `"${post.scripture || ''}"`, width - 240, isStatus ? 7 : isPortrait ? 6 : 4);

      const contentHeight =
        titleLines.length * titleLineH +
        54 +
        verseLines.length * verseLineH +
        56;

      const availableTop = y + 36;
      const availableBottom = footerY - 60;
      let curY = availableTop + Math.max(24, (availableBottom - availableTop - contentHeight) / 2);

      ctx.fillStyle = theme.titleColor;
      ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.textBaseline = 'top';
      titleLines.forEach((line) => {
        ctx.fillText(line, centerX, curY);
        curY += titleLineH;
      });

      curY += 26;
      ctx.fillStyle = theme.accentColor;
      ctx.fillRect(centerX - 28, curY, 56, 2);
      curY += 36;

      ctx.fillStyle = theme.scriptureColor;
      ctx.font = `italic 400 ${verseFontSize}px "Source Serif 4", Georgia, serif`;
      verseLines.forEach((line) => {
        ctx.fillText(line, centerX, curY);
        curY += verseLineH;
      });

      curY += 22;
      ctx.fillStyle = theme.referenceColor;
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      const refText = `— ${(post.scripture_reference || '').toUpperCase().split('').join(' ').replace(/\s{2,}/g, '   ')}`;
      ctx.fillText(refText, centerX, curY);
    } else if (contentType === 'video' && video) {
      const frameW = width - 220;
      const frameH = Math.round((frameW * 9) / 16);
      const frameX = 110;

      const titleFontSize = isStatus ? 64 : isPortrait ? 54 : 46;
      const titleLineH = isStatus ? 74 : isPortrait ? 62 : 54;
      ctx.font = `600 ${titleFontSize}px "Cormorant Garamond", Georgia, serif`;
      const vidTitleLines = getWrappedLines(ctx, video.title, width - 220, 3);

      const descFontSize = isStatus ? 28 : 24;
      ctx.font = `400 ${descFontSize}px "Plus Jakarta Sans", sans-serif`;
      const descLines = getWrappedLines(ctx, video.description || '', width - 240, isStatus ? 4 : 2);

      const totalBlockH = frameH + 46 + vidTitleLines.length * titleLineH + (descLines.length ? 22 + descLines.length * 36 : 0);
      const availableTop = y + 30;
      const availableBottom = footerY - 50;
      let curY = availableTop + Math.max(16, (availableBottom - availableTop - totalBlockH) / 2);

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
      ? `Read the full teaching via the link in caption  •  ${domainLabel}`
      : `Tap link in caption or story sticker to watch  •  ${domainLabel}`;
    ctx.fillText(ctaText, centerX, footerY + 12);
  };

  if (contentType === 'video' && video?.thumbnail_url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCancelled()) return;
      try {
        paintGraphic(img);
        canvas.toDataURL('image/png');
      } catch {
        paintGraphic(null);
      }
    };
    img.onerror = () => {
      if (!isCancelled()) paintGraphic(null);
    };
    img.src = video.thumbnail_url;
  } else {
    paintGraphic(null);
  }
}
