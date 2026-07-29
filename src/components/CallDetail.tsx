import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Bookmark, 
  Sparkles
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import type { CallRecord } from '../types';
import { AICopilot } from './AICopilot';

export const CallDetail: React.FC = () => {
  const { selectedCall, setSelectedCall } = useAppStore();

  if (!selectedCall) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }} className="glass">
        <AlertTriangle size={32} color="var(--color-warning)" style={{ margin: '0 auto 16px' }} />
        <h3>No Recording Selected</h3>
        <p style={{ marginTop: '8px' }}>Please choose a recorded call from the Archive table to begin Quality Assurance scoring.</p>
      </div>
    );
  }

  return <CallDetailInner key={selectedCall.id} call={selectedCall} onBack={() => setSelectedCall(null)} />;
};

const CallDetailInner: React.FC<{ call: CallRecord; onBack: () => void }> = ({ call, onBack }) => {
  const { updateCall } = useAppStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'metrics' | 'coaching'>('transcript');
  const [manualNote, setManualNote] = useState(() => call.notes || '');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Synchronized simulation interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= call.duration) {
            setIsPlaying(false);
            return call.duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, call.duration]);

  // Recharts: metrics data
  const metricsData = useMemo(() => [
    { subject: 'Empathy', value: call.metrics.empathy, fullMark: 100 },
    { subject: 'Clarity', value: call.metrics.clarity, fullMark: 100 },
    { subject: 'Active Listening', value: call.metrics.activeListening, fullMark: 100 },
    { subject: 'Resolution', value: call.metrics.resolution, fullMark: 100 },
    { subject: 'Professionalism', value: call.metrics.professionalism, fullMark: 100 },
    { subject: 'Compliance', value: call.metrics.compliance, fullMark: 100 }
  ], [call]);

  // Recharts: risks data
  const risksData = useMemo(() => [
    { name: 'Churn Risk', score: call.risk.churnRisk, color: 'var(--color-danger)' },
    { name: 'Escalation', score: call.risk.escalationRisk, color: 'var(--color-warning)' },
    { name: 'Anger Level', score: call.risk.customerAngerLevel, color: 'var(--color-danger)' },
    { name: 'Violations', score: call.risk.complianceViolations * 50, color: 'var(--color-info)' }
  ], [call]);

  // Format second timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleSaveNotes = () => {
    updateCall(call.id, { notes: manualNote });
    alert('QA notes successfully logged to database.');
  };

  return (
    <div className="call-detail-grid fade-in">
      
      {/* Left Workspace: Wave player, tabs, transcript */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          style={{ 
            alignSelf: 'flex-start', 
            fontSize: '13px', 
            fontWeight: '600', 
            color: 'var(--color-brand)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            transition: 'var(--transition)'
          }}
          className="gradient-card-hover"
        >
          ← Back to Recordings Archive
        </button>

        {/* Call Summary Header */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{call.category}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{call.id}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agent: <strong>{call.agentName}</strong></span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>{call.title}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QA Grade</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: call.score >= 75 ? 'var(--color-success)' : call.score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                {call.score}%
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player Controller */}
        <div className="glass audio-player-container">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--color-brand)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '4px' }} />}
          </button>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(call.duration)}</span>
            </div>
            
            {/* Timeline progress track */}
            <div 
              style={{ 
                height: '6px', 
                background: 'rgba(255,255,255,0.08)', 
                borderRadius: '3px', 
                position: 'relative', 
                cursor: 'pointer' 
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                handleSeek(Math.floor(percentage * call.duration));
              }}
            >
              <div 
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--color-brand) 0%, var(--color-secondary) 100%)', 
                  width: `${(currentTime / call.duration) * 100}%`, 
                  borderRadius: '3px' 
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Playback speed switcher */}
            <button 
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                setPlaybackSpeed(nextSpeed);
              }}
              style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                padding: '4px 8px', 
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <FastForward size={11} />
              <span>{playbackSpeed}x</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '20px' }}>
          <button 
            onClick={() => setActiveTab('transcript')}
            style={{ 
              padding: '12px 6px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: activeTab === 'transcript' ? 'var(--color-brand)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'transcript' ? '2px solid var(--color-brand)' : '2px solid transparent',
              cursor: 'pointer' 
            }}
          >
            Speech-to-Text Transcript
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            style={{ 
              padding: '12px 6px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: activeTab === 'metrics' ? 'var(--color-brand)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'metrics' ? '2px solid var(--color-brand)' : '2px solid transparent',
              cursor: 'pointer' 
            }}
          >
            Scoring & Risk Matrix
          </button>
          <button 
            onClick={() => setActiveTab('coaching')}
            style={{ 
              padding: '12px 6px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: activeTab === 'coaching' ? 'var(--color-brand)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'coaching' ? '2px solid var(--color-brand)' : '2px solid transparent',
              cursor: 'pointer' 
            }}
          >
            AI Coaching & Action Plan
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'transcript' && (
          <div className="glass transcript-panel">
            <div className="transcript-list">
              {call.transcript.map((item) => {
                const isActive = item.startTime <= currentTime && currentTime <= item.endTime;
                return (
                  <div 
                    key={item.id}
                    className={`transcript-bubble ${item.speaker} ${isActive ? 'active' : ''}`}
                    onClick={() => handleSeek(item.startTime)}
                  >
                    <div className="transcript-meta">
                      <span style={{ fontWeight: '700', textTransform: 'capitalize', color: item.speaker === 'agent' ? '#c084fc' : '#60a5fa' }}>
                        {item.speaker === 'agent' ? call.agentName : 'Customer'}
                      </span>
                      <span>{formatTime(item.startTime)}</span>
                    </div>
                    <div className="transcript-text">{item.text}</div>
                    
                    {/* Sentiment overlay badge inside bubble */}
                    <div style={{ position: 'absolute', right: '10px', bottom: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span style={{ color: item.sentiment === 'positive' ? 'var(--color-success)' : item.sentiment === 'negative' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                        {item.sentiment}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* Key Timeline Moments Overlay */}
            <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Compliance & Escalation Timeline Highlights</div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {call.keyMoments.map((moment) => (
                  <div 
                    key={moment.id}
                    onClick={() => handleSeek(moment.timestamp)}
                    className="gradient-card-hover"
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)',
                      fontSize: '11px',
                      flexShrink: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span className={`badge ${
                      moment.type === 'positive' ? 'badge-success' : 
                      moment.type === 'negative' ? 'badge-danger' : 'badge-warning'
                    }`} style={{ padding: '2px 6px', fontSize: '9px' }}>
                      {moment.type}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatTime(moment.timestamp)} - {moment.description.slice(0, 30)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Radar Charts of QA Grades */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>QA Quality Competencies</h4>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={metricsData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.08)" tick={false} />
                    <Radar name="Grades" dataKey="value" stroke="var(--color-brand)" fill="var(--color-brand)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>Risk Assessment Scorecard</h4>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={risksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                    <Bar dataKey="score" fill="var(--color-brand)" radius={[4, 4, 0, 0]}>
                      {risksData.map((entry: { color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'coaching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Action Coaching List */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} className="text-purple-400" />
                AI Generated Coaching Recommendations
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '8px' }}>Key Strengths</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {call.coaching.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-danger)', marginBottom: '8px' }}>Key Failures</h5>
                  <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {call.coaching.weaknesses.map((weak, idx) => (
                      <li key={idx}>{weak}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-info)', marginBottom: '8px' }}>Recommended Script Pivots</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {call.coaching.suggestedResponses.map((res, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--color-info)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      {res}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Markdown Plan Viewer & Editing Notes */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Supervisor Audit Logs</h4>
              <textarea 
                rows={5} 
                value={manualNote} 
                onChange={(e) => setManualNote(e.target.value)}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-sm)', 
                  color: 'var(--text-primary)', 
                  fontFamily: 'var(--sans)',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Log QA evaluations, coaching assignments, or standard performance notes here..."
              />
              <button 
                onClick={handleSaveNotes}
                style={{ 
                  background: 'var(--color-brand)', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'flex-end',
                  transition: 'var(--transition)'
                }}
                className="gradient-card-hover"
              >
                <Bookmark size={15} />
                <span>Save Log Record</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Drawer Workspace: AI Copilot Context-Chat */}
      <div>
        <AICopilot />
      </div>

    </div>
  );
};
