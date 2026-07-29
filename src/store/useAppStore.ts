import { create } from 'zustand';
import type { 
  UserProfile, 
  CallRecord, 
  CoachingReport, 
  AppNotification, 
  CopilotMessage
} from '../types';
import {
  getFirestoreCalls,
  saveFirestoreCall,
  getFirestoreCoachingReports,
  saveFirestoreCoachingReport,
  getFirestoreNotifications,
  saveFirestoreNotification
} from '../services/db';

interface AppState {
  currentUser: UserProfile;
  calls: CallRecord[];
  selectedCall: CallRecord | null;
  coachingReports: CoachingReport[];
  notifications: AppNotification[];
  copilotMessages: CopilotMessage[];
  filters: {
    search: string;
    agent: string;
    department: string;
    priority: string;
    sentiment: string;
  };
  syncStatus: 'local' | 'synced' | 'syncing' | 'error';
  
  // Actions
  setCurrentUser: (user: UserProfile) => void;
  setCalls: (calls: CallRecord[]) => void;
  setSelectedCall: (call: CallRecord | null) => void;
  addCall: (call: CallRecord) => void;
  updateCall: (callId: string, updates: Partial<CallRecord>) => void;
  setCoachingReports: (reports: CoachingReport[]) => void;
  addCoachingReport: (report: CoachingReport) => void;
  updateCoachingReport: (id: string, updates: Partial<CoachingReport>) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (notification: AppNotification) => void;
  setCopilotMessages: (messages: CopilotMessage[]) => void;
  addCopilotMessage: (message: CopilotMessage) => void;
  clearCopilotMessages: () => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  setSyncStatus: (status: AppState['syncStatus']) => void;
  syncFromFirebase: () => Promise<boolean>;
  resetStore: () => void;
}

// Initial mock supervisor profile
const defaultUser: UserProfile = {
  uid: 'mgr_9921',
  email: 'supervisor@agentthon.ai',
  displayName: 'Sarah Jenkins',
  role: 'manager',
  organizationId: 'org_vvit_1',
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
};

