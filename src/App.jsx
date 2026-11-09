import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { StreakProvider } from './context/StreakContext';

// Public Components & Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import WordForTheDay from './pages/WordForTheDay';
import WordDetail from './pages/WordDetail';

import Videos from './pages/Videos';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminPosts from './pages/admin/AdminPosts';
import AdminVideos from './pages/admin/AdminVideos';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

import './App.css';

// Layout wrapper for Public Pages (Navbar + Outlet + Footer)
function PublicLayout() {
  return (
    <div className="public-site-layout">
      <Navbar />
      <main className="public-main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <StreakProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="word-for-the-day" element={<WordForTheDay />} />
                <Route path="word/:id" element={<WordDetail />} />
                
                <Route path="videos" element={<Videos />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Portal */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<PublicLayout />}>
                <Route index element={<Home />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </StreakProvider>
      </DataProvider>
    </AuthProvider>
  );
}
