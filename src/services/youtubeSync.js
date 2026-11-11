export const DEFAULT_YT_CHANNEL_ID = 'UCf8jri4Y0aETD9MG0s3BQ2w'; // @THESENT_TV

/**
 * Extracts the 11-character YouTube video ID from standard watch, short, or embed URLs.
 */
export function extractYouTubeVideoId(url = '') {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[2] : null;
}

/**
 * Fetches latest channel videos via our serverless API first, with rss2json fallback
 * so auto-sync works seamlessly on Vercel, Vite local dev, and static hosts.
 */
export async function fetchYouTubeChannelVideos({
  channelId = DEFAULT_YT_CHANNEL_ID,
  channelUrl = ''
} = {}) {
  const effectiveId = (channelId || DEFAULT_YT_CHANNEL_ID).trim();

  // 1. Primary path: Vercel serverless / Vite local dev middleware
  try {
    const params = new URLSearchParams();
    if (effectiveId) params.set('channelId', effectiveId);
    if (channelUrl) params.set('channelUrl', channelUrl);

    const apiRes = await fetch(`/api/youtube-sync?${params.toString()}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.success && Array.isArray(data.videos)) {
        return {
          channelId: data.channelId || effectiveId,
          syncedAt: data.syncedAt || new Date().toISOString(),
          videos: data.videos
        };
      }
    }
  } catch {
    // Fall through to rss2json fallback
  }

  // 2. Fallback path for pure static hosting without serverless functions
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(effectiveId)}`;
  const fallbackRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
  if (!fallbackRes.ok) {
    throw new Error('Unable to connect to YouTube channel feed.');
  }

  const rssData = await fallbackRes.json();
  if (rssData.status !== 'ok' || !Array.isArray(rssData.items)) {
    throw new Error('Invalid feed response from YouTube channel.');
  }

  const videos = rssData.items.map((item) => {
    const vid = extractYouTubeVideoId(item.link) || item.guid?.split(':').pop() || '';
    return {
      id: `vid-yt-${vid}`,
      videoId: vid,
      title: (item.title || '').trim(),
      description: (item.description || '').replace(/<[^>]+>/g, '').trim(),
      youtube_url: item.link || `https://www.youtube.com/watch?v=${vid}`,
      thumbnail_url: item.thumbnail || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : ''),
      clicks: 0,
      source: 'youtube_auto_sync',
      created_at: item.pubDate ? new Date(item.pubDate.replace(' ', 'T') + 'Z').toISOString() : new Date().toISOString()
    };
  }).filter(v => v.videoId && v.title);

  return {
    channelId: effectiveId,
    syncedAt: new Date().toISOString(),
    videos
  };
}