// Seed high-fidelity mockup data
const initialCalls: CallRecord[] = [
  {
    id: 'call_10294',
    title: 'Disputed Billing Plan & Cancellation Request',
    agentId: 'agt_4812',
    agentName: 'David Miller',
    customerName: 'Marcus Vance',
    organizationId: 'org_vvit_1',
    category: 'Billing',
    department: 'Customer Retention',
    priority: 'high',
    duration: 214, // 3:34
    audioUrl: '',
    status: 'completed',
    score: 42,
    sentiment: 'negative',
    date: Date.now() - 3 * 3600 * 1000, // 3 hours ago
    notes: 'Agent failed compliance checklist. Failed to read standard pricing increase disclosure and did not authenticate the customer prior to discussing billing amounts. Customer was highly agitated regarding a recent monthly increase and threatened to cancel services immediately.',
    metrics: {
      empathy: 35,
      clarity: 60,
      activeListening: 45,
      resolution: 30,
      tone: 40,
      professionalism: 50,
      confidence: 45,
      ownership: 30,
      productKnowledge: 55,
      compliance: 10
    },
    risk: {
      churnRisk: 92,
      escalationRisk: 85,
      complaintSeverity: 80,
      complianceViolations: 2,
      customerAngerLevel: 88,
      overallRiskScore: 89
    },
    coaching: {
      strengths: [
        'Remained polite under extreme stress and customer shouting.',
        'Acknowledged the customer\'s bill concern early in the call.'
      ],
      weaknesses: [
        'Failed to perform identity authentication before sharing billing details.',
        'Did not state the standard FCC billing notification policy.',
        'Used passive language ("Nothing I can do", "Vite system is slow") instead of active ownership.'
      ],
      opportunities: [
        'Practice the CRM customer validation routine on every incoming billing call.',
        'Use standard pivot scripts to explain price changes positively.'
      ],
      suggestedResponses: [
        '"For your security, Mr. Vance, before we discuss your billing amounts, could you please verify your zip code and last four digits of the card on file?"',
        '"I completely understand how an unexpected change in your monthly payment can be frustrating. Let me look at your package options to see if we can find any active discount promotions to reduce this bill."'
      ],
      coachingPlanMarkdown: `### 🎯 Dave Miller - 1-on-1 Action Plan\n\n**Goal**: Master identity verification protocol and customer retention paths.\n\n#### 📈 Action Items:\n1. **Security Compliance (Immediate)**: David must review the Mandatory Verification PDF and participate in a 15-minute roleplay with Sarah on authenticating customer records.\n2. **Retention Scripting**: Instead of saying *"nothing I can do about prices"*, David must pivot to presenting package optimizations.\n3. **Post-Call Review**: Sarah will manually audit David's next 5 billing calls to guarantee 100% compliance.`
    },
    transcript: [
      { id: 't1_1', speaker: 'agent', text: 'Hello, thank you for calling AgentThon support. My name is David. How can I help you today?', startTime: 0, endTime: 5, sentiment: 'neutral', confidence: 0.98 },
      { id: 't1_2', speaker: 'customer', text: 'Yeah, I am looking at my latest invoice and it is completely wrong! My bill went from $80 to $120. I want an explanation right now. This is ridiculous.', startTime: 6, endTime: 15, sentiment: 'negative', confidence: 0.95 },
      { id: 't1_3', speaker: 'agent', text: 'Oh, okay. Let me open your account. Yes, I see it is $120. It looks like your introductory rate expired.', startTime: 16, endTime: 24, sentiment: 'neutral', confidence: 0.92 },
      { id: 't1_4', speaker: 'customer', text: 'Introductory rate? Nobody told me it was temporary! I was assured it was a fixed flat rate. I want to cancel my service immediately. I am not paying this scam price!', startTime: 25, endTime: 36, sentiment: 'negative', confidence: 0.97 },
      { id: 't1_5', speaker: 'agent', text: 'Well, introductory packages are always for 12 months. It says so in the fine print on page 4 of the agreement. There is really nothing I can do to change it back.', startTime: 37, endTime: 48, sentiment: 'negative', confidence: 0.88 },
      { id: 't1_6', speaker: 'customer', text: 'Nothing you can do?! I want to speak to your manager! Get me your supervisor on the line right now. I have been a loyal customer and you are just shrugging me off.', startTime: 49, endTime: 59, sentiment: 'negative', confidence: 0.99 },
      { id: 't1_7', speaker: 'agent', text: 'Okay, okay, hold on. I will check if a manager is available. Let me put you on hold.', startTime: 60, endTime: 66, sentiment: 'neutral', confidence: 0.91 }
    ],
    keyMoments: [
      { id: 'km1_1', timestamp: 6, type: 'negative', description: 'Customer expresses strong anger regarding a 50% price increase on their monthly invoice.' },
      { id: 'km1_2', timestamp: 16, type: 'coaching', description: 'Compliance Failure: Agent discussed account balances without authenticating customer credentials (zip code, last 4 digits).' },
      { id: 'km1_3', timestamp: 37, type: 'escalation', description: 'Agent used defensive, passive phrasing ("nothing I can do", "fine print on page 4") causing customer to demand supervisor escalation.' }
    ]
  },
  {
    id: 'call_10295',
    title: 'Complex API Integration & Troubleshooting',
    agentId: 'agt_9021',
    agentName: 'Jessica Carter',
    customerName: 'Robert Kuan (CTO)',
    organizationId: 'org_vvit_1',
    category: 'Technical',
    department: 'Enterprise Support',
    priority: 'medium',
    duration: 382, // 6:22
    audioUrl: '',
    status: 'completed',
    score: 98,
    sentiment: 'positive',
    date: Date.now() - 1 * 24 * 3600 * 1000, // Yesterday
    notes: 'Exemplary customer handling. Jessica resolved a critical server API deployment issue for an enterprise client. She maintained outstanding empathy, actively listened, troubleshooted step-by-step, and verified the fix before hanging up. Outstanding job!',
    metrics: {
      empathy: 98,
      clarity: 95,
      activeListening: 100,
      resolution: 100,
      tone: 96,
      professionalism: 98,
      confidence: 95,
      ownership: 100,
      productKnowledge: 98,
      compliance: 100
    },
    risk: {
      churnRisk: 5,
      escalationRisk: 8,
      complaintSeverity: 10,
      complianceViolations: 0,
      customerAngerLevel: 15,
      overallRiskScore: 6
    },
    coaching: {
      strengths: [
        'Perfect technical diagnosis of an API header mismatch.',
        'Extremely reassuring and clear voice tone throughout a complex technical incident.',
        'Proactively verified and double-checked the client logs to ensure the deployment was fully operational.'
      ],
      weaknesses: [],
      opportunities: [
        'Encourage Jessica to document this edge-case in the team Slack channels so other agents can learn from the integration fix.'
      ],
      suggestedResponses: [
        'Excellent handling overall - no corrections needed.'
      ],
      coachingPlanMarkdown: `### 🚀 Jessica Carter - Performance Review\n\n**Goal**: Capitalize on outstanding enterprise customer care capabilities.\n\n#### 🌟 Outstanding Points:\n- **Technical Mastery**: Solved a highly complex Node.js connection header bug within 4 minutes.\n- **Leadership Potential**: Jessica has been nominated to lead our technical QA masterclass next month to share her active listening framework.`
    },
    transcript: [
      { id: 't2_1', speaker: 'agent', text: 'Thank you for contacting Enterprise Engineering support. This is Jessica. Am I speaking with Mr. Robert Kuan?', startTime: 0, endTime: 6, sentiment: 'neutral', confidence: 0.99 },
      { id: 't2_2', speaker: 'customer', text: 'Yes, Jessica. We are trying to deploy the new Firebase hook in our staging environment and we keep getting a 403 Forbidden payload. We are supposed to go live in two hours.', startTime: 7, endTime: 18, sentiment: 'neutral', confidence: 0.96 },
      { id: 't2_3', speaker: 'agent', text: 'Oh, I completely understand the urgency. I am here to help you get this live. Let\'s verify your client headers. Have you injected the Bearer Token in your request authorization block?', startTime: 19, endTime: 31, sentiment: 'positive', confidence: 0.99 },
      { id: 't2_4', speaker: 'customer', text: 'Wait... let me check. Ah! We had mapped it to the payload object instead of the authorization headers. Let me redeploy that.', startTime: 32, endTime: 44, sentiment: 'neutral', confidence: 0.97 },
      { id: 't2_5', speaker: 'customer', text: 'Wow, it works! The webhook triggers perfectly now and is writing to the database correctly. That saved us a massive headache.', startTime: 45, endTime: 55, sentiment: 'positive', confidence: 0.99 },
      { id: 't2_6', speaker: 'agent', text: 'That is wonderful news, Robert! I am so glad we got that sorted. I\'ve also checked our dashboard telemetry and confirmed the connection is secure. Is there anything else I can optimize for you?', startTime: 56, endTime: 68, sentiment: 'positive', confidence: 0.99 }
    ],
    keyMoments: [
      { id: 'km2_1', timestamp: 19, type: 'positive', description: 'Jessica reassures the highly stressed CTO and establishes an immediate technical path forward.' },
      { id: 'km2_2', timestamp: 32, type: 'resolution', description: 'Jessica correctly diagnoses the 403 error as a header placement issue, solving the integration block.' },
      { id: 'km2_3', timestamp: 56, type: 'positive', description: 'Proactive quality checks: agent double-checks database logs before concluding call.' }
    ]
  },
  {
    id: 'call_10296',
    title: 'Broken SLA & Order Delay Complaint',
    agentId: 'agt_1289',
    agentName: 'Marcus Sterling',
    customerName: 'Elena Rostova',
    organizationId: 'org_vvit_1',
    category: 'Shipping',
    department: 'Enterprise Support',
    priority: 'high',
    duration: 180, // 3:00
    audioUrl: '',
    status: 'completed',
    score: 72,
    sentiment: 'neutral',
    date: Date.now() - 2 * 24 * 3600 * 1000, // 2 days ago
    notes: 'Marcus did a decent job handling a customer angry about an expired delivery SLA. He was polite and set correct delivery expectations. However, he failed to read the standard carrier liability waiver which is a compliance requirement for late shipments.',
    metrics: {
      empathy: 75,
      clarity: 80,
      activeListening: 85,
      resolution: 70,
      tone: 78,
      professionalism: 80,
      confidence: 75,
      ownership: 70,
      productKnowledge: 80,
      compliance: 40
    },
    risk: {
      churnRisk: 45,
      escalationRisk: 30,
      complaintSeverity: 60,
      complianceViolations: 1,
      customerAngerLevel: 65,
      overallRiskScore: 50
    },
    coaching: {
      strengths: [
        'Maintained composure and did not match customer frustration.',
        'Correctly logged the tracking error ticket in the CRM portal.'
      ],
      weaknesses: [
        'Did not read the Shipping SLA Liability Waiver statement before issuing the store credit.',
        'Did not offer a call-back date.'
      ],
      opportunities: [
        'Remind Marcus that every refund or store credit above $25 requires stating the terms of delivery liability.'
      ],
      suggestedResponses: [
        '"While I issue this $50 delivery credit, I do need to let you know that this covers our standard carrier SLA guarantee. Full details of our liability policies can be reviewed at our website under shipping policies."'
      ],
      coachingPlanMarkdown: `### 📦 Marcus Sterling - SLA Coaching Outline\n\n**Goal**: Reinforce standard SLA compliance disclosures.\n\n#### 📈 Action Items:\n- Review SLA policy sheet in team share.\n- Add the compliance waiver script to sticky notes for quick reference during refund processing.`
    },
    transcript: [
      { id: 't3_1', speaker: 'agent', text: 'Thank you for calling shipping support. This is Marcus. Can I have your order reference code?', startTime: 0, endTime: 5, sentiment: 'neutral', confidence: 0.97 },
      { id: 't3_2', speaker: 'customer', text: 'Yes, my order code is 8812A. This was scheduled to arrive three days ago. It is an anniversary present and now the event has passed. This is extremely disappointing.', startTime: 6, endTime: 17, sentiment: 'negative', confidence: 0.94 },
      { id: 't3_3', speaker: 'agent', text: 'I am very sorry to hear that your order is delayed, Elena. Let me look at the tracking updates. It looks like it is held up at the regional terminal due to sorting issues.', startTime: 18, endTime: 30, sentiment: 'neutral', confidence: 0.95 },
      { id: 't3_4', speaker: 'customer', text: 'Sorting issues? I paid for next-day air! I expect a full shipping refund and a credit. This is the third time you guys have missed a deadline.', startTime: 31, endTime: 42, sentiment: 'negative', confidence: 0.98 },
      { id: 't3_5', speaker: 'agent', text: 'I totally agree that is unacceptable. I have credited the $20 shipping fee back to your account and added a $30 gift card for the trouble. It is scheduled to be delivered tomorrow morning by 10 AM.', startTime: 43, endTime: 56, sentiment: 'positive', confidence: 0.93 },
      { id: 't3_6', speaker: 'customer', text: 'Alright, I guess that is something. I just hope it actually shows up tomorrow. Thank you for the credit.', startTime: 57, endTime: 66, sentiment: 'neutral', confidence: 0.96 }
    ],
    keyMoments: [
      { id: 'km3_1', timestamp: 18, type: 'positive', description: 'Marcus shows good active empathy and tracking honesty.' },
      { id: 'km3_2', timestamp: 43, type: 'coaching', description: 'Compliance Failure: Marcus credited shipping fees without citing the required carrier liability clause.' }
    ]
  },
  {
    id: 'call_10297',
    title: 'Advanced Product Feature Training & Upsell',
    agentId: 'agt_5634',
    agentName: 'Priya Kapoor',
    customerName: 'Jennifer Walsh',
    organizationId: 'org_vvit_1',
    category: 'Technical',
    department: 'Sales Engineering',
    priority: 'medium',
    duration: 456, // 7:36
    audioUrl: '',
    status: 'completed',
    score: 94,
    sentiment: 'positive',
    date: Date.now() - 6 * 3600 * 1000, // 6 hours ago
    notes: 'Exceptional call handling. Priya demonstrated deep product knowledge, proactively identified customer needs, and successfully guided them through advanced features. Customer is extremely satisfied and interested in enterprise upgrade.',
    metrics: {
      empathy: 92,
      clarity: 96,
      activeListening: 94,
      resolution: 98,
      tone: 95,
      professionalism: 96,
      confidence: 94,
      ownership: 98,
      productKnowledge: 99,
      compliance: 96
    },
    risk: {
      churnRisk: 8,
      escalationRisk: 5,
      complaintSeverity: 2,
      complianceViolations: 0,
      customerAngerLevel: 5,
      overallRiskScore: 5
    },
    coaching: {
      strengths: [
        'Outstanding product expertise and ability to explain complex features simply.',
        'Proactively identified upsell opportunities without being pushy.',
        'Excellent pacing and gave customer plenty of time to ask questions.',
        'Perfect compliance adherence throughout the entire call.'
      ],
      weaknesses: [],
      opportunities: [
        'Consider mentoring other agents on your consultative sales approach.',
        'Excellent candidate for enterprise account management track.'
      ],
      suggestedResponses: [
        'No corrections needed - exemplary performance across all metrics.'
      ],
      coachingPlanMarkdown: `### 🌟 Priya Kapoor - Top Performer Recognition\n\n**Goal**: Leverage Priya's excellence to elevate team performance.\n\n#### 🏆 Recognition:\n- **Performance Grade**: A+ (94/100)\n- **Recommendation**: Promote to Senior Sales Engineer role.\n- **Mentorship**: Consider Priya as peer coach for consultative selling techniques.`
    },
    transcript: [
      { id: 't4_1', speaker: 'agent', text: 'Good morning! Thank you for calling AgentThon sales engineering. This is Priya. I see you are exploring our enterprise analytics package?', startTime: 0, endTime: 8, sentiment: 'positive', confidence: 0.99 },
      { id: 't4_2', speaker: 'customer', text: 'Yes, hi Priya. We are a mid-size team and we saw your demo video. The sentiment analysis features looked really interesting for our customer support operations.', startTime: 9, endTime: 22, sentiment: 'positive', confidence: 0.97 },
      { id: 't4_3', speaker: 'agent', text: 'That is fantastic! Jennifer, the sentiment tracking really transforms how teams understand customer pain points. Let me walk you through the custom dashboards we can build for your specific workflows. What does your typical call volume look like?', startTime: 23, endTime: 38, sentiment: 'positive', confidence: 0.98 },
      { id: 't4_4', speaker: 'customer', text: 'We handle about 3000 calls per month across three departments. Right now we are doing manual spot-checking of call quality, which is really time-consuming.', startTime: 39, endTime: 52, sentiment: 'neutral', confidence: 0.96 },
      { id: 't4_5', speaker: 'agent', text: 'Perfect. With our platform, you would move from 2% sampling to 100% automated coverage. I can show you a real case study where a team similar to yours reduced QA time by 70% and improved call scores by 18 points on average. Would you like to see that?', startTime: 53, endTime: 70, sentiment: 'positive', confidence: 0.99 },
      { id: 't4_6', speaker: 'customer', text: 'Absolutely! That sounds amazing. And can we integrate with our existing Zendesk system?', startTime: 71, endTime: 78, sentiment: 'positive', confidence: 0.98 },
      { id: 't4_7', speaker: 'agent', text: 'Excellent question. Yes, we have a native Zendesk integration that syncs in real-time. You will see all your calls, recordings, and our AI coaching recommendations directly in your Zendesk dashboards. Plus, our team would work with your tech lead to set that up at no extra cost.', startTime: 79, endTime: 102, sentiment: 'positive', confidence: 0.99 },
      { id: 't4_8', speaker: 'customer', text: 'This is perfect. I think we are ready to move forward. What does the onboarding process look like?', startTime: 103, endTime: 110, sentiment: 'positive', confidence: 0.99 }
    ],
    keyMoments: [
      { id: 'km4_1', timestamp: 9, type: 'positive', description: 'Priya immediately establishes rapport and demonstrates deep understanding of customer needs.' },
      { id: 'km4_2', timestamp: 39, type: 'positive', description: 'Priya asks qualifying questions to understand customer workflow and pain points.' },
      { id: 'km4_3', timestamp: 53, type: 'resolution', description: 'Strategic upsell: Priya presents ROI numbers and case studies that resonate with customer.' },
      { id: 'km4_4', timestamp: 79, type: 'positive', description: 'Priya removes barriers by offering integration support and setting clear expectations.' }
    ]
  }
];

