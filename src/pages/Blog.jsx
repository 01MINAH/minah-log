import React from 'react';
import { Link } from 'react-router-dom';
import { postsData } from '../config/postsData';
import { getPublicUrl } from '../utils/url';

const Blog = () => {
  const [sortOption, setSortOption] = React.useState('latest'); // 'latest' or 'date'
  const [selectedTag, setSelectedTag] = React.useState('');

  // Compute unique tags
  const allTags = React.useMemo(() => {
    const tags = new Set();
    postsData.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, []);

  // Sort posts based on option
  const sortedPosts = React.useMemo(() => {
    const copy = [...postsData];
    if (sortOption === 'latest') {
      copy.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      copy.sort((a, b) => a.date.localeCompare(b.date));
    }
    return copy;
  }, [sortOption]);

  // Apply tag filter
  const displayedPosts = React.useMemo(() => {
    if (!selectedTag) return sortedPosts;
    return sortedPosts.filter(p => p.tags?.includes(selectedTag));
  }, [sortedPosts, selectedTag]);

  return (
    <div className="content-wrapper wide blog-page-container">
      <section className="blog-section">
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">학습 과정에서의 기술적 생각과 일상을 기록합니다.</p>

        <div className="blog-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}>
            <option value="latest">최신순</option>
            <option value="date">날짜순</option>
          </select>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button onClick={() => setSelectedTag('')} style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', backgroundColor: selectedTag === '' ? 'var(--primary-color)' : 'var(--primary-light)', color: selectedTag === '' ? 'var(--card-bg)' : 'var(--text-color)', border: 'none', cursor: 'pointer' }}>
              전체
            </button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setSelectedTag(tag)} style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', backgroundColor: selectedTag === tag ? 'var(--primary-color)' : 'var(--primary-light)', color: selectedTag === tag ? 'var(--card-bg)' : 'var(--text-color)', border: 'none', cursor: 'pointer' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid">
          {displayedPosts.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id} className="card">
              <div className="card-image-wrapper">
                <img src={getPublicUrl(post.image)} alt={post.title} className="card-image" />
              </div>
              <div className="card-content">
                <span className="card-date">{post.date}</span>
                <h3 className="card-title">{post.title}</h3>
                <p className="card-description">{post.description}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="card-tags">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
