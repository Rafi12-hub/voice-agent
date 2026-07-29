import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Upload, 
  Clock, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CallRecord } from '../types';

export const CallList: React.FC = () => {
  const navigate = useNavigate();
  const { calls, selectedCall, addCall, setSelectedCall, filters, setFilters } = useAppStore();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Search and filter operations
  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      call.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      call.agentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      call.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      (call.notes && call.notes.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesAgent = filters.agent === 'all' || call.agentName === filters.agent;
    const matchesPriority = filters.priority === 'all' || call.priority === filters.priority;
    const matchesSentiment = filters.sentiment === 'all' || call.sentiment === filters.sentiment;

    return matchesSearch && matchesAgent && matchesPriority && matchesSentiment;
  });

  // Get unique agents for the filter dropdown
  const uniqueAgents = Array.from(new Set(calls.map((c) => c.agentName)));

  // Simulated Voice AI processing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploading(true);
    setUploadStep(1);

    // Audio upload stage
    setTimeout(() => {
      setUploadStep(2); // Transcription stage
      setTimeout(() => {
        setUploadStep(3); // Auditing Compliance stage
        setTimeout(() => {
          setUploadStep(4); // Generating Coaching Plan stage
          setTimeout(() => {
            // Create a completely custom processed call record
            const newCall: CallRecord = {
              id: `call_${Math.floor(Math.random() * 90000) + 10000}`,
              title: `Support Ticket Analysis - ${file.name.split('.')[0]}`,
              agentId: 'agt_7721',
              agentName: 'Jessica Carter',
              customerName: 'Aria Thompson',
              organizationId: 'org_vvit_1',
              category: 'General Inquiry',
              department: 'Standard Care',
              priority: 'medium',
              duration: 142, // 2:22
              audioUrl: '',
              status: 'completed',
              score: 85,
              sentiment: 'positive',
              date: Date.now(),
              notes: 'AI speech audit finished. Customer expressed minor initial impatience regarding package setups, but Jessica resolved the query rapidly. High soft-skill scoring. 100% compliance met.',
              metrics: {
                empathy: 88,
                clarity: 90,
                activeListening: 92,
                resolution: 90,
                tone: 85,
                professionalism: 90,
                confidence: 85,
                ownership: 90,
                productKnowledge: 85,
                compliance: 100
              },
              risk: {
                churnRisk: 12,
                escalationRisk: 5,
                complaintSeverity: 20,
                complianceViolations: 0,
                customerAngerLevel: 25,
                overallRiskScore: 10
              },
              coaching: {
                strengths: [
                  'Addressed customer immediately with standard welcoming protocol.',
                  'Clear configuration instructions given for software installation.'
                ],
                weaknesses: [
                  'Slight pacing rush during the first 30 seconds.'
                ],
                opportunities: [
                  'Practice intentional brief pauses between step-by-step technical guides.'
                ],
                suggestedResponses: [
                  '"I will certainly guide you through this setup. Let\'s do this together, clicking the Settings cog first."'
                ],
                coachingPlanMarkdown: `### 🛠️ Jessica Carter - Onboarding Coaching Plan\n\n**Goal**: Reinforce standard step-by-step instructions pacing.\n\n- Practice pacing controls under peak call times.`
              },
              transcript: [
                { id: 't4_1', speaker: 'agent', text: 'Hello, welcome to support. Jessica speaking. How can I help you?', startTime: 0, endTime: 4, sentiment: 'neutral', confidence: 0.98 },
                { id: 't4_2', speaker: 'customer', text: 'Hi, yes. I am trying to setup my developer sandbox and your authentication token is giving me an initialization mismatch.', startTime: 5, endTime: 14, sentiment: 'neutral', confidence: 0.95 },
                { id: 't4_3', speaker: 'agent', text: 'No worries at all, Aria! I can assist with that. Let\'s verify the environment file keys. Let\'s make sure there is no trailing spaces.', startTime: 15, endTime: 25, sentiment: 'positive', confidence: 0.99 },
                { id: 't4_4', speaker: 'customer', text: 'Oh... let me look. Ah, yes! There was a newline space in my copied API key variable. Removed it, and it connected! You are a lifesaver.', startTime: 26, endTime: 36, sentiment: 'positive', confidence: 0.98 }
              ],
              keyMoments: [
                { id: 'km4_1', timestamp: 15, type: 'positive', description: 'Jessica greets the customer with warm empathy and structures diagnostic checks immediately.' },
                { id: 'km4_2', timestamp: 26, type: 'resolution', description: 'Agent diagnoses keys formatting issues, successfully establishing database sandbox connectivity.' }
              ]
            };

            addCall(newCall);
            setIsUploading(false);
            setUploadStep(0);
            setSelectedCall(newCall);
            navigate(`/calls`);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Call Center Recordings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review agent transcripts, QA scoreboards, and compliance logs</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div className="filter-bar">
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="Search call logs, agents, customer names, complaints..." 
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="filter-input"
              style={{ paddingLeft: '44px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select 
                value={filters.agent}
                onChange={(e) => setFilters({ agent: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Agents</option>
                {uniqueAgents.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <select 
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select 
              value={filters.sentiment}
              onChange={(e) => setFilters({ sentiment: e.target.value })}
              className="filter-select"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Calls List vs. Drag & Drop Upload Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        
        {/* Call List Table */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Recordings Archive ({filteredCalls.length})</h3>
          
          {filteredCalls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              No call recordings found matching current filters.
            </div>
          ) : (
            <div className="call-table-container">
              <table className="call-table">
                <thead>
                  <tr>
                    <th>Call Title</th>
                    <th>Agent</th>
                    <th>Date</th>
                    <th>Sentiment</th>
                    <th>QA Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call) => (
                    <tr 
                      key={call.id}
                      onClick={() => handleSelectCall(call)}
                      className="call-row"
                      style={{ 
                        background: selectedCall?.id === call.id ? 'rgba(139, 92, 246, 0.05)' : '',
                        borderLeft: selectedCall?.id === call.id ? '3px solid var(--color-brand)' : '3px solid transparent'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{call.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Clock size={11} />
                          <span>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
                          <span>•</span>
                          <span>Customer: {call.customerName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{call.agentName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{call.department}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(call.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge ${
                          call.sentiment === 'positive' ? 'badge-success' : 
                          call.sentiment === 'negative' ? 'badge-danger' : 'badge-info'
                        }`}>
                          {call.sentiment}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: call.score >= 75 ? 'var(--color-success)' : call.score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}>
                          {call.score}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '10px' }}>
                          Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Speech-to-Text Voice AI Uploader Panel */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} className="text-purple-400" />
              Upload Audio Audit
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Transcribe, score, and analyze calls automatically</p>
          </div>

          {isUploading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={44} className="text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
                <FileText size={20} style={{ position: 'absolute' }} />
              </div>
              
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{uploadedFileName}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>AI Pipeline processing call...</p>
              </div>

              {/* Progress Steps */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: uploadStep >= 1 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} />
                  <span>1. Uploading Audio File</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: uploadStep >= 2 ? 'var(--color-success)' : uploadStep === 1 ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} />
                  <span>2. Transcribing Conversation (Voice AI)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: uploadStep >= 3 ? 'var(--color-success)' : uploadStep === 2 ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} />
                  <span>3. Running Compliance Audits</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: uploadStep >= 4 ? 'var(--color-success)' : uploadStep === 3 ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} />
                  <span>4. Grading Performance & Metrics</span>
                </div>
              </div>
            </div>
          ) : (
            <div 
              style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '40px 20px', 
                textAlign: 'center', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'var(--transition)'
              }}
              className="gradient-card-hover"
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input 
                id="file-upload-input"
                type="file" 
                accept="audio/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
                <Upload size={20} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Click to upload audio recording</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Supports MP3, WAV, M4A (Max 25MB)</p>
              </div>
            </div>
          )}

          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={15} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <span>Adding call transcripts triggers our AI grading pipeline to automatically evaluate compliance and agent empathy scores.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
