import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'grr_auth_session';

const VALID_ADMIN_EMAILS = [
  'admin@gracedrelationships.com', 
  'sentannie@gmail.com', 
  'admin@gracerelationships.com'
];
const VALID_ADMIN_PASSWORDS = ['graced2026', 'grace2026'];

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

  // Strict administrator authentication
  const login = async (email, password) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    if (VALID_ADMIN_EMAILS.includes(inputEmail) && VALID_ADMIN_PASSWORDS.includes(inputPassword)) {
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
      error: 'Access denied: Invalid administrator email or password.' 
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
