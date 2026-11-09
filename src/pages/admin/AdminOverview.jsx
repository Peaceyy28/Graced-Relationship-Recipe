import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileEdit, Video, Plus, Eye, Clock, ArrowRight, RotateCcw, CalendarClock, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AdminOverview() {
  const { posts, publishedPosts, scheduledPosts, draftPosts, videos, resetDemoData } = useData();
  const [isDemoDismissed, setIsDemoDismissed] = useState(() => {
    return localStorage.getItem('grr_admin_demo_dismissed') === 'true';
  });

  const handleResetDemo = () => {
    if (confirm('Reset to initial sample data? This demo box will be permanently dismissed from your dashboard.')) {
      resetDemoData();
      localStorage.setItem('grr_admin_demo_dismissed', 'true');
      setIsDemoDismissed(true);
    }
  };

  const handleDismissDemo = () => {
    localStorage.setItem('grr_admin_demo_dismissed', 'true');
    setIsDemoDismissed(true);
  };

  const recentPosts = posts.slice(0, 5);

  return (
    <div className="admin-page-view">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Welcome back! Manage content, queue scheduled posts for the week, and monitor audience growth.</p>
        </div>

        <div className="header-actions">
          <Link to="/admin/posts?action=new" className="admin-primary-btn">
            <Plus size={16} />
            <span>Create / Schedule Post</span>
          </Link>
          <Link to="/admin/videos?action=new" className="admin-secondary-btn">
            <Plus size={16} />
            <span>Add YouTube Video</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <BookOpen size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{publishedPosts.length}</span>
            <span className="metric-label">Published Words</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
            <CalendarClock size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{scheduledPosts.length}</span>
            <span className="metric-label">Scheduled for Week</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <FileEdit size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{draftPosts.length}</span>
            <span className="metric-label">Saved Drafts</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box red">
            <Video size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-value">{videos.length}</span>
            <span className="metric-label">YouTube Videos</span>
          </div>
        </div>
      </div>

      {/* Quick Content Table */}
      <div className="admin-card">
        <div className="card-header-flex">
          <div>
            <h3>Recent Content Entries</h3>
            <span className="subtext">Word for the Day messages recently authored, scheduled, or live</span>
          </div>
          <Link to="/admin/posts" className="view-all-link">
            <span>Manage All Posts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title / Topic</th>
                <th>Scripture</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => {
                const isScheduled = post.status === 'scheduled';
                return (
                  <tr key={post.id}>
                    <td className="bold-cell">{post.title}</td>
                    <td>{post.scripture_reference}</td>
                    <td>
                      <span className={`status-badge ${post.status}`}>
                        {post.status === 'published' && 'Published'}
                        {post.status === 'scheduled' && 'Scheduled'}
                        {post.status === 'draft' && 'Draft'}
                      </span>
                    </td>
                    <td>
                      {isScheduled && post.scheduled_for
                        ? `Releases: ${new Date(post.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/word/${post.id}`} target="_blank" className="action-btn view" title="Preview post">
                          <Eye size={15} />
                        </Link>
                        <Link to={`/admin/posts?edit=${post.id}`} className="action-btn edit" title="Edit post">
                          <FileEdit size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Reset Helper - permanently hidden once dismissed or reset */}
      {!isDemoDismissed && (
        <div className="admin-card demo-box" style={{ position: 'relative' }}>
          <button 
            onClick={handleDismissDemo}
            title="Dismiss permanently"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={16} />
          </button>
          <div className="demo-box-content">
            <div>
              <h4>Client Demo Environment</h4>
              <p>
                Feel free to test scheduling posts, publishing words, and adding videos. You can reset back to clean initial data anytime.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={handleResetDemo} className="reset-demo-btn">
                <RotateCcw size={15} />
                <span>Reset Demo Data</span>
              </button>
              <button 
                onClick={handleDismissDemo} 
                style={{
                  background: 'none',
                  border: '1px solid var(--border-light)',
                  padding: '0.55rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
