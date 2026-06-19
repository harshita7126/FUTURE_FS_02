import { useState, useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GitMerge, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Bot
} from 'lucide-react';

export const Layout = ({ children, onOpenAssistant, onOpenPalette }) => {
  const { 
    activeView, 
    setActiveView, 
    notifications, 
    markNotifAsRead, 
    clearAllNotifications,
    logout,
    user 
  } = useCRM();
  const { theme, toggleTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { view: 'leads', label: 'Leads', icon: <Users size={18} /> },
    { view: 'customers', label: 'Customers', icon: <UserCheck size={18} /> },
    { view: 'pipeline', label: 'Pipeline', icon: <GitMerge size={18} /> },
    { view: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
    { view: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { view: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Sidebar - Notion / Linear styled */}
      <aside 
        style={{
          width: sidebarOpen ? '260px' : '0px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 90
        }}
      >
        {/* Sidebar Header */}
        <div 
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: '#ffffff'
            }}
          >
            <span style={{ fontWeight: '800', fontSize: '16px' }}>N</span>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1 }}>Nexus</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Workspace: Active</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setActiveView(item.view);
                  if (window.innerWidth <= 768) setSidebarOpen(false);
                }}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div 
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {(user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || 'U')
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h5 
                style={{ fontSize: '13px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                title={user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || 'Workspace Representative'}
              >
                {user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || 'User'}
              </h5>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {user?.user_metadata?.role || 'Sales Representative'}
              </span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="btn btn-ghost" 
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', color: 'var(--error-text)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        {/* Header Bar */}
        <header 
          className="glass-panel"
          style={{
            height: '64px',
            minHeight: '64px',
            borderLeft: 'none',
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: 0,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 80
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '8px', borderRadius: '6px' }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'capitalize' }}>
              {activeView === 'pipeline' ? 'Sales Pipeline' : activeView}
            </h2>
          </div>

          {/* Quick Actions & Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Search/Command Palette Trigger (Ctrl+K) */}
            <button 
              onClick={onOpenPalette}
              className="btn btn-secondary"
              style={{ 
                padding: '6px 12px', 
                fontSize: '13px', 
                color: 'var(--text-secondary)',
                gap: '8px'
              }}
            >
              <Search size={14} />
              <span style={{ display: 'none', md: 'inline' }}>Quick search...</span>
              <kbd 
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: 'var(--text-muted)'
                }}
              >
                Ctrl+K
              </kbd>
            </button>

            {/* AI Assistant Toggle Button */}
            <button 
              onClick={onOpenAssistant}
              className="btn btn-secondary" 
              style={{ 
                padding: '8px 12px', 
                background: 'var(--accent-light)', 
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                gap: '6px'
              }}
            >
              <Bot size={16} />
              <span style={{ fontWeight: 600 }}>AI Assistant</span>
            </button>

            {/* Notifications Center */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ padding: '8px', position: 'relative', borderRadius: '50%' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--error)'
                    }}
                  />
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {notifOpen && (
                <div 
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0px',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '16px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '16px 0' }}>
                        No new notifications.
                      </p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => markNotifAsRead(notif.id)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: notif.read ? 'transparent' : 'var(--bg-hover)',
                            border: '1px solid',
                            borderColor: notif.read ? 'transparent' : 'var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span 
                              style={{ 
                                fontSize: '12px', 
                                fontWeight: 600,
                                color: notif.type === 'error' ? 'var(--error-text)' : 
                                       notif.type === 'warning' ? 'var(--warning-text)' : 
                                       notif.type === 'success' ? 'var(--success-text)' : 'var(--text-primary)'
                              }}
                            >
                              {notif.title}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{notif.time}</span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button 
              className="btn btn-ghost" 
              onClick={toggleTheme}
              style={{ padding: '8px', borderRadius: '50%' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* View Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
