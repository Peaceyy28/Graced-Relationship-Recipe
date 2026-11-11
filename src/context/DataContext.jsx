import { createContext, useContext, useState, useEffect } from 'react';
import { initialPosts, initialVideos, initialSettings, initialAnalytics } from '../data/initialData';
import { fetchYouTubeChannelVideos, extractYouTubeVideoId, DEFAULT_YT_CHANNEL_ID } from '../services/youtubeSync';
import { isSupabaseConfigured, fetchCloudState, upsertCloudPost, deleteCloudPost, saveCloudSettings, saveCloudAnalytics } from '../services/supabaseClient';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  POSTS: 'grr_posts_v6',
  VIDEOS: 'grr_videos_v6',
  SETTINGS: 'grr_settings_v6',
  ANALYTICS: 'grr_analytics_v6'
};

export function DataProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      return saved ? JSON.parse(saved) : initialPosts;
    } catch {
      return initialPosts;
    }
  });

  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : initialVideos;
    } catch {
      return initialVideos;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [isSyncingYouTube, setIsSyncingYouTube] = useState(false);
  const [lastYouTubeSync, setLastYouTubeSync] = useState(() => {
    return localStorage.getItem('grr_yt_last_sync_iso') || null;
  });

  const [analytics, setAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (!saved) return initialAnalytics;
      const parsed = JSON.parse(saved);
      return {
        monthlyReads: parsed.monthlyReads ?? parsed.total_page_views ?? 0,
        totalVisitors: parsed.totalVisitors ?? parsed.total_page_views ?? 0,
        scriptureShares: parsed.scriptureShares ?? parsed.devotional_shares ?? 0,
        youtubeClicks: parsed.youtubeClicks ?? parsed.video_clicks ?? 0,
        weeklyTrend: Array.isArray(parsed.weeklyTrend) && parsed.weeklyTrend.length > 0
          ? parsed.weeklyTrend
          : initialAnalytics.weeklyTrend,
        trafficSources: Array.isArray(parsed.trafficSources) && parsed.trafficSources.length > 0
          ? parsed.trafficSources
          : initialAnalytics.trafficSources
      };
    } catch {
      return initialAnalytics;
    }
  });


  // Load global posts, settings & analytics from Supabase cloud when configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    fetchCloudState({ initialPosts, initialSettings, initialAnalytics }).then((cloud) => {
      if (!active || !cloud) return;
      if (Array.isArray(cloud.posts) && cloud.posts.length > 0) setPosts(cloud.posts);
      if (cloud.settings) setSettings(prev => ({ ...prev, ...cloud.settings }));
      if (cloud.analytics) setAnalytics(prev => ({ ...prev, ...cloud.analytics }));
    });
    return () => { active = false; };
  }, []);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  // Helper to recalculate traffic source percentages
  const updateTrafficSource = (sources, targetSourceName) => {
    const safeSources = Array.isArray(sources) && sources.length > 0 ? sources : initialAnalytics.trafficSources;
    const updatedCounts = safeSources.map(s =>
      s.source === targetSourceName ? { ...s, count: (s.count || 0) + 1 } : s
    );
    const total = updatedCounts.reduce((sum, s) => sum + (s.count || 0), 0);
    return updatedCounts.map(s => ({
      ...s,
      percentage: total > 0 ? Math.round(((s.count || 0) / total) * 100) : 0
    }));
  };

  // Live Analytics tracking helpers
  const recordPostView = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updated = { ...p, views: (p.views || 0) + 1 };
        upsertCloudPost(updated);
        return updated;
      }
      return p;
    }));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDay = dayNames[new Date().getDay()];

    setAnalytics(prev => {
      const safeTrend = Array.isArray(prev.weeklyTrend) && prev.weeklyTrend.length > 0
        ? prev.weeklyTrend
        : initialAnalytics.weeklyTrend;
      const next = {
        ...prev,
        monthlyReads: (prev.monthlyReads || 0) + 1,
        totalVisitors: (prev.totalVisitors || 0) + 1,
        weeklyTrend: safeTrend.map(item =>
          item.day === todayDay ? { ...item, reads: (item.reads || 0) + 1 } : item
        ),
        trafficSources: updateTrafficSource(prev.trafficSources, 'Direct Link / Search')
      };
      saveCloudAnalytics(next);
      return next;
    });
  };

  const recordScriptureShare = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updated = { ...p, shares: (p.shares || 0) + 1 };
        upsertCloudPost(updated);
        return updated;
      }
      return p;
    }));
    setAnalytics(prev => {
      const next = {
        ...prev,
        scriptureShares: (prev.scriptureShares || 0) + 1,
        trafficSources: updateTrafficSource(prev.trafficSources, 'WhatsApp / Direct Shares')
      };
      saveCloudAnalytics(next);
      return next;
    });
  };

  const recordVideoClick = (videoId) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, clicks: (v.clicks || 0) + 1 } : v));
    setAnalytics(prev => {
      const next = {
        ...prev,
        youtubeClicks: (prev.youtubeClicks || 0) + 1,
        trafficSources: updateTrafficSource(prev.trafficSources, 'YouTube (The Sent TV)')
      };
      saveCloudAnalytics(next);
      return next;
    });
  };

  // Post CRUD with Scheduling Support
  const addPost = (newPost) => {
    const isScheduled = newPost.status === 'scheduled';
    const isPublished = newPost.status === 'published';

    const postWithDefaults = {
      ...newPost,
      id: `post-${Date.now()}`,
      views: 0,
      shares: 0,
      created_at: new Date().toISOString(),
      published_at: isPublished ? new Date().toISOString() : null,
      scheduled_for: isScheduled ? newPost.scheduled_for : null
    };
    setPosts(prev => [postWithDefaults, ...prev]);
    upsertCloudPost(postWithDefaults);
    return postWithDefaults;
  };

  const updatePost = (id, updatedFields) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isScheduled = updatedFields.status === 'scheduled';
        const isPublished = updatedFields.status === 'published';
        const wasNotPublished = post.status !== 'published';

        const updatedPost = {
          ...post,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          published_at: wasNotPublished && isPublished ? new Date().toISOString() : post.published_at,
          scheduled_for: isScheduled ? updatedFields.scheduled_for : null
        };
        upsertCloudPost(updatedPost);
        return updatedPost;
      }
      return post;
    }));
  };

  const deletePost = (id) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    deleteCloudPost(id);
  };

  // Video CRUD
  const addVideo = (newVideo) => {
    let thumbnail = newVideo.thumbnail_url;
    if (!thumbnail && newVideo.youtube_url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = newVideo.youtube_url.match(regExp);
      if (match && match[2].length === 11) {
        thumbnail = `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
      } else {
        thumbnail = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
      }
    }

    const videoWithDefaults = {
      ...newVideo,
      thumbnail_url: thumbnail,
      clicks: 0,
      id: `vid-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setVideos(prev => [videoWithDefaults, ...prev]);
    return videoWithDefaults;
  };

  const updateVideo = (id, updatedFields) => {
    setVideos(prev => prev.map(video => {
      if (video.id === id) {
        return {
          ...video,
          ...updatedFields,
          updated_at: new Date().toISOString()
        };
      }
      return video;
    }));
  };

  const deleteVideo = (id) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      saveCloudSettings(next);
      return next;
    });
  };

  const resetDemoData = () => {
    setPosts(initialPosts);
    setVideos(initialVideos);
    setSettings(initialSettings);
    setAnalytics(initialAnalytics);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
  };


  // Live YouTube Channel Auto-Sync
  const syncYouTubeVideos = async (force = false) => {
    const LAST_SYNC_MS_KEY = 'grr_yt_last_sync_ms';
    const lastMs = Number(localStorage.getItem(LAST_SYNC_MS_KEY) || '0');
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    if (!force && Date.now() - lastMs < FIFTEEN_MINUTES) {
      return { skipped: true, added: 0 };
    }

    setIsSyncingYouTube(true);
    try {
      const result = await fetchYouTubeChannelVideos({
        channelId: settings.youtube_channel_id || DEFAULT_YT_CHANNEL_ID,
        channelUrl: settings.youtube_channel_url
      });

      let addedCount = 0;
      setVideos(prev => {
        const existingIds = new Set(
          prev.map(v => extractYouTubeVideoId(v.youtube_url)).filter(Boolean)
        );
        const newItems = result.videos.filter(v => !existingIds.has(v.videoId));
        addedCount = newItems.length;
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      const nowIso = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_MS_KEY, String(Date.now()));
      localStorage.setItem('grr_yt_last_sync_iso', nowIso);
      setLastYouTubeSync(nowIso);

      return { success: true, added: addedCount, syncedAt: nowIso };
    } catch (err) {
      return { success: false, added: 0, error: err?.message || 'Sync failed' };
    } finally {
      setIsSyncingYouTube(false);
    }
  };

  // Silently sync YouTube channel on app load (throttled every 15m)
  useEffect(() => {
    syncYouTubeVideos(false);
  }, [settings.youtube_channel_id]);

  // Live 60-second clock tick so scheduled posts auto-release on time without page refresh
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getEffectivePublishTime = (post) => {
    if (post.status === 'scheduled' && post.scheduled_for) {
      return new Date(post.scheduled_for).getTime();
    }
    return new Date(post.published_at || post.created_at || 0).getTime();
  };

  // Public sees published posts OR scheduled posts whose scheduled_for time has passed,
  // strictly ordered by newest effective publish/release date first!
  const publishedPosts = posts
    .filter(p => {
      if (p.status === 'published') return true;
      if (p.status === 'scheduled' && p.scheduled_for) {
        return nowMs >= new Date(p.scheduled_for).getTime();
      }
      return false;
    })
    .sort((a, b) => getEffectivePublishTime(b) - getEffectivePublishTime(a));

  // Scheduled queue: upcoming posts sorted chronologically (soonest release first)
  const scheduledPosts = posts
    .filter(p => {
      if (p.status === 'scheduled') {
        if (!p.scheduled_for) return true;
        return nowMs < new Date(p.scheduled_for).getTime();
      }
      return false;
    })
    .sort((a, b) => {
      const ta = a.scheduled_for ? new Date(a.scheduled_for).getTime() : Infinity;
      const tb = b.scheduled_for ? new Date(b.scheduled_for).getTime() : Infinity;
      return ta - tb;
    });

  const draftPosts = posts.filter(p => p.status === 'draft');
  const latestPost = publishedPosts[0] || null;

  return (
    <DataContext.Provider value={{
      posts,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      latestPost,
      videos,
      settings,
      analytics,
      recordPostView,
      recordScriptureShare,
      recordVideoClick,
      addPost,
      updatePost,
      deletePost,
      addVideo,
      updateVideo,
      deleteVideo,
      updateSettings,
      resetDemoData,
      syncYouTubeVideos,
      isSyncingYouTube,
      lastYouTubeSync,
      isCloudSynced: isSupabaseConfigured()
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