const initialCoaching: CoachingReport[] = [
  {
    id: 'rpt_2001',
    agentId: 'agt_4812',
    agentName: 'David Miller',
    managerId: 'mgr_9921',
    managerName: 'Sarah Jenkins',
    date: Date.now() - 4 * 24 * 3600 * 1000,
    skillsAssessed: ['Compliance', 'Customer Retention', 'Soft Tone'],
    growthScore: 45,
    notes: 'Urgent focus needed on security policies and active authentication. David struggles to control aggressive customers and needs scripts for retention paths.',
    challenges: ['Skipping compliance scripts under stress', 'Passive language usage']
  },
  {
    id: 'rpt_2002',
    agentId: 'agt_1289',
    agentName: 'Marcus Sterling',
    managerId: 'mgr_9921',
    managerName: 'Sarah Jenkins',
    date: Date.now() - 10 * 24 * 3600 * 1000,
    skillsAssessed: ['SLA Procedures', 'Refund Disclosures'],
    growthScore: 78,
    notes: 'Marcus is improving in pacing and tracking. Just needs a slight push on standard liability disclaimers when delivering refunds.',
    challenges: ['Missing liability clauses']
  },
  {
    id: 'rpt_2003',
    agentId: 'agt_5634',
    agentName: 'Priya Kapoor',
    managerId: 'mgr_9921',
    managerName: 'Sarah Jenkins',
    date: Date.now() - 1 * 24 * 3600 * 1000,
    skillsAssessed: ['Consultative Selling', 'Product Knowledge', 'Enterprise Features'],
    growthScore: 100,
    notes: 'Top performer. Priya consistently exceeds expectations with exceptional product knowledge, customer empathy, and revenue impact. Recommended for senior/mentorship roles.',
    challenges: []
  }
];

