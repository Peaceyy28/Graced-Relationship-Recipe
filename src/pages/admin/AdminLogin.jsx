import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Invalid administrator credentials');
      }
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="admin-brand-icon">
            <Heart size={24} fill="#ffffff" color="#ffffff" />
          </div>
          <h2>Administrator Portal</h2>
          <p>Graced Relationship Recipes Management</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                id="admin-email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-pass">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                id="admin-pass" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="back-to-site">
          <Link to="/">← Return to Public Sanctuary</Link>
        </div>
      </div>
    </div>
  );
}
