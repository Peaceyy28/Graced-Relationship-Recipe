import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'grr_auth_session';

// SHA-256 cryptographic helper using Web Crypto API
async function sha256(str) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

// Authorized administrator emails
const AUTHORIZED_EMAILS = [
  'admin@gracerelationships.com',
  'sentannie@gmail.com',
  'admin@gracedrelationships.com'
];

// Cryptographic hashes of authorized master keys (no plaintext passwords in repository)
const AUTHORIZED_KEY_HASHES = [
  '15364102026489391938ac9eed936602c1520742890b410b4ca1a4f541fd1e9f',
  '2302e9beb1e4dca2526c81b6c2d3e6dc058e2dae8df841d9c7b3a580bf6ac7fe'
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  // Secure administrator authentication
  const login = async (email, password) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (!inputEmail || !inputPassword) {
      return { success: false, error: 'Email and password are required.' };
    }

    const envEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
    const isEmailValid = AUTHORIZED_EMAILS.includes(inputEmail) || (envEmail && inputEmail === envEmail);

    if (!isEmailValid) {
      return { success: false, error: 'Access denied: Unrecognized administrator email.' };
    }

    const inputHash = await sha256(inputPassword);
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';
    const customHash = localStorage.getItem('grr_custom_admin_hash') || '';

    const isPasswordValid = 
      AUTHORIZED_KEY_HASHES.includes(inputHash) || 
      (envPassword && inputPassword === envPassword) ||
      (customHash && inputHash === customHash);

    if (isPasswordValid) {
      const adminUser = {
        id: 'usr-admin-1',
        email: inputEmail,
        full_name: 'Anuoluwapo Oluwagbayela Serah',
        role: 'admin',
        login_at: new Date().toISOString()
      };
      setUser(adminUser);
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Access denied: Invalid administrator password.' 
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
