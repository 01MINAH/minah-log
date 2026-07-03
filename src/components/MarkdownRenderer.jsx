import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { getPublicUrl } from '../utils/url';

// Custom header renderer to inject IDs for Table of Contents links
const renderer = {
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const escapedText = text
      .toLowerCase()
      .trim()
      .replace(/<[^>]*>/g, '') // remove HTML tags if any
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣-]/g, '') // remove special chars except spaces, alphanumeric, Korean, and hyphen
      .replace(/\s+/g, '-'); // replace spaces with hyphens
    
    return `<h${depth} id="${escapedText}">${text}</h${depth}>`;
  },
  image({ href, title, text }) {
    if (!href) return '';
    let cleanHref = href;
    if (cleanHref.includes('assets/')) {
      const idx = cleanHref.indexOf('assets/');
      cleanHref = '/' + cleanHref.substring(idx);
    }
    const resolvedUrl = getPublicUrl(cleanHref);
    return `<img src="${resolvedUrl}" alt="${text || ''}" title="${title || ''}" class="markdown-image" style="max-width: 100%; height: auto; display: block; margin: 1.5rem auto; border-radius: 8px; box-shadow: var(--shadow-sm);" />`;
  }
};

marked.use({ renderer });

const MarkdownRenderer = ({ markdownPath }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!markdownPath) {
      setError('Markdown path is missing');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(getPublicUrl(markdownPath))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load markdown content (status: ${res.status})`);
        }
        return res.text();
      })
      .then((text) => {
        // Parse markdown text using 'marked' with our custom renderer
        const parsedHtml = marked.parse(text);
        setHtmlContent(parsedHtml);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching markdown:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [markdownPath]);

  if (isLoading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span>콘텐츠를 불러오는 중입니다...</span>
          <span style={{ fontSize: '1.2rem', animation: 'fly 1s infinite alternate ease-in-out' }}>✈️</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', border: '1px solid #e53e3e', borderRadius: '8px', color: '#e53e3e', background: 'rgba(229, 62, 62, 0.05)', margin: '2rem 0' }}>
        <h4>콘텐츠 로드 실패</h4>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="markdown-body" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default MarkdownRenderer;
