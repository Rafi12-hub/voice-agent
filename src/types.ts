export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'manager' | 'agent';
  organizationId: string;
  departmentId?: string;
  photoURL?: string;
  createdAt: number;
}

export interface Department {
  id: string;
  name: string;
  organizationId: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  organizationId: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  startTime: number;
  endTime: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface KeyMoment {
  id: string;
  timestamp: number;
  type: 'positive' | 'negative' | 'escalation' | 'coaching' | 'resolution';
  description: string;
}

export interface CallMetrics {
  empathy: number;
  clarity: number;
  activeListening: number;
  resolution: number;
  tone: number;
  professionalism: number;
  confidence: number;
  ownership: number;
  productKnowledge: number;
  compliance: number;
}

export interface CallRisk {
  churnRisk: number;
  escalationRisk: number;
  complaintSeverity: number;
  complianceViolations: number;
  customerAngerLevel: number;
  overallRiskScore: number;
}

export interface CallCoaching {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  suggestedResponses: string[];
  coachingPlanMarkdown: string;
}

export interface CallRecord {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  customerName: string;
  organizationId: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  duration: number;
  audioUrl: string;
  status: 'processing' | 'completed' | 'failed';
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: number;
  notes?: string;
  metrics: CallMetrics;
  risk: CallRisk;
  transcript: TranscriptSegment[];
  keyMoments: KeyMoment[];
  coaching: CallCoaching;
}

export interface CoachingReport {
  id: string;
  agentId: string;
  agentName: string;
  managerId: string;
  managerName: string;
  date: number;
  skillsAssessed: string[];
  growthScore: number;
  notes: string;
  challenges: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'low_score' | 'high_risk' | 'anger' | 'compliance_violation' | 'system';
  read: boolean;
  createdAt: number;
  referenceId?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}