const initialNotifications: AppNotification[] = [
  {
    id: 'not_1',
    userId: 'mgr_9921',
    title: 'Critical Compliance Failure',
    message: 'David Miller failed identity verification protocols on Call #10294. High risk of billing leak.',
    type: 'compliance_violation',
    read: false,
    createdAt: Date.now() - 3 * 3600 * 1000,
    referenceId: 'call_10294'
  },
  {
    id: 'not_2',
    userId: 'mgr_9921',
    title: 'Severe Escalation Alert',
    message: 'Customer Marcus Vance requested a manager transfer due to price grievances on Call #10294.',
    type: 'anger',
    read: false,
    createdAt: Date.now() - 3 * 3600 * 1000,
    referenceId: 'call_10294'
  },
  {
    id: 'not_3',
    userId: 'mgr_9921',
    title: 'Low Call Quality Grade',
    message: 'Call #10294 scored 42/100, which falls below your team benchmark of 75/100.',
    type: 'low_score',
    read: false,
    createdAt: Date.now() - 2.8 * 3600 * 1000,
    referenceId: 'call_10294'
  },
  {
    id: 'not_4',
    userId: 'mgr_9921',
    title: 'Exceptional Performance Recognition',
    message: 'Priya Kapoor achieved 94/100 on enterprise upsell call with high customer satisfaction. Recommended for mentorship role.',
    type: 'high_risk',
    read: false,
    createdAt: Date.now() - 6 * 3600 * 1000,
    referenceId: 'call_10297'
  }
];

