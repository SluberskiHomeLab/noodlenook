import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  LogOut, 
  Settings, 
  BookOpen,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose
} from 'lucide-react';

function Header() {
  const { user, logout, darkMode, toggleDarkMode, toggleSidebar, sidebarPosition, changeSidebarPosition } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            padding: '0.5rem',
            borderRadius: '0.75rem',
          }}
          className="btn-secondary"
        >
          <Menu size={20} />
        </button>
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <BookOpen size={28} color="var(--primary-color)" />
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            margin: 0 
          }}>
            NoodleNook
          </h1>
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)'
            }} 
          />
          <input
            type="text"
            placeholder="Search wiki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={toggleDarkMode}
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '0.75rem' }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '0.75rem' }}
            title="Settings"
          >
            <Settings size={20} />
          </button>

          {showSettings && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1rem',
              minWidth: '200px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sidebar Position</strong>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => changeSidebarPosition('left')}
                    className={sidebarPosition === 'left' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    <PanelLeftClose size={16} />
                  </button>
                  <button
                    onClick={() => changeSidebarPosition('right')}
                    className={sidebarPosition === 'right' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    <PanelRightClose size={16} />
                  </button>
                  <button
                    onClick={() => changeSidebarPosition('top')}
                    className={sidebarPosition === 'top' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    <PanelTopClose size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {user.username} ({user.role})
            </span>
            {user.role === 'admin' && (
              <Link to="/admin">
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
                  Admin
                </button>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem' }}>
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
