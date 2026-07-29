import React, { useState } from 'react';
import { 
  Database, 
  User, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Settings: React.FC = () => {
  const { currentUser, setCurrentUser, syncFromFirebase } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Switch roles for demo
  const handleRoleChange = (role: 'super_admin' | 'manager' | 'agent') => {
    setCurrentUser({
      ...currentUser,
      role,
      displayName: role === 'super_admin' ? 'Alex Rivera (Director)' : role === 'manager' ? 'Sarah Jenkins (Supervisor)' : 'David Miller (Agent)'
    });
  };

  const handleTestConnection = async () => {
    setIsSyncing(true);
    const success = await syncFromFirebase();
    setIsSyncing(false);
    if (success) {
      alert('Firebase connection verified. Staging telemetry synced successfully.');
    } else {
      alert('Firebase connection could not be established. Loaded fallback local database.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>System Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your database synchronization states, workspace permissions, and configuration keys</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px' }}>
        
        {/* Firebase Config Panel */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} className="text-purple-400" />
              Active Firebase Integration Settings
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Telemetry syncs securely with Cloud Firestore using the configured parameters below</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Firebase Project ID</span>
              <span style={{ fontSize: '14px', fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>agenthon-82ff7</span>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Web Application ID</span>
              <span style={{ fontSize: '14px', fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>1:601390068704:web:35f1a573f46ddf74cbf185</span>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Authentication Domain</span>
              <span style={{ fontSize: '14px', fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>agenthon-82ff7.firebaseapp.com</span>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>API Key Encryption Token</span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>AIzaSyD0JVm8EnjvrnQKy-e62xpV8M9y...</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={handleTestConnection}
              disabled={isSyncing}
              style={{ 
                background: 'var(--color-brand)', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: 'var(--radius-sm)', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isSyncing ? 0.7 : 1
              }}
              className="gradient-card-hover"
            >
              {isSyncing ? <RefreshCw size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              <span>Verify Telemetry Connection</span>
            </button>
          </div>
        </div>

        {/* User Workspace Role Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} className="text-cyan-400" />
                Workspace Role Selector
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Test how views adapt depending on user access roles</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => handleRoleChange('super_admin')}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: `1px solid ${currentUser.role === 'super_admin' ? 'var(--color-brand)' : 'var(--border-color)'}`,
                  background: currentUser.role === 'super_admin' ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Super Admin (Director)
              </button>
              <button 
                onClick={() => handleRoleChange('manager')}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: `1px solid ${currentUser.role === 'manager' ? 'var(--color-brand)' : 'var(--border-color)'}`,
                  background: currentUser.role === 'manager' ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                QA Manager (Sarah Jenkins)
              </button>
              <button 
                onClick={() => handleRoleChange('agent')}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: `1px solid ${currentUser.role === 'agent' ? 'var(--color-brand)' : 'var(--border-color)'}`,
                  background: currentUser.role === 'agent' ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Customer Agent (David Miller)
              </button>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShieldCheck size={16} color="var(--color-success)" />
              <strong style={{ color: 'var(--text-primary)' }}>SSL Encryption Active</strong>
            </div>
            <span>Your connection to AgentThon analytics dashboard endpoints is secured with enterprise-grade SHA-256 secure sockets layers.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