export const useAppStore = create<AppState>((set) => ({
  currentUser: defaultUser,
  calls: initialCalls,
  selectedCall: initialCalls[0], // pre-select Dave Miller's disputed call for a great demo
  coachingReports: initialCoaching,
  notifications: initialNotifications,
  copilotMessages: [],
  filters: {
    search: '',
    agent: 'all',
    department: 'all',
    priority: 'all',
    sentiment: 'all'
  },
  syncStatus: 'local',

  setCurrentUser: (currentUser) => set({ currentUser }),
  setCalls: (calls) => set({ calls }),
  setSelectedCall: (selectedCall) => set({ selectedCall }),
  addCall: (call) => set((state) => {
    saveFirestoreCall(call);
    return { calls: [call, ...state.calls] };
  }),
  
  updateCall: (callId, updates) => set((state) => {
    const updatedCalls = state.calls.map((c) => {
      if (c.id === callId) {
        const u = { ...c, ...updates };
        saveFirestoreCall(u);
        return u;
      }
      return c;
    });
    const updatedSelectedCall = state.selectedCall?.id === callId ? { ...state.selectedCall, ...updates } : state.selectedCall;
    return { 
      calls: updatedCalls,
      selectedCall: updatedSelectedCall
    };
  }),

  setCoachingReports: (coachingReports) => set({ coachingReports }),
  addCoachingReport: (report) => set((state) => {
    saveFirestoreCoachingReport(report);
    return { coachingReports: [report, ...state.coachingReports] };
  }),
  updateCoachingReport: (id, updates) => set((state) => {
    const updated = state.coachingReports.map((r) => {
      if (r.id === id) {
        const u = { ...r, ...updates };
        saveFirestoreCoachingReport(u);
        return u;
      }
      return r;
    });
    return { coachingReports: updated };
  }),
  
  setNotifications: (notifications) => set({ notifications }),
  markNotificationAsRead: (id) => set((state) => {
    const updated = state.notifications.map((n) => {
      if (n.id === id) {
        const u = { ...n, read: true };
        saveFirestoreNotification(u);
        return u;
      }
      return n;
    });
    return { notifications: updated };
  }),
  clearNotifications: () => set({ notifications: [] }),
  addNotification: (n) => set((state) => {
    saveFirestoreNotification(n);
    return { notifications: [n, ...state.notifications] };
  }),
  
  setCopilotMessages: (copilotMessages) => set({ copilotMessages }),
  addCopilotMessage: (message) => set((state) => ({ copilotMessages: [...state.copilotMessages, message] })),
  clearCopilotMessages: () => set({ copilotMessages: [] }),
  
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  syncFromFirebase: async () => {
    set({ syncStatus: 'syncing' });
    try {
      const calls = await getFirestoreCalls();
      const coachingReports = await getFirestoreCoachingReports();
      const notifications = await getFirestoreNotifications();
      
      if (calls && calls.length > 0) set({ calls });
      if (coachingReports && coachingReports.length > 0) set({ coachingReports });
      if (notifications && notifications.length > 0) set({ notifications });
      
      set({ syncStatus: 'synced' });
      return true;
    } catch (error) {
      console.warn("Failed to sync from Firebase:", error);
      set({ syncStatus: 'error' });
      return false;
    }
  },
  
  resetStore: () => set({
    currentUser: defaultUser,
    calls: initialCalls,
    selectedCall: initialCalls[0],
    coachingReports: initialCoaching,
    notifications: initialNotifications,
    copilotMessages: [],
    filters: {
      search: '',
      agent: 'all',
      department: 'all',
      priority: 'all',
      sentiment: 'all'
    },
    syncStatus: 'local'
  })
}));
