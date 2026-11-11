import { Users, BookOpen, Share2, TrendingUp } from 'lucide-react';
import YoutubeIcon from '../../components/YoutubeIcon';
import { useData } from '../../context/DataContext';

export default function AdminAnalytics() {
  const { analytics, publishedPosts } = useData();

  const monthlyReads = analytics?.monthlyReads ?? analytics?.total_page_views ?? 0;
  const totalVisitors = analytics?.totalVisitors ?? analytics?.total_page_views ?? 0;
  const scriptureShares = analytics?.scriptureShares ?? analytics?.devotional_shares ?? 0;
  const youtubeClicks = analytics?.youtubeClicks ?? analytics?.video_clicks ?? 0;

  const weeklyTrend = Array.isArray(analytics?.weeklyTrend) ? analytics.weeklyTrend : [];
  const trafficSources = Array.isArray(analytics?.trafficSources) ? analytics.trafficSources : [];

  // Find top posts sorted by views
  const topPosts = [...(publishedPosts || [])].sort((a, b) => (b.views || 0) - (a.views || 0));

  const maxWeeklyReads = Math.max(...weeklyTrend.map(d => d.reads || 0), 10);

  return (
    <div className="admin-page-view">
      <div className="page-header">
        <div>
          <h2>Audience & Content Analytics</h2>
          <p>Real-time readership metrics, scripture shares, and audience engagement trends.</p>
        </div>

        <div className="admin-user-pill">
          <TrendingUp size={14} color="#10b981" />
          <span>Live Data Updated</span>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <BookOpen size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{monthlyReads.toLocaleString()}</span>
            <span className="metric-label">Devotional Reads</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple">
            <Users size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{totalVisitors.toLocaleString()}</span>
            <span className="metric-label">Total Visitors</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <Share2 size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{scriptureShares.toLocaleString()}</span>
            <span className="metric-label">Scripture Shares (WhatsApp)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box red">
            <YoutubeIcon size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{youtubeClicks.toLocaleString()}</span>
            <span className="metric-label">YouTube Visitors</span>
          </div>
        </div>
      </div>

      {/* Weekly Readership Bar Chart */}
      <div className="admin-card">
        <div className="card-header-flex">
          <div>
            <h3>Weekly Readership Activity</h3>
            <span className="subtext">Daily message reads across desktop and mobile</span>
          </div>
        </div>

        <div className="analytics-chart-container">
          <div className="chart-bars-wrap">
            {weeklyTrend.map((item, index) => {
              const reads = item.reads || 0;
              const heightPercent = reads > 0 ? Math.max(8, Math.round((reads / maxWeeklyReads) * 100)) : 0;
              return (
                <div key={index} className="chart-bar-col">
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.day}: ${reads} reads`}
                    >
                      <span className="bar-tooltip">{reads}</span>
                    </div>
                  </div>
                  <span className="chart-bar-label">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Posts & Traffic Sources */}
      <div className="admin-grid-two-col">
        {/* Top Messages Table */}
        <div className="admin-card">
          <div className="card-header-flex">
            <div>
              <h3>Most Read Devotionals</h3>
              <span className="subtext">Top performing messages by reader engagement</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Scripture</th>
                  <th>Reads</th>
                  <th className="text-right">Shares</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.slice(0, 4).map(post => (
                  <tr key={post.id}>
                    <td className="bold-cell">{post.title}</td>
                    <td>{post.scripture_reference}</td>
                    <td>{(post.views || 0).toLocaleString()}</td>
                    <td className="text-right bold-cell" style={{ color: '#7e22ce' }}>
                      {(post.shares || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {topPosts.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                      No published devotionals yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="admin-card">
          <div className="card-header-flex">
            <div>
              <h3>Audience Discovery Channels</h3>
              <span className="subtext">How readers find Graced Relationship Recipes</span>
            </div>
          </div>

          <div className="traffic-sources-list">
            {trafficSources.map((source, index) => (
              <div key={index} className="traffic-source-item">
                <div className="source-row-top">
                  <span className="source-name">{source.source}</span>
                  <span className="source-pct">{source.percentage || 0}%</span>
                </div>
                <div className="source-progress-track">
                  <div 
                    className="source-progress-fill" 
                    style={{ width: `${source.percentage || 0}%` }}
                  ></div>
                </div>
                <span className="source-count">{(source.count || 0).toLocaleString()} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
