import { useState, useMemo } from 'react';
import { Search, Calendar, BookOpen, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import WordCard from '../components/WordCard';
import './WordForTheDay.css';

export default function WordForTheDay() {
  const { publishedPosts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    return publishedPosts
      .filter(post => {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.scripture.toLowerCase().includes(query) ||
          post.scripture_reference.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime();
        const dateB = new Date(b.published_at || b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [publishedPosts, searchQuery, sortOrder]);

  const latestPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="word-archive-page">
      {/* Header Banner */}
      <section className="archive-header-banner">
        <div className="archive-header-container">
          <div className="archive-badge">
            <BookOpen size={16} />
            <span>Daily Devotional & Teachings</span>
          </div>
          <h1>Word for the Day Archive</h1>
          <p>
            Explore our repository of scripture-grounded messages and practical wisdom for building healthy, flourishing relationships.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="archive-container">
        {/* Search & Filter Toolbar */}
        <div className="archive-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by topic, scripture, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="clear-search-btn"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sort-wrapper">
            <Filter size={16} className="sort-icon" />
            <label htmlFor="sortSelect" className="sr-only">Sort by date</label>
            <select 
              id="sortSelect"
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-meta">
          <span>Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'message' : 'messages'}</span>
        </div>

        {/* Empty Search State */}
        {filteredPosts.length === 0 ? (
          <div className="archive-empty">
            <h3>No messages found</h3>
            <p>Try searching for a different keyword or scripture reference.</p>
            <button onClick={() => setSearchQuery('')} className="reset-search-btn">
              Reset Search
            </button>
          </div>
        ) : (
          <div className="archive-content">
            {/* Show Featured Hero for latest entry when not searching */}
            {!searchQuery && latestPost && (
              <div className="latest-highlight-wrapper">
                <span className="highlight-tag">Latest Published Word</span>
                <WordCard post={latestPost} featured={true} />
              </div>
            )}

            {/* Grid of Remaining or All Filtered Posts */}
            <div className="archive-grid-section">
              {!searchQuery && remainingPosts.length > 0 && (
                <h2 className="archive-grid-heading">Previous Messages</h2>
              )}
              
              <div className="posts-archive-grid">
                {(searchQuery ? filteredPosts : remainingPosts).map(post => (
                  <WordCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
