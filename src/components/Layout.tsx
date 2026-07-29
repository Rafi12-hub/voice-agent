import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PhoneCall,
  Bell,
  Database,
  CheckCircle,
  AlertTriangle,
  Activity,
  Menu,
  X,
  Mic,
  Trophy,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    syncStatus,
    setSelectedCall,
    syncFromFirebase
  } = useAppStore();

  React.useEffect(() => {
    syncFromFirebase();
  }, [syncFromFirebase]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    setShowNotifications(false);
    if (n.referenceId) {
      const { calls } = useAppStore.getState();
      const call = calls.find(c => c.id === n.referenceId);
      if (call) {
        setSelectedCall(call);
        navigate(`/calls`);
      }
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Analytics', path: '/analytics', icon: Activity },
    { label: 'Record', path: '/record', icon: Mic },
    { label: 'Call Library', path: '/calls', icon: PhoneCall },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Coach', path: '/coach', icon: Sparkles },
  ];

  const handleSyncTrigger = async () => {
    await syncFromFirebase();
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar glass ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon gradient-brand">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="logo-text gradient-text">EchoVoice AI</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-4px' }}>Voice QA Platform</p>
          </div>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>SJ</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser.displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>QA Manager</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            className="gradient-card-hover"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        {/* Topbar Header */}
        <header className="topbar glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-toggle"
              style={{ display: 'none', color: 'var(--text-primary)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                onClick={handleSyncTrigger}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 12px', 
                  borderRadius: 'var(--radius-full)', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                className="gradient-card-hover"
                title="Click to manually synchronize database"
              >
                <Database size={13} color={syncStatus === 'synced' ? 'var(--color-success)' : syncStatus === 'syncing' ? 'var(--color-warning)' : 'var(--text-muted)'} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {syncStatus === 'synced' ? 'Firebase Live' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ 
                  position: 'relative', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <Bell size={18} />
                {unreadNotifications.length > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: 'var(--color-danger)'
                  }} />
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div 
                  className="glass"
                  style={{ 
                    position: 'absolute', 
                    top: '52px', 
                    right: 0, 
                    width: '340px', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '16px', 
                    zIndex: 100,
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>Alert Center</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{unreadNotifications.length} Active Alerts</span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No alerts triggered. Everything quiet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{ 
                            padding: '10px', 
                            borderRadius: 'var(--radius-sm)', 
                            background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${n.read ? 'transparent' : 'var(--border-color)'}`,
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                          className="gradient-card-hover"
                        >
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            {n.type === 'compliance_violation' ? (
                              <AlertTriangle size={15} color="var(--color-danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            ) : (
                              <CheckCircle size={15} color="var(--color-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            )}
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: n.read ? '500' : '600', color: 'var(--text-primary)' }}>{n.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>{n.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Welcome, <strong>{currentUser.displayName}</strong></span>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <div className="page-wrapper fade-in">
          {children}
        </div>
      </main>

      {/* Basic Mobile Responsive Adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -260px;
            z-index: 200;
            transition: transform 0.3s ease;
          }
          .sidebar.mobile-open {
            transform: translateX(260px);
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
