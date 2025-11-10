import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, FileText, Type } from 'lucide-react';
import { pages } from '../utils/api';
import MarkdownToolbar from '../components/MarkdownToolbar';
import RichTextToolbar from '../components/RichTextToolbar';

function PageEditor() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [contentType, setContentType] = useState('markdown');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (slug) {
      setIsEditMode(true);
      loadPage();
    }
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await pages.getBySlug(slug);
      const page = response.data;
      setTitle(page.title);
      setContent(page.content);
      setPageSlug(page.slug);
      setContentType(page.content_type);
      setCategory(page.category || '');
      setIsPublic(page.is_public || false);
    } catch (err) {
      setError('Failed to load page');
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditMode) {
      setPageSlug(generateSlug(newTitle));
    }
  };

  const handleInsert = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    // Insert the syntax with the selected text or placeholder
    const newText = beforeText + prefix + (selectedText || '') + suffix + afterText;
    setContent(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 0);
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        const response = await pages.update(slug, { title, content, content_type: contentType, category, is_public: isPublic });
        
        // Check if edit requires approval
        if (response.data.requires_approval) {
          alert('Your edit has been submitted for approval. An admin will review it shortly.');
          navigate('/pending-edits');
        } else {
          navigate(`/page/${pageSlug}`);
        }
      } else {
        await pages.create({ title, slug: pageSlug, content, content_type: contentType, category, is_public: isPublic });
        navigate(`/page/${pageSlug}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Page' : 'Create New Page'}
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setContentType('markdown')}
              className={contentType === 'markdown' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileText size={18} />
              Markdown
            </button>
            <button
              onClick={() => setContentType('html')}
              className={contentType === 'html' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Type size={18} />
              Rich Text
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fee',
              border: '1px solid var(--danger-color)',
              borderRadius: '0.375rem',
              color: 'var(--danger-color)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              disabled={loading}
              placeholder="Enter page title"
              style={{ fontSize: '1.25rem', fontWeight: '500' }}
            />
          </div>

          {!isEditMode && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Slug (URL)
              </label>
              <input
                type="text"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                required
                disabled={loading}
                placeholder="page-url-slug"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Category (optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              placeholder="e.g., Documentation, Guides, Tutorials"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={loading}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span>Make this page public (visible to non-logged-in users)</span>
            </label>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              marginLeft: '1.75rem'
            }}>
              By default, pages are only visible to logged-in users
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Content
            </label>
            {contentType === 'markdown' && <MarkdownToolbar onInsert={handleInsert} />}
            {contentType === 'html' && <RichTextToolbar onInsert={handleInsert} />}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              placeholder={
                contentType === 'markdown' 
                  ? 'Write in Markdown...\n\n# Heading\n\nParagraph text...' 
                  : 'Write your content...'
              }
              style={{ 
                minHeight: '400px',
                fontFamily: contentType === 'markdown' ? 'monospace' : 'inherit',
                fontSize: contentType === 'markdown' ? '0.875rem' : '1rem'
              }}
            />
            {contentType === 'markdown' && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
              }}>
                Supports Markdown syntax: **bold**, *italic*, # headings, [links](url), etc.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : (isEditMode ? 'Update Page' : 'Create Page')}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/page/${slug}` : '/')}
              className="btn-secondary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PageEditor;
