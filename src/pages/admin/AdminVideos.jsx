import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink, Search, X, AlertTriangle, Video, Play } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AdminVideos() {
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    thumbnail_url: ''
  });
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      openCreateModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingVideoId(null);
    setFormData({
      title: '',
      description: '',
      youtube_url: '',
      thumbnail_url: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (video) => {
    setEditingVideoId(video.id);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      thumbnail_url: video.thumbnail_url || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideoId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.youtube_url) {
      alert('Please provide at least a video title and YouTube URL.');
      return;
    }

    // Basic URL validation
    if (!formData.youtube_url.includes('youtube.com') && !formData.youtube_url.includes('youtu.be')) {
      alert('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    if (editingVideoId) {
      updateVideo(editingVideoId, formData);
    } else {
      addVideo(formData);
    }

    closeModal();
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      deleteVideo(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-page-view">
      <div className="page-header">
        <div>
          <h2>Manage YouTube Videos</h2>
          <p>Add and curate YouTube video teachings for the public videos page.</p>
        </div>

        <button onClick={openCreateModal} className="admin-primary-btn">
          <Plus size={16} />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar-row">
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search videos by title or topic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Videos List */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Preview</th>
                <th>Video Title</th>
                <th>YouTube URL</th>
                <th>Date Added</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table-cell">
                    No videos found. Click "Add New Video" to link your first YouTube video!
                  </td>
                </tr>
              ) : (
                filteredVideos.map(video => (
                  <tr key={video.id}>
                    <td>
                      <div className="table-thumb-box">
                        <img 
                          src={video.thumbnail_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'} 
                          alt={video.title} 
                          className="table-thumb" 
                        />
                      </div>
                    </td>
                    <td className="bold-cell">
                      {video.title}
                      {video.description && (
                        <span className="table-desc-snippet">{video.description}</span>
                      )}
                    </td>
                    <td>
                      <a 
                        href={video.youtube_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="table-external-link"
                      >
                        <span>Open Video</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>{new Date(video.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <div className="table-actions right">
                        <Link
                          to={`/admin/promo-studio?type=video&id=${video.id}`}
                          className="action-btn graphic"
                          title="Create Graphic & Caption"
                          style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}
                        >
                          <Sparkles size={15} />
                        </Link>
                        <button 
                          onClick={() => openEditModal(video)} 
                          className="action-btn edit" 
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => setDeleteTargetId(video.id)} 
                          className="action-btn delete" 
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingVideoId ? 'Edit YouTube Video' : 'Add New YouTube Video'}</h3>
              <button onClick={closeModal} className="modal-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group full">
                  <label>YouTube Video URL *</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  />
                  <span className="input-hint">
                    Supports full URLs (youtube.com/watch?v=...) or short links (youtu.be/...). The thumbnail is generated automatically.
                  </span>
                </div>

                <div className="form-group full">
                  <label>Video Title *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 5 Keys to Effective Communication in Marriage"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Custom Thumbnail URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="Leave blank to use YouTube's default thumbnail"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Description (Optional)</label>
                  <textarea 
                    rows={4} 
                    placeholder="Brief summary of the video teaching..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingVideoId ? 'Update Video' : 'Save & Publish Video'}
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
              <p>Are you sure you want to remove this video link from the website?</p>
              <div className="confirm-actions">
                <button onClick={() => setDeleteTargetId(null)} className="btn-cancel">
                  Cancel
                </button>
                <button onClick={executeDelete} className="btn-delete-confirm">
                  Yes, Remove Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
