import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import {
  ShieldCheck, AlertOctagon, Flame, ArrowUpRight, Activity, BarChart3
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CallRecord } from '../types';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { calls, setSelectedCall, notifications } = useAppStore();

  const totalCalls = calls.length;
  const averageScore = useMemo(() =>
    Math.round(calls.reduce((sum, c) => sum + c.score, 0) / (totalCalls || 1)),
    [calls, totalCalls]
  );
  const complianceViolations = useMemo(() =>
    calls.reduce((sum, c) => sum + c.risk.complianceViolations, 0),
    [calls]
  );

  const trendData = useMemo(() =>
    [...calls].sort((a, b) => a.date - b.date).map(c => ({
      name: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: c.score,
      compliance: c.metrics.compliance,
      risk: c.risk.overallRiskScore
    })),
    [calls]
  );

  const sentimentData = useMemo(() => {
    const counts = calls.reduce((acc: Record<string, number>, c) => {
      acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });
    return [
      { name: 'Positive', value: counts.positive, color: 'var(--color-success)' },
      { name: 'Neutral', value: counts.neutral, color: 'var(--color-info)' },
      { name: 'Negative', value: counts.negative, color: 'var(--color-danger)' }
    ].filter(d => d.value > 0);
  }, [calls]);

  const departmentData = useMemo(() => {
    const dept = new Map<string, number>();
    calls.forEach(c => dept.set(c.department, (dept.get(c.department) || 0) + 1));
    return Array.from(dept.entries()).map(([name, value]) => ({ name, value }));
  }, [calls]);

  const handleInspectCall = (call: CallRecord) => {
    setSelectedCall(call);
    navigate('/calls');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Analytics Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quality trends, sentiment analysis, and performance metrics</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Average QA Score</span>
            <Activity size={16} color="var(--color-brand)" />
          </div>
          <div className="kpi-val" style={{
            color: averageScore >= 75 ? 'var(--color-success)' : averageScore >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
          }}>{averageScore}%</div>
          <div className="kpi-sub">
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+3.4%</span>
            <span>vs previous period</span>
          </div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Total Calls</span>
            <BarChart3 size={16} color="var(--color-secondary)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--text-primary)' }}>{totalCalls}</div>
          <div className="kpi-sub">All analyzed recordings</div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Compliance</span>
            <ShieldCheck size={16} color="var(--color-success)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-success)' }}>
            {totalCalls > 0 ? Math.round(calls.reduce((s, c) => s + c.metrics.compliance, 0) / totalCalls) : 0}%
          </div>
          <div className="kpi-sub" style={{ color: complianceViolations > 0 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
            <AlertOctagon size={12} />
            <span>{complianceViolations} violations</span>
          </div>
        </div>
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">High Risk</span>
            <Flame size={16} color="var(--color-danger)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-danger)' }}>
            {Math.round(calls.filter(c => c.risk.overallRiskScore > 60).length / (totalCalls || 1) * 100)}%
          </div>
          <div className="kpi-sub">Churn & escalation risk</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Quality Score Trend</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QA scores over recent calls</p>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                <Area type="monotone" dataKey="score" stroke="var(--color-brand)" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" name="QA Score" />
                <Area type="monotone" dataKey="risk" stroke="var(--color-danger)" strokeWidth={1.5} fillOpacity={1} fill="url(#scoreGrad)" name="Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="chart-card glass">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Customer Sentiment</h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value">
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              {sentimentData.map(d => (
                <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                  {d.name} ({Math.round((d.value / totalCalls) * 100)}%)
                </span>
              ))}
            </div>
          </div>

          <div className="chart-card glass">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>By Department</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {departmentData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '120px' }}>{d.name}</span>
                  <div style={{ flexGrow: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(d.value / totalCalls) * 100}%`, height: '100%', background: 'var(--color-brand)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Incidents</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.slice(0, 4).map(n => {
            const call = calls.find(c => c.id === n.referenceId);
            return (
              <div key={n.id} style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`badge ${n.type === 'compliance_violation' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                    {n.type === 'compliance_violation' ? 'Violation' : 'Alert'}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.message.slice(0, 50)}...</div>
                  </div>
                </div>
                {call && (
                  <button onClick={() => handleInspectCall(call)} style={{
                    fontSize: '12px',
                    color: 'var(--color-brand)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none'
                  }}>
                    Review <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
