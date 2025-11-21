import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, Home, List, FolderOpen, Clock, User, GripVertical } from 'lucide-react';
import { pages, settings } from '../utils/api';
import { useApp } from '../App';

function Sidebar() {
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, sidebarPosition, tocStyle, changeTocStyle } = useApp();
  const DEFAULT_SORT = 'alphabetical';
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [draggedPage, setDraggedPage] = useState(null);
  const [sortInitialized, setSortInitialized] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadDefaultSortOrder();
    loadSortDropdownSetting();
    loadPages();
  }, []);

  // Reload pages when navigating to ensure sidebar shows latest pages
  useEffect(() => {
    loadPages();
  }, [location.pathname]);

  useEffect(() => {
    // Only save to localStorage after initial load is complete
    if (sortInitialized) {
      localStorage.setItem('sortBy', sortBy);
    }
  }, [sortBy, sortInitialized]);

  const loadDefaultSortOrder = async () => {
    try {
      const response = await settings.getPublic('default_sort_order');
      const serverDefault = response.data.value || DEFAULT_SORT;
      const saved = localStorage.getItem('sortBy');
      
      // Use saved preference if exists, otherwise use server default
      setSortBy(saved || serverDefault);
      setSortInitialized(true);
    } catch (error) {
      // If setting doesn't exist or error occurs, use localStorage or default
      const saved = localStorage.getItem('sortBy');
      setSortBy(saved || DEFAULT_SORT);
      setSortInitialized(true);
      console.log('Using default sort order');
    }
  };

  const loadSortDropdownSetting = async () => {
    try {
      const response = await settings.getPublic('show_sort_dropdown');
      const showDropdown = response.data.value !== 'false';
      setShowSortDropdown(showDropdown);
    } catch (error) {
      // If setting doesn't exist or error occurs, default to true
      setShowSortDropdown(true);
      console.log('Using default sort dropdown setting');
    }
  };

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

  const handleDragStart = (e, page) => {
    if (user && user.role === 'admin') {
      setDraggedPage(page);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e) => {
    if (user && user.role === 'admin') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = async (e, targetPage) => {
    e.preventDefault();
    if (user && user.role === 'admin' && draggedPage && draggedPage.id !== targetPage.id) {
      try {
        // Update the order in the backend
        const draggedIndex = allPages.findIndex(p => p.id === draggedPage.id);
        const targetIndex = allPages.findIndex(p => p.id === targetPage.id);
        
        // Create a new array with updated order
        const newPages = [...allPages];
        newPages.splice(draggedIndex, 1);
        newPages.splice(targetIndex, 0, draggedPage);
        
        // Update display_order for all affected pages using Promise.all for concurrent updates
        const updatePromises = newPages.map((page, index) => 
          pages.updateOrder(page.slug, index)
        );
        await Promise.all(updatePromises);
        
        setAllPages(newPages);
      } catch (error) {
        console.error('Error updating page order:', error);
      }
    }
    setDraggedPage(null);
  };

  const getSortedPages = () => {
    let sorted = [...allPages];
    
    switch (sortBy) {
      case 'category':
        sorted.sort((a, b) => {
          const catA = a.category || 'Uncategorized';
          const catB = b.category || 'Uncategorized';
          if (catA === catB) {
            return a.title.localeCompare(b.title);
          }
          return catA.localeCompare(catB);
        });
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'creator':
        sorted.sort((a, b) => {
          const authorA = a.author_name || 'Unknown';
          const authorB = b.author_name || 'Unknown';
          if (authorA === authorB) {
            return a.title.localeCompare(b.title);
          }
          return authorA.localeCompare(authorB);
        });
        break;
      case 'custom':
        sorted.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        break;
      case 'alphabetical':
      default:
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return sorted;
  };

  const groupPagesByFirstLetter = () => {
    const grouped = {};
    const sortedPages = getSortedPages();
    sortedPages.forEach(page => {
      if (!page.title || page.title.length === 0) return;
      const firstLetter = page.title[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(page);
    });
    return grouped;
  };

  const groupPagesByCategory = () => {
    const grouped = {};
    const sortedPages = getSortedPages();
    sortedPages.forEach(page => {
      const category = page.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(page);
    });
    return grouped;
  };

  const groupPagesByCreator = () => {
    const grouped = {};
    const sortedPages = getSortedPages();
    sortedPages.forEach(page => {
      const creator = page.author_name || 'Unknown';
      if (!grouped[creator]) {
        grouped[creator] = [];
      }
      grouped[creator].push(page);
    });
    return grouped;
  };

  const renderPageLink = (page, draggable = false) => (
    <Link
      key={page.id}
      to={`/page/${page.slug}`}
      draggable={draggable}
      onDragStart={(e) => handleDragStart(e, page)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, page)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        marginBottom: '0.25rem',
        marginLeft: sortBy === 'category' || sortBy === 'creator' || tocStyle === 'nested' ? '1rem' : '0',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease',
        cursor: draggable ? 'grab' : 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {draggable && user && user.role === 'admin' && <GripVertical size={14} style={{ opacity: 0.5 }} />}
      <FileText size={16} />
      <span style={{ fontSize: '0.875rem' }}>{page.title}</span>
    </Link>
  );

  const renderNestedList = () => {
    if (sortBy === 'category') {
      const grouped = groupPagesByCategory();
      return Object.entries(grouped).sort().map(([category, pages]) => (
        <div key={category} style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: 'var(--primary-color)', 
            marginBottom: '0.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FolderOpen size={16} />
            {category}
          </div>
          {pages.map(page => renderPageLink(page, sortBy === 'custom'))}
        </div>
      ));
    } else if (sortBy === 'creator') {
      const grouped = groupPagesByCreator();
      return Object.entries(grouped).sort().map(([creator, pages]) => (
        <div key={creator} style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: 'var(--primary-color)', 
            marginBottom: '0.5rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={16} />
            {creator}
          </div>
          {pages.map(page => renderPageLink(page, sortBy === 'custom'))}
        </div>
      ));
    } else {
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
          {pages.map(page => renderPageLink(page, sortBy === 'custom'))}
        </div>
      ));
    }
  };

  const renderFlatList = () => {
    const sortedPages = getSortedPages();
    return sortedPages.map(page => renderPageLink(page, sortBy === 'custom'));
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
              style={{ padding: '0.25rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
              title="Flat list"
            >
              <List size={14} />
            </button>
            {sortBy !== 'custom' && (
              <button
                onClick={() => changeTocStyle('nested')}
                className={tocStyle === 'nested' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.25rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                title="Grouped view"
              >
                A-Z
              </button>
            )}
          </div>
        </div>

        {showSortDropdown && (
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '0.25rem',
              display: 'block'
            }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="category">Category</option>
              <option value="recent">Recently Created</option>
              <option value="creator">Creator</option>
              {user && user.role === 'admin' && (
                <option value="custom">Custom Order (Drag)</option>
              )}
            </select>
          </div>
        )}

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
