const DEFAULT_CHANNEL_ID = 'UCf8jri4Y0aETD9MG0s3BQ2w'; // @THESENT_TV

function decodeXmlEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

export async function resolveChannelId(channelId, channelUrl) {
  if (channelId && /^UC[a-zA-Z0-9_-]{20,}$/.test(channelId.trim())) {
    return channelId.trim();
  }

  if (channelUrl) {
    // Check if URL already has /channel/UC...
    const directMatch = channelUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]{20,})/);
    if (directMatch) return directMatch[1];

    try {
      const res = await fetch(channelUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GracedSync/1.0)' }
      });
      const html = await res.text();
      const match =
        html.match(/"channelId":"(UC[a-zA-Z0-9_-]{20,})"/) ||
        html.match(/channel_id=(UC[a-zA-Z0-9_-]{20,})/) ||
        html.match(/"externalId":"(UC[a-zA-Z0-9_-]{20,})"/);
      if (match) return match[1];
    } catch {
      // Fall back to default below
    }
  }

  return DEFAULT_CHANNEL_ID;
}

export async function fetchAndParseYouTubeFeed({ channelId, channelUrl } = {}) {
  const resolvedId = await resolveChannelId(channelId, channelUrl);
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedId}`;

  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GracedSync/1.0)' }
  });

  if (!response.ok) {
    throw new Error(`YouTube feed responded with status ${response.status}`);
  }

  const xml = await response.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  const videos = entries.map((match) => {
    const entryXml = match[1];
    const videoId = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim() || '';
    const titleRaw = entryXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const descRaw = entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || '';
    const published = entryXml.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() || new Date().toISOString();
    const thumbAttr = entryXml.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] || '';

    const title = decodeXmlEntities(titleRaw);
    const description = decodeXmlEntities(descRaw);
    const thumbnail_url = thumbAttr || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

    return {
      id: `vid-yt-${videoId}`,
      videoId,
      title,
      description,
      youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail_url,
      clicks: 0,
      source: 'youtube_auto_sync',
      created_at: published
    };
  }).filter(v => v.videoId && v.title);

  return {
    success: true,
    channelId: resolvedId,
    syncedAt: new Date().toISOString(),
    videos
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const channelId = req.query?.channelId || '';
    const channelUrl = req.query?.channelUrl || '';
    const payload = await fetchAndParseYouTubeFeed({ channelId, channelUrl });
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error?.message || 'Failed to sync YouTube channel feed.'
    });
  }
}
