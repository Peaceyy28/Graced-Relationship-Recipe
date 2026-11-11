import { createContext, useContext, useState, useEffect } from 'react';
import { initialPosts, initialVideos, initialSettings, initialAnalytics } from '../data/initialData';

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
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
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
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDay = dayNames[new Date().getDay()];

    setAnalytics(prev => {
      const safeTrend = Array.isArray(prev.weeklyTrend) && prev.weeklyTrend.length > 0
        ? prev.weeklyTrend
        : initialAnalytics.weeklyTrend;
      return {
        ...prev,
        monthlyReads: (prev.monthlyReads || 0) + 1,
        totalVisitors: (prev.totalVisitors || 0) + 1,
        weeklyTrend: safeTrend.map(item =>
          item.day === todayDay ? { ...item, reads: (item.reads || 0) + 1 } : item
        ),
        trafficSources: updateTrafficSource(prev.trafficSources, 'Direct Link / Search')
      };
    });
  };

  const recordScriptureShare = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
    setAnalytics(prev => ({
      ...prev,
      scriptureShares: (prev.scriptureShares || 0) + 1,
      trafficSources: updateTrafficSource(prev.trafficSources, 'WhatsApp / Direct Shares')
    }));
  };

  const recordVideoClick = (videoId) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, clicks: (v.clicks || 0) + 1 } : v));
    setAnalytics(prev => ({
      ...prev,
      youtubeClicks: (prev.youtubeClicks || 0) + 1,
      trafficSources: updateTrafficSource(prev.trafficSources, 'YouTube (The Sent TV)')
    }));
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
    return postWithDefaults;
  };

  const updatePost = (id, updatedFields) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isScheduled = updatedFields.status === 'scheduled';
        const isPublished = updatedFields.status === 'published';
        const wasNotPublished = post.status !== 'published';

        return {
          ...post,
          ...updatedFields,
          updated_at: new Date().toISOString(),
          published_at: wasNotPublished && isPublished ? new Date().toISOString() : post.published_at,
          scheduled_for: isScheduled ? updatedFields.scheduled_for : null
        };
      }
      return post;
    }));
  };

  const deletePost = (id) => {
    setPosts(prev => prev.filter(post => post.id !== id));
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
    setSettings(prev => ({ ...prev, ...newSettings }));
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

  // Smart Public & Scheduled Filtering
  const now = new Date().getTime();

  // Public sees: published posts OR scheduled posts whose scheduled_for time has passed!
  const publishedPosts = posts.filter(p => {
    if (p.status === 'published') return true;
    if (p.status === 'scheduled' && p.scheduled_for) {
      return now >= new Date(p.scheduled_for).getTime();
    }
    return false;
  });

  // Scheduled queue: posts waiting in the queue for a future date/time
  const scheduledPosts = posts.filter(p => {
    if (p.status === 'scheduled') {
      if (!p.scheduled_for) return true;
      return now < new Date(p.scheduled_for).getTime();
    }
    return false;
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
      resetDemoData
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
