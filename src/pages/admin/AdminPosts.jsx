import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Clock, AlertTriangle, X, Sparkles, Upload, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const CURATED_PRESETS = [
  { label: 'Covenant Hands', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Open Scripture', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80' },
  { label: 'Loving Couple', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80' },
  { label: 'Peaceful Sunset', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Morning Grace', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fellowship', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80' }
];

export default function AdminPosts() {
  const { posts, addPost, updatePost, deletePost, scheduledPosts, publishedPosts, draftPosts } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'scheduled' | 'draft'

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    scripture: '',
    scripture_reference: '',
    content: '',
    cover_image: '',
    status: 'published',
    scheduled_for: ''
  });

  // Auto-Fetch Bible Verse State
  const [isFetchingVerse, setIsFetchingVerse] = useState(false);
  const [fetchVerseError, setFetchVerseError] = useState('');
  const [bibleTranslation, setBibleTranslation] = useState('kjv'); // 'kjv' | 'web' | 'bbe'

  // Delete Confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');

    if (action === 'new') {
      openCreateModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    } else if (editId) {
      const target = posts.find(p => p.id === editId);
      if (target) {
        openEditModal(target);
      }
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  }, [searchParams, posts]);

  const openCreateModal = () => {
    setEditingPostId(null);
    // Default scheduled time to tomorrow 6:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);
    const tomorrowIso = tomorrow.toISOString().slice(0, 16);

    setFormData({
      title: '',
      scripture: '',
      scripture_reference: '',
      content: '',
      cover_image: '',
      status: 'published',
      scheduled_for: tomorrowIso
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPostId(post.id);
    let schedIso = '';
    if (post.scheduled_for) {
      schedIso = new Date(post.scheduled_for).toISOString().slice(0, 16);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);
      schedIso = tomorrow.toISOString().slice(0, 16);
    }

    setFormData({
      title: post.title,
      scripture: post.scripture,
      scripture_reference: post.scripture_reference,
      content: post.content,
      cover_image: post.cover_image || '',
      status: post.status,
      scheduled_for: schedIso
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPostId(null);
    setFetchVerseError('');
    setIsFetchingVerse(false);
  };

  // 1-Click Auto Fetch Scripture from Free Bible API
  const handleAutoFetchVerse = async () => {
    const rawRef = formData.scripture_reference ? formData.scripture_reference.trim() : '';
    if (!rawRef) {
      setFetchVerseError('Please enter a reference first (e.g. Proverbs 1:10 or Genesis 2:18).');
      return;
    }

    setIsFetchingVerse(true);
    setFetchVerseError('');

    try {
      // Strip any existing translation in parentheses: e.g. "Proverbs 1:10 (KJV)" -> "Proverbs 1:10"
      const cleanRef = rawRef.replace(/\s*\([^)]*\)/g, '').trim();
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(cleanRef)}?translation=${bibleTranslation.toLowerCase()}`);
      
      if (!res.ok) {
        throw new Error('Verse lookup failed');
      }

      const data = await res.json();
      if (data.text) {
        const cleanText = data.text.trim().replace(/\s+/g, ' ');
        setFormData(prev => ({
          ...prev,
          scripture: cleanText,
          scripture_reference: `${data.reference} (${bibleTranslation.toUpperCase()})`
        }));
      } else {
        setFetchVerseError('Could not find that reference. Please check spelling (e.g. John 3:16).');
      }
    } catch {
      setFetchVerseError('Could not retrieve verse. Please check the spelling or internet connection.');
    } finally {
      setIsFetchingVerse(false);
    }
  };

  // Direct Device Image Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Please choose an image under 3MB for fast web loading.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({ ...prev, cover_image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.scripture || !formData.content) {
      alert('Please fill out all required fields.');
      return;
    }

    if (formData.status === 'scheduled' && !formData.scheduled_for) {
      alert('Please select the scheduled publication date and time.');
      return;
    }

    const payload = {
      ...formData,
      scheduled_for: formData.status === 'scheduled' 
        ? new Date(formData.scheduled_for).toISOString() 
        : null
    };

    if (editingPostId) {
      updatePost(editingPostId, payload);
    } else {
      addPost(payload);
    }

    closeModal();
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      deletePost(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  // Filtered post list
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.scripture_reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'published') {
      matchesStatus = post.status === 'published';
    } else if (statusFilter === 'scheduled') {
      matchesStatus = post.status === 'scheduled';
    } else if (statusFilter === 'draft') {
      matchesStatus = post.status === 'draft';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-view">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h2>Manage Word for the Day</h2>
          <p>Create, write ahead, schedule for the week, and manage daily devotional write-ups.</p>
        </div>

        <button onClick={openCreateModal} className="admin-primary-btn">
          <Plus size={16} />
          <span>Create New Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar-row">
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search entries by topic or scripture..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          <button 
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({posts.length})
          </button>
          <button 
            className={`filter-pill ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            Published ({publishedPosts.length})
          </button>
          <button 
            className={`filter-pill ${statusFilter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('scheduled')}
          >
            Scheduled ({scheduledPosts.length})
          </button>
          <button 
            className={`filter-pill ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({draftPosts.length})
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title / Topic</th>
                <th>Scripture Reference</th>
                <th>Status</th>
                <th>Publication Schedule</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table-cell">
                    No Word for the Day entries match your current search.
                  </td>
                </tr>
              ) : (
                filteredPosts.map(post => {
                  const isScheduled = post.status === 'scheduled';
                  const dateLabel = isScheduled && post.scheduled_for
                    ? `Scheduled for: ${new Date(post.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : new Date(post.published_at || post.created_at).toLocaleDateString();

                  return (
                    <tr key={post.id}>
                      <td className="bold-cell">
                        {post.title}
                      </td>
                      <td>{post.scripture_reference}</td>
                      <td>
                        <span className={`status-badge ${post.status}`}>
                          {post.status === 'published' && 'Published'}
                          {post.status === 'scheduled' && 'Scheduled'}
                          {post.status === 'draft' && 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          {isScheduled ? <Clock size={14} color="#7e22ce" /> : <Calendar size={14} color="#71717a" />}
                          <span style={{ color: isScheduled ? '#7e22ce' : '#52525b', fontWeight: isScheduled ? '600' : 'normal' }}>
                            {dateLabel}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="table-actions right">
                          <a 
                            href={`/word/${post.id}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="action-btn view" 
                            title="Preview message"
                          >
                            <Eye size={15} />
                          </a>
                          <button 
                            onClick={() => openEditModal(post)} 
                            className="action-btn edit" 
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(post.id)} 
                            className="action-btn delete" 
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal with Scheduling */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingPostId ? 'Edit Word for the Day' : 'Create / Schedule Word for the Day'}</h3>
              <button onClick={closeModal} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Word / Topic *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Walking in Covenant Love and Grace"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ margin: 0 }}>Scripture Reference *</label>
                    
                    {/* Auto-Fetch Bible Verse Tool */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <select 
                        value={bibleTranslation} 
                        onChange={(e) => setBibleTranslation(e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                        title="Choose Bible Translation"
                      >
                        <option value="kjv">KJV</option>
                        <option value="web">WEB (Modern)</option>
                        <option value="bbe">BBE</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAutoFetchVerse}
                        disabled={isFetchingVerse}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#7e22ce',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: isFetchingVerse ? 'wait' : 'pointer'
                        }}
                      >
                        {isFetchingVerse ? <Loader2 size={13} className="spin-icon" /> : <Sparkles size={13} />}
                        <span>{isFetchingVerse ? 'Fetching...' : '⚡ Auto-Fetch Verse'}</span>
                      </button>
                    </div>
                  </div>

                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Proverbs 1:10 or Genesis 2:18"
                    value={formData.scripture_reference}
                    onChange={(e) => {
                      setFormData({ ...formData, scripture_reference: e.target.value });
                      if (fetchVerseError) setFetchVerseError('');
                    }}
                  />
                  {fetchVerseError ? (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                      {fetchVerseError}
                    </span>
                  ) : (
                    <span className="input-hint">
                      Type the reference and click <strong>⚡ Auto-Fetch Verse</strong> to retrieve the scripture text automatically.
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Publication Option</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="scheduled">Schedule for Future Date</option>
                    <option value="draft">Save as Draft (Private)</option>
                  </select>
                </div>

                {/* Date & Time Picker shown when Scheduled is chosen */}
                {formData.status === 'scheduled' && (
                  <div className="form-group full" style={{ backgroundColor: '#faf5ff', padding: '1rem', borderRadius: '8px', border: '1px solid #d8b4fe' }}>
                    <label style={{ color: '#581c87', fontWeight: '700' }}>Schedule Release Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      required 
                      value={formData.scheduled_for}
                      onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                      style={{ marginTop: '0.4rem' }}
                    />
                    <span className="input-hint" style={{ color: '#7e22ce' }}>
                      This message will automatically unlock and appear on the public website when this time arrives!
                    </span>
                  </div>
                )}

                <div className="form-group full">
                  <label>Scripture Verse *</label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Enter the full scripture text here..."
                    value={formData.scripture}
                    onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label style={{ marginBottom: '0.45rem' }}>Cover Image Options (Optional)</label>
                  
                  {/* Curated Presets */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                      ✨ 1-Click Curated Presets:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '0.5rem' }}>
                      {CURATED_PRESETS.map((preset) => {
                        const isSelected = formData.cover_image === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setFormData({ ...formData, cover_image: preset.url })}
                            style={{
                              position: 'relative',
                              height: '52px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: isSelected ? '2px solid #7e22ce' : '1px solid var(--border-light)',
                              padding: 0,
                              cursor: 'pointer',
                              background: '#f4f4f5'
                            }}
                            title={preset.label}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.label} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            {isSelected && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(126, 34, 206, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={16} color="#ffffff" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device File Upload & Remove */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                    <label 
                      htmlFor="cover-file-upload" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.45rem', 
                        padding: '0.5rem 0.9rem', 
                        background: '#f4f4f5', 
                        color: 'var(--text-main)', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer', 
                        fontSize: '0.83rem', 
                        fontWeight: '600',
                        border: '1px solid var(--border-light)',
                        margin: 0
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload from Device (Phone / PC)</span>
                    </label>
                    <input 
                      id="cover-file-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      style={{ display: 'none' }} 
                    />

                    {formData.cover_image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          padding: '0.3rem 0.5rem',
                          fontWeight: '500'
                        }}
                      >
                        ✕ Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Preview if present */}
                  {formData.cover_image && (
                    <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', marginBottom: '0.65rem' }}>
                      <img 
                        src={formData.cover_image} 
                        alt="Cover Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}

                  {/* Manual URL input fallback */}
                  <input 
                    type="url" 
                    placeholder="Or paste an image web link (https://...)"
                    value={formData.cover_image.startsWith('data:') ? '' : formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <span className="input-hint">Pick a preset, upload from your phone, paste an image link, or leave blank.</span>
                </div>

                <div className="form-group full">
                  <label>Devotional Write-up / Message *</label>
                  <textarea 
                    rows={8} 
                    required 
                    placeholder="Write the full encouraging reflection here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingPostId 
                    ? 'Update Entry' 
                    : (formData.status === 'scheduled' ? 'Schedule Publication' : 'Save & Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <div className="modal-backdrop">
          <div className="modal-dialog small">
            <div className="delete-confirm-box">
              <div className="delete-icon-wrapper">
                <AlertTriangle size={32} color="#dc2626" />
              </div>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this Word for the Day entry? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button onClick={() => setDeleteTargetId(null)} className="btn-cancel">
                  Cancel
                </button>
                <button onClick={executeDelete} className="btn-delete-confirm">
                  Yes, Delete Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
