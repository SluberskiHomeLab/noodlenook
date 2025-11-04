import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PageView from './pages/PageView';
import PageEditor from './pages/PageEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';

import { auth } from './utils/api';

// Create context for global state
export const AppContext = createContext();

export const useApp = () => useContext(AppContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [sidebarPosition, setSidebarPosition] = useState(() => {
    const saved = localStorage.getItem('sidebarPosition');
    return saved || 'left';
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const [tocStyle, setTocStyle] = useState(() => {
    const saved = localStorage.getItem('tocStyle');
    return saved || 'nested';
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      auth.me()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarPosition', sidebarPosition);
  }, [sidebarPosition]);

  useEffect(() => {
    localStorage.setItem('tocStyle', tocStyle);
  }, [tocStyle]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const changeSidebarPosition = (position) => {
    setSidebarPosition(position);
  };

  const changeTocStyle = (style) => {
    setTocStyle(style);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const contextValue = {
    user,
    login,
    logout,
    darkMode,
    toggleDarkMode,
    sidebarPosition,
    changeSidebarPosition,
    showSidebar,
    toggleSidebar,
    tocStyle,
    changeTocStyle,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {sidebarPosition === 'left' && showSidebar && <Sidebar />}
            <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/page/:slug" element={<PageView />} />
                <Route 
                  path="/edit/:slug" 
                  element={
                    user && (user.role === 'editor' || user.role === 'admin') 
                      ? <PageEditor /> 
                      : <Navigate to="/" />
                  } 
                />
                <Route 
                  path="/new" 
                  element={
                    user && (user.role === 'editor' || user.role === 'admin') 
                      ? <PageEditor /> 
                      : <Navigate to="/" />
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    user && user.role === 'admin' 
                      ? <AdminDashboard /> 
                      : <Navigate to="/" />
                  } 
                />
              </Routes>
            </main>
            {sidebarPosition === 'right' && showSidebar && <Sidebar />}
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
