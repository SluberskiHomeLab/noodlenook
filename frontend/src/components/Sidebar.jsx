import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Home, List } from 'lucide-react';
import { pages } from '../utils/api';
import { useApp } from '../App';

function Sidebar() {
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, sidebarPosition, tocStyle, changeTocStyle } = useApp();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await pages.getAll();
      setAllPages(response.data);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupPagesByFirstLetter = () => {
    const grouped = {};
    allPages.forEach(page => {
      const firstLetter = page.title[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(page);
    });
    return grouped;
  };

  const renderNestedList = () => {
    const grouped = groupPagesByFirstLetter();
    return Object.entries(grouped).sort().map(([letter, pages]) => (
      <div key={letter} style={{ marginBottom: '1rem' }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: 'var(--primary-color)', 
          marginBottom: '0.5rem',
          fontSize: '1.1rem'
        }}>
          {letter}
        </div>
        {pages.map(page => (
          <Link
            key={page.id}
            to={`/page/${page.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '0.25rem',
              marginLeft: '1rem',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FileText size={16} />
            <span style={{ fontSize: '0.875rem' }}>{page.title}</span>
          </Link>
        ))}
      </div>
    ));
  };

  const renderFlatList = () => {
    return allPages.map(page => (
      <Link
        key={page.id}
        to={`/page/${page.slug}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '0.25rem',
          color: 'var(--text-primary)',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FileText size={16} />
        <span style={{ fontSize: '0.875rem' }}>{page.title}</span>
      </Link>
    ));
  };

  return (
    <aside style={{
      width: sidebarPosition === 'top' ? '100%' : '280px',
      backgroundColor: 'var(--bg-primary)',
      borderRight: sidebarPosition !== 'top' ? '1px solid var(--border-color)' : 'none',
      borderBottom: sidebarPosition === 'top' ? '1px solid var(--border-color)' : 'none',
      padding: '1.5rem',
      overflowY: 'auto',
      height: sidebarPosition === 'top' ? 'auto' : '100%',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <Home size={18} />
            Dashboard
          </button>
        </Link>

        {user && (user.role === 'editor' || user.role === 'admin') && (
          <Link to="/new">
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Plus size={18} />
              New Page
            </button>
          </Link>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 'bold', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Pages
          </h3>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => changeTocStyle('flat')}
              className={tocStyle === 'flat' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.25rem', fontSize: '0.75rem' }}
              title="Flat list"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => changeTocStyle('nested')}
              className={tocStyle === 'nested' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.25rem', fontSize: '0.75rem' }}
              title="Grouped by letter"
            >
              A-Z
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            Loading...
          </div>
        ) : allPages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            No pages yet
          </div>
        ) : (
          <div>
            {tocStyle === 'nested' ? renderNestedList() : renderFlatList()}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
