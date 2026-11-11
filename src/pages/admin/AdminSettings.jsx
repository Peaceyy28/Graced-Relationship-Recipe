import { useState } from 'react';
import { Save, CheckCircle2, Mail, Phone, MapPin, Info } from 'lucide-react';
import YoutubeIcon from '../../components/YoutubeIcon';
import { useData } from '../../context/DataContext';

export default function AdminSettings() {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="admin-page-view">
      <div className="page-header">
        <div>
          <h2>Platform Settings</h2>
          <p>Manage your main YouTube channel link, contact info, and website metadata.</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px' }}>
        {savedSuccess && (
          <div className="settings-saved-banner">
            <CheckCircle2 size={18} />
            <span>Settings saved and updated successfully across the website!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group full">
            <label>YouTube Channel URL</label>
            <div className="input-with-icon">
              <YoutubeIcon size={18} className="input-icon" color="#ef4444" />
              <input 
                type="url" 
                required
                value={formData.youtube_channel_url}
                onChange={(e) => setFormData({ ...formData, youtube_channel_url: e.target.value })}
                placeholder="https://www.youtube.com/@gracerelationshiprecipes"
              />
            </div>
            <span className="input-hint">Controls the "Subscribe on YouTube" buttons on the homepage, videos page, and footer.</span>
          </div>

          <div className="form-group full">
            <label>YouTube Channel ID (Auto-Sync Feed)</label>
            <div className="input-with-icon">
              <Info size={18} className="input-icon" />
              <input 
                type="text" 
                value={formData.youtube_channel_id || ''}
                onChange={(e) => setFormData({ ...formData, youtube_channel_id: e.target.value })}
                placeholder="UCf8jri4Y0aETD9MG0s3BQ2w"
              />
            </div>
            <span className="input-hint">Automatically pulls new uploads from The Sent TV onto your website without manual copying.</span>
          </div>

          <div className="form-group full">
            <label>Contact Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="sentannie@gmail.com"
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Contact Location / Address</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input 
                type="text" 
                value={formData.contact_address || ''}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Contact Phone / WhatsApp</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input 
                type="text" 
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Mission Summary (Shown in Footer)</label>
            <textarea 
              rows={3}
              value={formData.about_mission}
              onChange={(e) => setFormData({ ...formData, about_mission: e.target.value })}
            />
          </div>

          <button type="submit" className="admin-primary-btn" style={{ alignSelf: 'flex-start' }}>
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}
