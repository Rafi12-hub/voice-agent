import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CoachingReport } from '../types';

export const Performance: React.FC = () => {
  const { coachingReports, addCoachingReport, updateCoachingReport } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Coaching Plan state
  const [newAgentName, setNewAgentName] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleSignOff = (id: string) => {
    updateCoachingReport(id, { growthScore: 100 });
    alert('Coaching assignment verified and archived in DB.');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;

    const newReport: CoachingReport = {
      id: `rpt_${Date.now()}`,
      agentId: `agt_${Math.floor(Math.random() * 9000) + 1000}`,
      agentName: newAgentName,
      managerId: 'mgr_9921',
      managerName: 'Sarah Jenkins',
      date: Date.now(),
      skillsAssessed: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      growthScore: 0,
      notes: newNotes || 'Initial plan created.',
      challenges: ['Adherence to templates']
    };

    addCoachingReport(newReport);
    setShowAddForm(false);
    
    // Clear states
    setNewAgentName('');
    setNewSkills('');
    setNewNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Coaching & Performance Center</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track supervisor check-offs and construct custom agent growth paths</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            background: 'var(--color-brand)', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-sm)', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="gradient-card-hover"
        >
          <Plus size={16} />
          <span>New Coaching Path</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Growth Completion</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-brand)', marginTop: '6px' }}>
            {Math.round(coachingReports.filter(r => r.growthScore === 100).length / (coachingReports.length || 1) * 100)}%
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Coaching sessions fully signed-off</p>
        </div>

        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Average Team Ramp-up</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)', marginTop: '6px' }}>82%</div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Grade improvements post-coaching</p>
        </div>

        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Open Training Cases</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-warning)', marginTop: '6px' }}>
            {coachingReports.filter(r => r.growthScore < 100).length}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active paths requiring sign-off</p>
        </div>
      </div>

      {/* Add Coaching Form Overlay */}
      {showAddForm && (
        <form onSubmit={handleCreatePlan} className="glass fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Construct New Coaching Growth Path</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Agent Name</label>
              <input 
                type="text" 
                placeholder="e.g. David Miller" 
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Target Skills (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Compliance, Active Listening" 
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Target Plan Goals</label>
            <textarea 
              rows={3} 
              placeholder="Outline specific objectives or script pivots for this agent..." 
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', background: 'var(--color-brand)', color: 'white', fontWeight: '600' }}
            >
              Create Coaching Path
            </button>
          </div>
        </form>
      )}

      {/* Active Plans List */}
      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Active Performance Growth Paths</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {coachingReports.map((report) => (
            <div 
              key={report.id}
              style={{ 
                padding: '20px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '70%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{report.agentName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created by Sarah Jenkins</span>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{report.notes}</p>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {report.skillsAssessed.map((skill, i) => (
                    <span key={i} className="badge badge-info" style={{ fontSize: '9px', padding: '2px 8px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '180px', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Progression Status</span>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: report.growthScore === 100 ? 'var(--color-success)' : 'var(--color-warning)',
                    marginTop: '2px'
                  }}>
                    {report.growthScore === 100 ? '100% (Signed Off)' : `${report.growthScore}% (In-Training)`}
                  </div>
                </div>

                {report.growthScore < 100 && (
                  <button 
                    onClick={() => handleSignOff(report.id)}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--color-success)',
                      cursor: 'pointer' 
                    }}
                    title="Mark coaching completed and sign off"
                  >
                    <UserCheck size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
