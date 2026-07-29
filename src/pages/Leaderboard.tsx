import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Medal, TrendingUp, BarChart3, Award, ChevronRight } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { calls } = useAppStore();

  const agentPerformance = useMemo(() => {
    const map = new Map<string, { name: string; totalScore: number; count: number; totalEmpathy: number; totalCompliance: number; totalResolution: number }>();
    calls.forEach(c => {
      const existing = map.get(c.agentName);
      if (existing) {
        existing.totalScore += c.score;
        existing.count += 1;
        existing.totalEmpathy += c.metrics.empathy;
        existing.totalCompliance += c.metrics.compliance;
        existing.totalResolution += c.metrics.resolution;
      } else {
        map.set(c.agentName, {
          name: c.agentName,
          totalScore: c.score,
          count: 1,
          totalEmpathy: c.metrics.empathy,
          totalCompliance: c.metrics.compliance,
          totalResolution: c.metrics.resolution
        });
      }
    });
    return Array.from(map.values())
      .map(a => ({
        ...a,
        avg: Math.round(a.totalScore / a.count),
        avgEmpathy: Math.round(a.totalEmpathy / a.count),
        avgCompliance: Math.round(a.totalCompliance / a.count),
        avgResolution: Math.round(a.totalResolution / a.count)
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [calls]);

  const badgeColors = ['#fde047', '#94a3b8', '#d97706'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Agent Leaderboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Team performance rankings and quality scores</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Top Performer</span>
            <Award size={16} color="var(--color-warning)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-warning)', fontSize: '24px' }}>
            {agentPerformance[0]?.name || 'N/A'}
          </div>
          <div className="kpi-sub">
            <TrendingUp size={12} color="var(--color-success)" />
            <span>{agentPerformance[0]?.avg}% average score</span>
          </div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Agents Tracked</span>
            <BarChart3 size={16} color="var(--color-brand)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--text-primary)' }}>{agentPerformance.length}</div>
          <div className="kpi-sub">{calls.length} total calls analyzed</div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Team Average</span>
            <Trophy size={16} color="var(--color-secondary)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-secondary)' }}>
            {Math.round(agentPerformance.reduce((s, a) => s + a.avg, 0) / (agentPerformance.length || 1))}%
          </div>
          <div className="kpi-sub">Across all agents</div>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Medal size={18} color="var(--color-warning)" />
            Performance Rankings
          </h3>
        </div>
        <div>
          {agentPerformance.map((agent, index) => (
            <div
              key={agent.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: index < agentPerformance.length - 1 ? '1px solid var(--border-color)' : 'none',
                background: index === 0 ? 'rgba(253,224,71,0.03)' : 'transparent',
                gap: '20px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: index < 3 ? `${badgeColors[index]}22` : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: index < 3 ? badgeColors[index] : 'var(--text-muted)',
                flexShrink: 0
              }}>
                {index === 0 ? <Trophy size={16} /> : index === 1 ? <Medal size={16} /> : index === 2 ? <Award size={16} /> : `#${index + 1}`}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{agent.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.count} calls reviewed</div>
              </div>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Quality</div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: agent.avg >= 75 ? 'var(--color-success)' : agent.avg >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}>
                    {agent.avg}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Empathy</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-info)' }}>{agent.avgEmpathy}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Compliance</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-success)' }}>{agent.avgCompliance}%</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
