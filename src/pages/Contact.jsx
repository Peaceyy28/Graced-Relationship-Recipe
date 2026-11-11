import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Loader2, ExternalLink } from 'lucide-react';
import YoutubeIcon from '../components/YoutubeIcon';
import { useData } from '../context/DataContext';
import './Contact.css';

export default function Contact() {
  const { settings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitWarning, setSubmitWarning] = useState('');
  const [sentSnapshot, setSentSnapshot] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSending(true);
    setSubmitWarning('');
    setSentSnapshot({ ...formData });

    try {
      // Direct inbox dispatch via FormSubmit AJAX API (accepts email directly)
      const recipient = settings.contact_email || 'sentannie@gmail.com';
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: formData.subject || 'New Message from Graced Relationship Recipes',
          message: formData.message,
          _replyto: formData.email,
          _template: 'table'
        })
      });

      if (!response.ok) {
        setSubmitWarning('Direct web delivery returned an unexpected status—please also use the Gmail button below if needed.');
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitWarning('Unable to reach mail relay over this connection—please click "Open in Gmail / Mail App" below to send directly.');
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const getDirectMailtoUrl = () => {
    const data = sentSnapshot || formData;
    const recipient = settings.contact_email || 'sentannie@gmail.com';
    const sub = encodeURIComponent(data.subject || 'Message from Graced Relationship Recipes');
    const body = encodeURIComponent(`From: ${data.name || 'Visitor'}\nEmail: ${data.email || ''}\n\nMessage:\n${data.message || ''}`);
    return `mailto:${recipient}?subject=${sub}&body=${body}`;
  };

  return (
    <div className="contact-page">
      {/* Header Banner */}
      <section className="contact-header-banner">
        <div className="contact-header-container">
          <div className="contact-badge">
            <MessageSquare size={16} />
            <span>Connect & Fellowship</span>
          </div>
          <h1>Get in Touch</h1>
          <p>
            Have a question, testimony, or prayer request? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="contact-container">
        <div className="contact-card-grid">
          {/* Info Side */}
          <div className="contact-info-panel">
            <h2>Let's Hear From You</h2>
            <p>
              Whether you want to share how a daily word encouraged your marriage, invite us for a speaking engagement, or request prayer support, reach out using any channel below.
            </p>

            <div className="contact-channels">
              <div className="channel-item">
                <div className="channel-icon-box">
                  <Mail size={20} />
                </div>
                <div>
                  <h4>Email Us</h4>
                  <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                </div>
              </div>

              {settings.contact_address && (
                <div className="channel-item">
                  <div className="channel-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4>Location</h4>
                    <span>{settings.contact_address}</span>
                  </div>
                </div>
              )}

              {settings.contact_phone && (
                <div className="channel-item">
                  <div className="channel-icon-box">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4>Phone / WhatsApp</h4>
                    <span>{settings.contact_phone}</span>
                  </div>
                </div>
              )}

              <div className="channel-item">
                <div className="channel-icon-box youtube-icon-box">
                  <YoutubeIcon size={20} />
                </div>
                <div>
                  <h4>YouTube Community</h4>
                  <a href={settings.youtube_channel_url} target="_blank" rel="noopener noreferrer">
                    The Sent TV (@THESENT_TV)
                  </a>
                </div>
              </div>
            </div>

            <div className="verse-note">
              <em>"Therefore encourage one another and build each other up, just as in fact you are doing."</em>
              <span>— 1 Thessalonians 5:11</span>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-panel">
            {submitted ? (
              <div className="submission-success">
                <CheckCircle size={48} className="success-icon" />
                <h3>{submitWarning ? 'Ready to Send via Email' : 'Message Sent to Inbox!'}</h3>
                <p>
                  {submitWarning || (
                    <>
                      Your message has been dispatched directly to <strong>{settings.contact_email || 'sentannie@gmail.com'}</strong>. We will get back to you as soon as possible.
                    </>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <a 
                    href={getDirectMailtoUrl()} 
                    className="submit-btn" 
                    style={{ textDecoration: 'none', display: 'inline-flex', padding: '0.75rem 1.4rem' }}
                  >
                    <ExternalLink size={16} />
                    <span>Also Open in Gmail / Mail App</span>
                  </a>
                </div>

                <button onClick={() => setSubmitted(false)} className="send-another-btn">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send a Message</h3>

                <div className="form-group">
                  <label htmlFor="name">Your Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder="e.g. Oluwanifemi Peace"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    placeholder="e.g. Testimony, Question, or Prayer Request"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message *</label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    required 
                    placeholder="Write your reflection, question, or encouragement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                  <span>{sending ? 'Sending to Inbox...' : 'Send Message'}</span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <a 
                    href={getDirectMailtoUrl()} 
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                  >
                    Or click here to email {settings.contact_email || 'sentannie@gmail.com'} directly
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
