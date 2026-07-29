import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Target, Lightbulb, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Coach: React.FC = () => {
  const { calls, coachingReports } = useAppStore();

  const lowScoringCalls = useMemo(() =>
    calls.filter(c => c.score < 70).sort((a, b) => a.score - b.score),
    [calls]
  );

  const topOpportunities = useMemo(() => {
    const weaknesses = new Map<string, number>();
    calls.forEach(c => c.coaching.weaknesses.forEach(w => {
      weaknesses.set(w, (weaknesses.get(w) || 0) + 1);
    }));
    return Array.from(weaknesses.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [calls]);

  const pendingPlans = coachingReports.filter(r => r.growthScore < 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>AI Coaching Center</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Personalized coaching plans and performance improvement recommendations</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass gradient-card-hover">
          <span className="kpi-title">Active Coaching Plans</span>
          <div className="kpi-val" style={{ color: 'var(--color-brand)' }}>{pendingPlans.length}</div>
          <div className="kpi-sub">{coachingReports.length} total plans created</div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <span className="kpi-title">Calls Needing Review</span>
          <div className="kpi-val" style={{ color: 'var(--color-danger)' }}>{lowScoringCalls.length}</div>
          <div className="kpi-sub">Scored below 70% threshold</div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <span className="kpi-title">Coaching Completion</span>
          <div className="kpi-val" style={{ color: 'var(--color-success)' }}>
            {Math.round(coachingReports.filter(r => r.growthScore === 100).length / (coachingReports.length || 1) * 100)}%
          </div>
          <div className="kpi-sub">Plans fully signed off</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} color="var(--color-danger)" />
            Priority Coaching Needs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topOpportunities.map(([weakness, count], i) => (
              <div key={i} style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{weakness}</span>
                <span className="badge badge-danger" style={{ fontSize: '10px', padding: '2px 8px' }}>{count}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={16} color="var(--color-warning)" />
            Recommended Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowScoringCalls.slice(0, 4).map(call => (
              <Link
                key={call.id}
                to="/calls"
                onClick={() => useAppStore.getState().setSelectedCall(call)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                className="gradient-card-hover"
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{call.agentName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{call.title.slice(0, 40)}...</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: call.score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}>
                    {call.score}%
                  </span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="var(--color-info)" />
          Active Coaching Paths
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingPlans.map(report => (
            <div key={report.id} style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{report.agentName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{report.notes.slice(0, 60)}...</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {report.skillsAssessed.map((skill, i) => (
                    <span key={i} className="badge badge-info" style={{ fontSize: '9px', padding: '2px 8px' }}>{skill}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: report.growthScore >= 75 ? 'var(--color-success)' : 'var(--color-warning)'
                }}>
                  {report.growthScore}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Growth</div>
              </div>
            </div>
          ))}
          {pendingPlans.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
              <p>All coaching plans are completed! Great work team.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
