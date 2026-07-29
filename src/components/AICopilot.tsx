import React, { useState, useRef } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const AICopilot: React.FC = () => {
  const { selectedCall, copilotMessages, addCopilotMessage, clearCopilotMessages } = useAppStore();
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const msgIdCounter = useRef(0);

  if (!selectedCall) return null;

  const getSmartResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    // Call 1: Dave Miller (billing dispute)
    if (selectedCall.id === 'call_10294') {
      if (q.includes('summar') || q.includes('what happened')) {
        return `### 📝 Call Summary: Disputed Billing Plan\n\n- **Client Issue**: Customer Marcus Vance called highly agitated because his monthly rate rose from $80 to $120 without clear notifications.\n- **Agent Outcome**: Agent David Miller was defensive, failed to authenticate Vance's identity before releasing credentials, and told the customer "there is nothing I can do," causing the customer to demand a manager escalation.\n- **Recommendation**: Immediate supervisor takeover and callback is required to resolve this dispute and avoid churn.`;
      }
      if (q.includes('complian') || q.includes('violation')) {
        return `### 🚨 Critical Compliance Assessment\n\nThis call failed compliance checklists due to two major breaches:\n1. **PCI/Security Breach**: David discussed specific billing values ($80 vs $120) and payment options before conducting customer identity validation (zip code, last 4 digits on card).\n2. **Policy Disclosure Skip**: David didn't quote the standard carrier notification procedures when discussing expiring promo discounts.`;
      }
      if (q.includes('email') || q.includes('apolog')) {
        return `### ✉️ Supervisor Apology Draft\n\n**Subject**: Apology & Urgent Account Resolution regarding your billing - AgentThon Support\n\n**Dear Mr. Marcus Vance,**\n\nI am Sarah Jenkins, Support Supervisor at AgentThon. I manually audited your recording today and want to sincerely apologize for the quality of care you experienced. \n\nWe have reversed the billing rate spike, applied a temporary $40 discount credit, and scheduled an enterprise rate freeze. Please let me know if we can schedule a quick 5-minute call today to confirm these resolutions.\n\nBest regards,\n**Sarah Jenkins**`;
      }
      if (q.includes('coach') || q.includes('train')) {
        return `### 🎯 Coaching Recommendations for David Miller\n\n1. **Verifications First**: Train David to freeze account details until standard ID credentials checks are passed.\n2. **Avoid Defensive Phrasing**: Switch "nothing I can do" with *"Let's explore what package adjustments are possible to optimize this invoice."*`;
      }
    }

    // Call 2: Jessica Carter (Enterprise Node API)
    if (selectedCall.id === 'call_10295') {
      if (q.includes('summar') || q.includes('what happened')) {
        return `### 📝 Call Summary: API Webhook Diagnostics\n\n- **Client Issue**: Robert Kuan (Enterprise CTO) experienced 403 Forbidden responses when deploying the staging Firebase hook, threatening a go-live deadline.\n- **Agent Outcome**: Jessica Carter was exemplary. She diagnosed that the client Bearer Token was mapped in the request body instead of authorization headers. \n- **Outcome**: The fix worked perfectly and they went live on time. Perfect 100% scores.`;
      }
      if (q.includes('complian') || q.includes('violation')) {
        return `### 🛡️ Compliance Audit\n\n- **Security**: 100% Pass. Jessica properly authenticated the CTO prior to analyzing system console telemetry.\n- **Waivers**: No waivers needed for standard API guides. Perfect compliance.`;
      }
    }

    // Generic Fallback
    return `### 🤖 AI Copilot Feedback for: ${selectedCall.title}\n\n- **Agent**: ${selectedCall.agentName}\n- **Overall QA Score**: ${selectedCall.score}%\n- **Risk Evaluation**: Churn risk is currently rated at ${selectedCall.risk.churnRisk}%, with compliance violations marked as ${selectedCall.risk.complianceViolations}.\n\n*Try asking specific preset prompts below to get detailed drafts, script reviews, or email templates!*`;
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const id = ++msgIdCounter.current;
    addCopilotMessage({
      id: `msg_${id}`,
      role: 'user',
      content: textToSend,
      createdAt: id
    });

    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getSmartResponse(textToSend);
      addCopilotMessage({
        id: `msg_${++msgIdCounter.current}`,
        role: 'assistant',
        content: response,
        createdAt: msgIdCounter.current
      });
      setIsTyping(false);
    }, 1000);
  };

  const presetQuestions = [
    { label: 'Summarize Call', q: 'Summarize the customer complaint and agent performance.' },
    { label: 'Compliance Audit', q: 'Analyze this call for security and compliance violations.' },
    { label: 'Write Apology Email', q: 'Draft an apology email template to send to this customer.' },
    { label: 'Coaching Checklist', q: 'Suggest 3 training tips to coach this agent.' }
  ];

  return (
    <div className="glass copilot-container" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} className="text-purple-400" />
          <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>AI Call Copilot</h4>
        </div>
        <button 
          onClick={clearCopilotMessages}
          style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer', background: 'none' }}
        >
          Reset Chat
        </button>
      </div>

      {/* Messages */}
      <div className="copilot-chat">
        {copilotMessages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center', padding: '20px 10px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)', margin: '0 auto' }}>
              <Bot size={22} />
            </div>
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Active Call Assistant</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>I am context-aware of the transcript and metrics. Click a prompt below to query the audit:</p>
            </div>

            {/* Prompt presets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {presetQuestions.map((pq) => (
                <button
                  key={pq.label}
                  onClick={() => handleSend(pq.q)}
                  style={{ 
                    padding: '8px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)', 
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                  className="gradient-card-hover"
                >
                  {pq.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {copilotMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`copilot-msg ${msg.role}`}
                style={{ 
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line'
                }}
              >
                {/* Render minor markdown format segments manually/simply */}
                <div style={{ 
                  fontFamily: msg.role === 'assistant' ? 'var(--sans)' : 'inherit',
                  fontWeight: 'normal'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="copilot-msg assistant" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="wave-bar" style={{ height: '8px', width: '3px', animationDelay: '0.1s' }} />
                <span className="wave-bar" style={{ height: '8px', width: '3px', animationDelay: '0.3s' }} />
                <span className="wave-bar" style={{ height: '8px', width: '3px', animationDelay: '0.5s' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Ask AI Copilot details..." 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputMsg)}
          style={{ 
            flexGrow: 1, 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-sm)', 
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        />
        <button 
          onClick={() => handleSend(inputMsg)}
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-sm)', 
            background: 'var(--color-brand)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            cursor: 'pointer' 
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
