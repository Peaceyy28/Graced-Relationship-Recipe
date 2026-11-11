const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function getHeaders(extra = {}) {
  const headers = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...extra
  };
  // Only include Bearer token for legacy JWT anon keys; newer sb_publishable_ keys use apikey header only
  if (SUPABASE_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  }
  return headers;
}

async function sbFetch(path, options = {}) {
  if (!isSupabaseConfigured()) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: getHeaders(options.headers)
  });
  if (!res.ok) {
    throw new Error(`Supabase error ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchCloudState({ initialPosts, initialSettings, initialAnalytics }) {
  if (!isSupabaseConfigured()) return null;

  try {
    const [postsRes, settingsRes, analyticsRes] = await Promise.all([
      sbFetch('grr_posts?select=*&order=created_at.desc'),
      sbFetch('grr_settings?id=eq.default&select=*'),
      sbFetch('grr_analytics?id=eq.default&select=*')
    ]);

    let posts = Array.isArray(postsRes) ? postsRes : [];
    // Seed initial posts once if cloud database is brand new & empty
    if (posts.length === 0 && Array.isArray(initialPosts) && initialPosts.length > 0) {
      await sbFetch('grr_posts', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify(initialPosts)
      });
      posts = initialPosts;
    }

    let settings = settingsRes?.[0]?.data || null;
    if (!settings && initialSettings) {
      await sbFetch('grr_settings', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: 'default', data: initialSettings })
      });
      settings = initialSettings;
    }

    let analytics = analyticsRes?.[0]?.data || null;
    if (!analytics && initialAnalytics) {
      await sbFetch('grr_analytics', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: 'default', data: initialAnalytics })
      });
      analytics = initialAnalytics;
    }

    return { posts, settings, analytics };
  } catch {
    return null;
  }
}

export async function upsertCloudPost(post) {
  if (!isSupabaseConfigured() || !post) return;
  try {
    await sbFetch('grr_posts', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(post)
    });
  } catch {
    // Non-blocking fallback to localStorage
  }
}

export async function deleteCloudPost(postId) {
  if (!isSupabaseConfigured() || !postId) return;
  try {
    await sbFetch(`grr_posts?id=eq.${encodeURIComponent(postId)}`, {
      method: 'DELETE'
    });
  } catch {
    // ignore network failure
  }
}

export async function saveCloudSettings(settings) {
  if (!isSupabaseConfigured() || !settings) return;
  try {
    await sbFetch('grr_settings', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'default', data: settings, updated_at: new Date().toISOString() })
    });
  } catch {
    // ignore
  }
}

export async function saveCloudAnalytics(analytics) {
  if (!isSupabaseConfigured() || !analytics) return;
  try {
    await sbFetch('grr_analytics', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: 'default', data: analytics, updated_at: new Date().toISOString() })
    });
  } catch {
    // ignore
  }
}
