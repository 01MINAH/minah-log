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

  // Code syntax highlighting with PrismJS
  useEffect(() => {
    if (isLoading || error || !htmlContent) return;

    const loadPrism = () => {
      // 1. Load Prism CSS Tomorrow theme if not present
      if (!document.getElementById('prism-css')) {
        const link = document.createElement('link');
        link.id = 'prism-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(link);
      }

      // 2. Load Prism Core JS
      if (!document.getElementById('prism-js')) {
        const script = document.createElement('script');
        script.id = 'prism-js';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js';
        script.setAttribute('data-manual', 'true');
        
        script.onload = () => {
          // 3. Load Prism Autoloader plugin
          const autoloader = document.createElement('script');
          autoloader.id = 'prism-autoloader';
          autoloader.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js';
          autoloader.onload = () => {
            if (window.Prism && window.Prism.plugins && window.Prism.plugins.autoloader) {
              window.Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
              window.Prism.highlightAll();
            }
          };
          document.body.appendChild(autoloader);
        };
        document.body.appendChild(script);
      } else {
        // Highlight if Prism & autoloader are already initialized
        if (window.Prism && window.Prism.plugins && window.Prism.plugins.autoloader) {
          window.Prism.highlightAll();
        } else {
          // Fallback check if scripts are still loading
          const checkInterval = setInterval(() => {
            if (window.Prism && window.Prism.plugins && window.Prism.plugins.autoloader) {
              window.Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
              window.Prism.highlightAll();
              clearInterval(checkInterval);
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 3000);
        }
      }
    };

    // Delay slightly to ensure DOM has rendered
    const timer = setTimeout(loadPrism, 50);
    return () => clearTimeout(timer);
  }, [htmlContent, isLoading, error]);

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
