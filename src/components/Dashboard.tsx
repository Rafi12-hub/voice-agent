import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertOctagon, 
  Flame, 
  Play, 
  ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CallRecord } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { calls, setSelectedCall, notifications } = useAppStore();

  // Metrics calculations
  const totalCalls = calls.length;
  const averageScore = useMemo(() =>
    Math.round(calls.reduce((sum, c) => sum + c.score, 0) / (totalCalls || 1)),
    [calls, totalCalls]
  );
  const complianceViolations = useMemo(() =>
    calls.reduce((sum, c) => sum + c.risk.complianceViolations, 0),
    [calls]
  );
  const avgComplianceScore = useMemo(() =>
    Math.round(calls.reduce((sum, c) => sum + c.metrics.compliance, 0) / (totalCalls || 1)),
    [calls, totalCalls]
  );
  
  const highRiskCalls = useMemo(() =>
    calls.filter(c => c.risk.overallRiskScore > 60),
    [calls]
  );
  const riskPercentage = useMemo(() =>
    Math.round((highRiskCalls.length / (totalCalls || 1)) * 100),
    [highRiskCalls, totalCalls]
  );

  // Recharts: Trend data
  const trendData = useMemo(() =>
    [...calls]
      .sort((a, b) => a.date - b.date)
      .map(c => ({
        name: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
        score: c.score,
        compliance: c.metrics.compliance,
        risk: c.risk.overallRiskScore
      })),
    [calls]
  );

  // Recharts: Sentiment Data
  const sentimentData = useMemo(() => {
    const sentimentCounts = calls.reduce((acc: Record<string, number>, c) => {
      acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    return [
      { name: 'Positive', value: sentimentCounts.positive, color: 'var(--color-success)' },
      { name: 'Neutral', value: sentimentCounts.neutral, color: 'var(--color-info)' },
      { name: 'Negative', value: sentimentCounts.negative, color: 'var(--color-danger)' }
    ].filter(d => d.value > 0);
  }, [calls]);

  // Leaderboard data
  const agentPerformance = useMemo(() =>
    calls.reduce((acc: { name: string; totalScore: number; count: number; avg: number }[], call) => {
      const existing = acc.find(a => a.name === call.agentName);
      if (existing) {
        existing.totalScore += call.score;
        existing.count += 1;
        existing.avg = Math.round(existing.totalScore / existing.count);
      } else {
        acc.push({ name: call.agentName, totalScore: call.score, count: 1, avg: call.score });
      }
      return acc;
    }, []).sort((a, b) => b.avg - a.avg),
    [calls]
  );

  const handleInspectCall = (call: CallRecord) => {
    setSelectedCall(call);
    navigate('/calls');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Title */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>QA supervisor hub</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Automated quality auditing & speech analytics telemetry</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Average QA score</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: averageScore >= 75 ? 'var(--color-success)' : averageScore >= 55 ? 'var(--color-warning)' : 'var(--color-danger)' }}>{averageScore}%</div>
          <div className="kpi-sub">
            <span style={{ color: averageScore >= 75 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
              {averageScore >= 75 ? '+' : ''}3.4%
            </span>
            <span>vs previous week</span>
          </div>
        </div>

        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Compliance checklist</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-success)' }}>{avgComplianceScore}%</div>
          <div className="kpi-sub" style={{ color: complianceViolations > 0 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
            <AlertOctagon size={12} />
            <span>{complianceViolations} critical violations detected</span>
          </div>
        </div>

        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">High churn risk rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
              <Flame size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-danger)' }}>{riskPercentage}%</div>
          <div className="kpi-sub">
            <span>{highRiskCalls.length} of {totalCalls} total retention calls</span>
          </div>
        </div>

        <div className="kpi-card glass gradient-card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Analyzed Records</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
              <Play size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: 'var(--text-primary)' }}>{totalCalls}</div>
          <div className="kpi-sub">
            <span>Speech-to-Text synced</span>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="charts-grid">
        {/* Trend Area Chart */}
        <div className="chart-card glass">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Quality Score & Risk Progression</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QA Grade vs Churn Risk over recent calls</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)' }} />
                QA Score
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)' }} />
                Escalation Risk
              </span>
            </div>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-brand)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="QA Score" />
                <Area type="monotone" dataKey="risk" stroke="var(--color-danger)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRisk)" name="Risk Rating" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="chart-card glass">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Customer sentiment</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Call sentiment ratio</p>
            </div>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {sentimentData.map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                  {d.name}
                </span>
                <span style={{ fontWeight: 'bold' }}>{Math.round((d.value / totalCalls) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Incidents Feed & Agent Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Critical Alerts / Incident Feed */}
        <div className="chart-card glass">
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Critical Incidents Alert Feed</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.slice(0, 3).map((n) => {
              const matchingCall = calls.find(c => c.id === n.referenceId);
              return (
                <div 
                  key={n.id}
                  style={{ 
                    padding: '16px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="badge badge-danger">
                        {n.type === 'compliance_violation' ? 'Violation' : 'Priority Risk'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    {matchingCall && (
                      <button 
                        onClick={() => handleInspectCall(matchingCall)}
                        style={{ fontSize: '12px', color: 'var(--color-brand)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Inspect
                        <ArrowUpRight size={13} />
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{n.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performer Scorecards */}
        <div className="chart-card glass">
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Agent QA Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {agentPerformance.map((agent, index) => (
              <div 
                key={agent.name}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%', 
                    background: index === 0 ? 'rgba(253,224,71,0.2)' : 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: index === 0 ? '#fde047' : 'var(--text-secondary)'
                  }}>
                    #{index + 1}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{agent.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: agent.avg >= 75 ? 'var(--color-success)' : agent.avg >= 55 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                    {agent.avg}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{agent.count} calls rated</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
