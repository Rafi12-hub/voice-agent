import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Square, 
  Sparkles, 
  Check, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  ChevronRight, 
  MessageSquareCode,
  Volume2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { CallRecord, TranscriptSegment, KeyMoment } from '../types';

interface Persona {
  id: string;
  customerName: string;
  title: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  scenario: string;
  complianceMandates: string[];
  suggestedPrompts: string[];
}

const PERSONAS: Persona[] = [
  {
    id: 'persona_1',
    customerName: 'Marcus Vance',
    title: 'Disputed Billing & Impending Cancellation',
    category: 'Billing',
    department: 'Customer Retention',
    priority: 'high',
    scenario: 'Customer is extremely upset regarding a sudden $40 bill increase and threatens to cancel service. Requires validation, identity authentication, and presenting packages.',
    complianceMandates: [
      'Customer identity verification (Zip code / Card validation)',
      'FCC billing notification policy disclosure',
      'Avoid defensive jargon ("fine print")'
    ],
    suggestedPrompts: [
      'Customer: "This bill is completely wrong! Nobody told me my introductory price expired!"',
      'Suggested Pivot: "I completely understand your frustration. Let\'s verify your identity and look at active promotions."'
    ]
  },
  {
    id: 'persona_2',
    customerName: 'Robert Kuan (CTO)',
    title: 'Stressed Server Webhook Integration Mismatch',
    category: 'Technical',
    department: 'Enterprise Support',
    priority: 'medium',
    scenario: 'CTO is launching staging servers in 2 hours and is blocked by a 403 Forbidden payload error. Requires technical troubleshooting, header checking, and log validation.',
    complianceMandates: [
      'Environment header validation check',
      'Database logs telemetry query confirmation',
      'Verify connection security statement'
    ],
    suggestedPrompts: [
      'Customer: "We are getting a 403 Forbidden on our Firebase integration. Staging goes live in under 2 hours!"',
      'Suggested Pivot: "Let\'s check the Bearer token location in your header request structure together."'
    ]
  },
  {
    id: 'persona_3',
    customerName: 'Elena Rostova',
    title: 'Missed Next-Day SLA Delivery Complaint',
    category: 'Shipping',
    department: 'Enterprise Support',
    priority: 'high',
    scenario: 'Customer ordered an anniversary present via paid next-day air which has been delayed. Extremely disappointed and demanding full refund + gift credits.',
    complianceMandates: [
      'Read shipping SLA liability waiver disclaimer',
      'SLA sorting delay explanation policy',
      'Log tracking reference in internal CRM'
    ],
    suggestedPrompts: [
      'Customer: "I paid for next-day shipping and it\'s three days late! This is completely unacceptable!"',
      'Suggested Pivot: "I am deeply sorry. Let me issue the delivery credit, and log this sorted terminal delay."'
    ]
  }
];

export const CallRecorder: React.FC = () => {
  const navigate = useNavigate();
  const { addCall, setSelectedCall, addNotification, currentUser } = useAppStore();

  // State Management
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Real-time dialogue transcription
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [dialogueLogs, setDialogueLogs] = useState<{ speaker: 'agent' | 'customer'; text: string; time: number }[]>([]);

  // Grading loader state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // Audio Context and Speech Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAllStreams = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
  }, []);

  const addDialogueSegment = useCallback((speaker: 'agent' | 'customer', text: string) => {
    setDialogueLogs(prev => [...prev, { speaker, text, time: recordingTime }]);
    
    const newSegment: TranscriptSegment = {
      id: `seg_${Math.floor(Math.random() * 90000) + 10000}`,
      speaker,
      text,
      startTime: recordingTime > 4 ? recordingTime - 4 : 0,
      endTime: recordingTime,
      sentiment: speaker === 'customer' 
        ? (selectedPersona.id === 'persona_1' || selectedPersona.id === 'persona_3' ? 'negative' : 'neutral') 
        : 'positive',
      confidence: 0.94 + Math.random() * 0.05
    };
    
    setTranscriptSegments(prev => [...prev, newSegment]);
  }, [recordingTime, selectedPersona]);

  // Simulate customer automated replies when microphone speech triggers pause
  const simulateCustomerReply = useCallback((agentSpokenText: string) => {
    const textLower = agentSpokenText.toLowerCase();
    setTimeout(() => {
      let reply: string;
      if (selectedPersona.id === 'persona_1') {
        if (textLower.includes('verify') || textLower.includes('security') || textLower.includes('identity')) {
          reply = `Fine. My billing zip code is 90210, and the last four digits of my card is 8821. Can you please check the $120 rate now?`;
        } else if (textLower.includes('frustrated') || textLower.includes('sorry') || textLower.includes('empathy')) {
          reply = `I know you didn't set the price yourself, but paying $120 instead of $80 is crazy! Can you get me onto a better package?`;
        } else {
          reply = `I don't care about standard terms! I was promised it was a flat rate. If you can't lower it back, I want a supervisor or cancellation!`;
        }
      } else if (selectedPersona.id === 'persona_2') {
        if (textLower.includes('bearer') || textLower.includes('token') || textLower.includes('auth')) {
          reply = `Aha! You know what, let me check our staging configuration file... Oh, the token was appended to the body parameter rather than headers. Let me redeploy that!`;
        } else if (textLower.includes('logs') || textLower.includes('telemetry') || textLower.includes('check')) {
          reply = `Checking the connection logs... it's showing a 403 Forbidden payload constantly on hook callbacks. Is it a security lock?`;
        } else {
          reply = `Yes, staging server launches fully in an hour. We really need to verify if the headers match.`;
        }
      } else {
        if (textLower.includes('waiver') || textLower.includes('credit') || textLower.includes('liability')) {
          reply = `I appreciate the credit. Anniversary event is still completely ruined, but the $50 card makes it a bit better. Just ensure it gets here tomorrow.`;
        } else if (textLower.includes('sorry') || textLower.includes('delay') || textLower.includes('terminal')) {
          reply = `Why was it held in the sorting terminal for three whole days if I paid for next-day air? That's what I don't understand.`;
        } else {
          reply = `I just want to know when my tracking code will update. This delay is super frustrating.`;
        }
      }
      
      addDialogueSegment('customer', reply || 'I am extremely disappointed by this situation.');
    }, 1500);
  }, [selectedPersona, addDialogueSegment]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const w = window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const SpeechRecognitionCtor = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      { new(): { start: () => void; stop: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null } } | undefined;
    if (SpeechRecognitionCtor) {
      const rec = new SpeechRecognitionCtor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } } }) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          addDialogueSegment('agent', finalTranscript.trim());
          setCurrentSpeechText('');
          
          simulateCustomerReply(finalTranscript.trim());
        } else {
          setCurrentSpeechText(interimTranscript);
        }
      };

      rec.onerror = () => {
        console.warn('Speech recognition unavailable or denied');
      };

      recognitionRef.current = rec;
    }

    return () => {
      stopAllStreams();
    };
  }, [selectedPersona, addDialogueSegment, simulateCustomerReply, stopAllStreams]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Canvas waveform draw loop
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current?.getByteTimeDomainData(dataArray);

      // Clean background with a very subtle fade for cool motion-blur path trailing
      ctx.fillStyle = 'rgba(18, 18, 30, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      // Beautiful gradient color linking brand and secondary (violet and cyan)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalized wave factor [0, 2]
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // Direct mock visual wave drawing if mic permission is denied or blocked
  const drawMockWave = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      ctx.fillStyle = 'rgba(18, 18, 30, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#ec4899');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      // Render 3 overlapping smooth sine waves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const amplitude = (30 - w * 8) * (isPaused ? 0.05 : 1);
        const speed = 0.08 + w * 0.02;
        
        for (let x = 0; x < canvas.width; x++) {
          const angle = (x / 50) + phase * speed;
          const y = (canvas.height / 2) + Math.sin(angle) * amplitude * Math.sin(x / 100);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += 1;
    };
    draw();
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setDialogueLogs([]);
    setTranscriptSegments([]);

    // Initialize timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyzer
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      // Start speech recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* not started */ }
      }

      drawWaveform();

      // Greeting speech intro from Persona context
      setTimeout(() => {
        addDialogueSegment('agent', `Hello, agent speaking. Thank you for calling Customer Support. How can I help you today?`);
      }, 800);

    } catch (err) {
      console.warn('Microphone access denied, using interactive synthesized mock engine:', err);
      
      // Draw simulated mathematical wave
      drawMockWave();

      // Inject greeting intro
      setTimeout(() => {
        addDialogueSegment('agent', `Hello, thank you for calling. My name is Agent Sarah. How can I assist you?`);
        
        // Auto trigger customer starting line based on persona
        setTimeout(() => {
          const starter = selectedPersona.suggestedPrompts[0]?.split('Customer: "')?.[1]?.replace('"', '') || 
                          "Hi, I have a major complaint that I need resolved immediately.";
          addDialogueSegment('customer', starter);
        }, 1200);
      }, 600);
    }
  };

  // (moved before useEffect for proper closure capture)

  // Simulated Manual Dialogue Typer / Auto-Filler for offline mockup demo
  const handleOfflineDialogueInjection = (speaker: 'agent' | 'customer') => {
    if (speaker === 'agent') {
      const agentOptions = [
        `Could you please verify your billing zip code and customer identity credentials?`,
        `Let me review your package discounts immediately to see if we can optimize the pricing.`,
        `I am reviewing our regional carrier sorting terminal logs. It was delayed due to winter weather.`,
        `For your security, I have logged this tracking reference number into our compliance dashboard.`,
        `Let's double-check the authorization header bearer token together to resolve this webhook issue.`
      ];
      const randomText = agentOptions[Math.floor(Math.random() * agentOptions.length)];
      addDialogueSegment('agent', randomText);
      simulateCustomerReply(randomText);
    } else {
      const customerOptions = [
        `I am looking at the invoice and it went from $80 to $120. I want an explanation immediately!`,
        `Introductory rate expired? Nobody gave me any notifications! This is completely fraudulent!`,
        `We are receiving a 403 Forbidden payload on staging connections. We need a live fix.`,
        `Sorting sorting sorted issues? Next-day air means next-day delivery, not next week!`,
        `Yes! Changing the header bearer token worked perfectly! The database is synced.`
      ];
      addDialogueSegment('customer', customerOptions[Math.floor(Math.random() * customerOptions.length)]);
    }
  };

  const handleStopRecording = () => {
    stopAllStreams();
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // If dialogue logs are empty, inject a comprehensive dummy call simulation
    if (dialogueLogs.length <= 1) {
      generateDummyDialogueLogs();
    }
  };

  const generateDummyDialogueLogs = () => {
    let mockDialog: { speaker: 'agent' | 'customer'; text: string; time: number }[];
    if (selectedPersona.id === 'persona_1') {
      mockDialog = [
        { speaker: 'agent', text: 'Hello, welcome to support. My name is David. How can I help you today?', time: 0 },
        { speaker: 'customer', text: 'Yeah, I am looking at my latest billing invoice and it is completely wrong! My bill went from $80 to $120. I want an explanation right now!', time: 5 },
        { speaker: 'agent', text: 'I understand that is a surprise. Let\'s verify your billing zip code and last four digits on file before we look into account details.', time: 12 },
        { speaker: 'customer', text: 'Zip code is 90210, card digits 8812. Please hurry, this is extremely frustrating.', time: 18 },
        { speaker: 'agent', text: 'Thank you. I see your 12-month introductory rate expired. I can apply our active loyalty promotion of $15 off to lower it back down immediately.', time: 25 },
        { speaker: 'customer', text: 'Well, that\'s a lot better than $120. I appreciate you finding that discount. Please go ahead and apply it.', time: 32 }
      ];
    } else if (selectedPersona.id === 'persona_2') {
      mockDialog = [
        { speaker: 'agent', text: 'Thank you for contacting Enterprise Engineering support. This is Jessica. Am I speaking with Mr. Robert Kuan?', time: 0 },
        { speaker: 'customer', text: 'Yes, Jessica. We keep getting a 403 Forbidden payload on the Firebase staging hook. Staging goes live in under 2 hours!', time: 6 },
        { speaker: 'agent', text: 'I completely understand the urgency, Robert. Let\'s check the Bearer token location in your headers request structure.', time: 15 },
        { speaker: 'customer', text: 'Ah! We mapped it inside the payload object instead of the authorization header blocks. Let me redeploy.', time: 22 },
        { speaker: 'agent', text: 'Perfect. Let\'s query the connection telemetry metrics on our database once the deployment finishes.', time: 29 },
        { speaker: 'customer', text: 'Wow, it works perfectly now! Telemetry confirms 100% operational connection. You saved us a massive headache.', time: 36 }
      ];
    } else {
      mockDialog = [
        { speaker: 'agent', text: 'Thank you for calling shipping support. This is Marcus. Can I have your order reference code?', time: 0 },
        { speaker: 'customer', text: 'Yes, it is 8812A. This next-day air package is three days late! The anniversary event has passed, this is unacceptable.', time: 6 },
        { speaker: 'agent', text: 'I am deeply sorry for this Sorting Terminal delay, Elena. Let me issue a full $20 shipping refund and a $30 gift card immediately.', time: 14 },
        { speaker: 'customer', text: 'Well, I appreciate the quick resolution and refunds, but I still want to ensure it arrives tomorrow.', time: 22 },
        { speaker: 'agent', text: 'I\'ve verified carrier logs, and it is in sorting, scheduled for delivery by 10 AM. Please note standard carrier liability limits apply here.', time: 28 },
        { speaker: 'customer', text: 'Fine. Thank you for issuing the credits and explaining the sorting delay. That helps.', time: 35 }
      ];
    }

    setDialogueLogs(mockDialog);
    
    // Generate strict transcripts
    const segs: TranscriptSegment[] = mockDialog.map((m, idx) => ({
      id: `seg_${idx}_${Math.floor(Math.random() * 1000)}`,
      speaker: m.speaker,
      text: m.text,
      startTime: m.time,
      endTime: m.time + 5,
      sentiment: m.speaker === 'customer' 
        ? (selectedPersona.id === 'persona_1' || selectedPersona.id === 'persona_3' ? 'negative' : 'neutral') 
        : 'positive',
      confidence: 0.96
    }));
    setTranscriptSegments(segs);
    setRecordingTime(mockDialog[mockDialog.length - 1].time + 6);
  };

  // Multi-step Audio Analysis Pipeline Loader
  const handleAnalyzeCall = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisLogs(['[INFO] Fetching raw PCM browser audio buffer...']);

    // Step 1: Waveforms conversion
    setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisLogs(prev => [
        ...prev,
        '[SUCCESS] Audio wave streams formatted to standard WAV format.',
        '[INFO] Launching Voice AI Transcription pipeline...'
      ]);

      // Step 2: Speech-to-Text Speech analysis
      setTimeout(() => {
        setAnalysisStep(3);
        setAnalysisLogs(prev => [
          ...prev,
          '[SUCCESS] Speech recognition transcribed 100% of conversation dialogues.',
          `[INFO] Auditing dialog transcripts against Selected Persona: ${selectedPersona.customerName}`,
          '[INFO] Analyzing compliance mandates...'
        ]);

        // Step 3: Compliance & Scoring audit
        setTimeout(() => {
          setAnalysisStep(4);
          setAnalysisLogs(prev => [
            ...prev,
            '[SUCCESS] Evaluated 10 essential QA soft-skills parameters.',
            '[SUCCESS] Risk Scorecard and customer churn metrics calculated.',
            '[INFO] Generating custom AI supervisor coaching roadmap...'
          ]);

          // Step 4: Finalize and save
          setTimeout(() => {
            finalizeCallScoringRecord();
          }, 1200);

        }, 1500);

      }, 1500);

    }, 1500);
  };

  const finalizeCallScoringRecord = () => {
    // Gather all text fields from active recording
    const agentTexts = dialogueLogs.filter(d => d.speaker === 'agent').map(d => d.text.toLowerCase());
    const customerTexts = dialogueLogs.filter(d => d.speaker === 'customer').map(d => d.text.toLowerCase());
    const allTextJoined = dialogueLogs.map(d => d.text.toLowerCase()).join(' ');

    const hasEmpathy = agentTexts.some(t => t.includes('sorry') || t.includes('apolog') || t.includes('understand') || t.includes('help') || t.includes('thank'));
    const hasVerification = agentTexts.some(t => t.includes('verify') || t.includes('identity') || t.includes('zip') || t.includes('card') || t.includes('bearer') || t.includes('token') || t.includes('code') || t.includes('billing') || t.includes('license'));

    // Check for customer feedback keywords
    const hasNegativeCustomer = customerTexts.some(t => t.includes('bad') || t.includes('wrong') || t.includes('angry') || t.includes('cancel') || t.includes('scam') || t.includes('ridiculous') || t.includes('frustrat') || t.includes('disappoint') || t.includes('late'));
    const hasPositiveCustomer = customerTexts.some(t => t.includes('thank') || t.includes('great') || t.includes('work') || t.includes('perfect') || t.includes('resolve') || t.includes('appreciate') || t.includes('lifesaver'));

    // Scoring logic (0-100)
    let empathyScore = 70;
    if (hasEmpathy) empathyScore = 95;
    
    let complianceScore = 30;
    if (hasVerification) complianceScore = 100;

    let toneScore = 75;
    if (hasEmpathy) toneScore += 15;
    if (hasNegativeCustomer) toneScore -= 10;

    let productKnowledgeScore = 80;
    if (allTextJoined.includes('api') || allTextJoined.includes('token') || allTextJoined.includes('staging') || allTextJoined.includes('billing') || allTextJoined.includes('invoice') || allTextJoined.includes('sla') || allTextJoined.includes('refund')) {
      productKnowledgeScore = 95;
    }

    let resolutionScore = 60;
    if (hasPositiveCustomer) resolutionScore = 98;
    else if (hasNegativeCustomer) resolutionScore = 45;

    // Overall Score calculation
    const score = Math.round((empathyScore + complianceScore + toneScore + productKnowledgeScore + resolutionScore) / 5);

    // Churn and Risk values
    let customerAngerLevel = 30;
    if (hasNegativeCustomer) customerAngerLevel = 85;
    if (hasPositiveCustomer) customerAngerLevel = 10;

    let churnRisk = 20;
    if (hasNegativeCustomer && score < 70) churnRisk = 80;
    if (hasPositiveCustomer) churnRisk = 5;

    let escalationRisk = 20;
    if (hasNegativeCustomer) escalationRisk = 75;
    if (hasPositiveCustomer) escalationRisk = 5;

    let complianceViolations = hasVerification ? 0 : 1;

    const overallRiskScore = Math.round((churnRisk + customerAngerLevel + escalationRisk + (complianceViolations * 100)) / 4);

    // Key Moments generated dynamically from logs
    const keyMoments: KeyMoment[] = [];
    
    // First customer segment or fallback
    const firstCustomerLog = dialogueLogs.find(d => d.speaker === 'customer');
    if (firstCustomerLog) {
      keyMoments.push({
        id: `km_c_${Math.floor(Math.random() * 90000)}`,
        timestamp: firstCustomerLog.time,
        type: 'negative',
        description: `Customer expresses issue: "${firstCustomerLog.text.slice(0, 50)}${firstCustomerLog.text.length > 50 ? '...' : ''}"`
      });
    } else {
      keyMoments.push({
        id: `km_c_${Math.floor(Math.random() * 90000)}`,
        timestamp: 4,
        type: 'negative',
        description: `Customer starts call with complaint query.`
      });
    }

    // Compliance key moment
    keyMoments.push({
      id: `km_comp_${Math.floor(Math.random() * 90000)}`,
      timestamp: Math.min(15, recordingTime),
      type: hasVerification ? 'positive' : 'coaching',
      description: hasVerification 
        ? 'Compliance Met: Agent successfully performed required validation check.'
        : 'Compliance Issue: Agent skipped customer authentication protocol.'
    });

    // Resolution moment
    const lastCustomerLog = [...dialogueLogs].reverse().find(d => d.speaker === 'customer');
    if (lastCustomerLog && hasPositiveCustomer) {
      keyMoments.push({
        id: `km_res_${Math.floor(Math.random() * 90000)}`,
        timestamp: lastCustomerLog.time,
        type: 'resolution',
        description: `Call resolved: "${lastCustomerLog.text.slice(0, 50)}"`
      });
    } else {
      keyMoments.push({
        id: `km_res_${Math.floor(Math.random() * 90000)}`,
        timestamp: recordingTime,
        type: score >= 70 ? 'resolution' : 'escalation',
        description: score >= 70 ? 'Call successfully pacified and logged.' : 'Call terminated without standard billing/SLA resolution.'
      });
    }

    // Coaching comments based on exact words
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (hasEmpathy) {
      strengths.push('Demonstrated strong support empathy and customer concern.');
    } else {
      weaknesses.push('Lacked empathetic verbal markers (sorry, understand).');
    }

    if (hasVerification) {
      strengths.push('Adhered to company validation policies correctly.');
    } else {
      weaknesses.push('Bypassed security identification guidelines during customer query.');
    }

    if (hasPositiveCustomer) {
      strengths.push('Achieved high customer satisfaction rating and resolution confirmation.');
    } else if (hasNegativeCustomer) {
      weaknesses.push('Call ended with unresolved complaints or customer agitation.');
    }

    const opportunities = [
      hasVerification 
        ? 'Continue verifying all clients before reviewing CRM data.' 
        : 'Must practice validation script blocks under manager supervision.',
      'Participate in active listening training simulations.'
    ];

    const suggestedResponses = hasVerification 
      ? [`"I appreciate your patience, let's complete the file validation."`]
      : [`"Before we pull your details, could I please verify your zip code or API key?"`];

    // Assemble completed CallRecord
    const newCall: CallRecord = {
      id: `call_${Math.floor(Math.random() * 90000) + 10000}`,
      title: `Voice Analysis - ${selectedPersona.customerName}`,
      agentId: currentUser.uid,
      agentName: currentUser.displayName,
      customerName: selectedPersona.customerName,
      organizationId: currentUser.organizationId,
      category: selectedPersona.category,
      department: selectedPersona.department,
      priority: selectedPersona.priority,
      duration: recordingTime,
      audioUrl: '',
      status: 'completed',
      score,
      sentiment: score >= 80 ? 'positive' : score >= 60 ? 'neutral' : 'negative',
      date: Date.now(),
      notes: `AI voice audit completed for agent ${currentUser.displayName}. Analysis shows empathy was ${hasEmpathy ? 'MET' : 'MISSED'} and security checks were ${hasVerification ? 'MET' : 'MISSED'}. Customer sentiment was ${hasPositiveCustomer ? 'satisfied' : hasNegativeCustomer ? 'agitated' : 'neutral'}.`,
      metrics: {
        empathy: empathyScore,
        clarity: 85,
        activeListening: hasEmpathy ? 90 : 65,
        resolution: resolutionScore,
        tone: toneScore,
        professionalism: 90,
        confidence: 85,
        ownership: 80,
        productKnowledge: productKnowledgeScore,
        compliance: complianceScore
      },
      risk: {
        churnRisk,
        escalationRisk,
        complaintSeverity: selectedPersona.priority === 'high' ? 85 : 45,
        complianceViolations,
        customerAngerLevel,
        overallRiskScore
      },
      transcript: transcriptSegments,
      keyMoments,
      coaching: {
        strengths,
        weaknesses,
        opportunities,
        suggestedResponses,
        coachingPlanMarkdown: `### 🎯 Custom Performance Coaching Plan\n\n**Agent**: ${currentUser.displayName}\n**QA Score**: ${score}%\n\n#### 📈 Key Takeaways:\n- Empathy: ${hasEmpathy ? 'Good job remaining friendly.' : 'Needs training on customer care scripts.'}\n- Compliance: ${hasVerification ? '100% security authentication pass.' : 'Failed standard security protocols.'}`
      }
    };

    // Save record to Zustand
    addCall(newCall);

    // Create a new notification alert
    addNotification({
      id: `not_${Date.now()}`,
      userId: currentUser.uid,
      title: score >= 75 ? 'Voice QA Review Passed' : 'QA Quality Compliance Failure',
      message: `Recording with ${selectedPersona.customerName} scored ${score}%. ${hasAgentVerification ? 'Mandatory checklists met.' : 'Warning: Authentication policy was bypassed.'}`,
      type: score >= 75 ? 'system' : 'compliance_violation',
      read: false,
      createdAt: Date.now(),
      referenceId: newCall.id
    });

    // Reset loader, select call and navigate to details
    setIsAnalyzing(false);
    setSelectedCall(newCall);
    navigate('/calls');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Title */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Live Call Quality Recorder</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Record active customer dialogues, analyze compliance policies, and auto-grade customer support in real time.</p>
      </div>

      {isAnalyzing ? (
        /* Dynamic Loader Pipeline screen */
        <div className="glass fade-in" style={{ padding: '64px 32px', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '700px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '28px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={52} className="text-purple-500 animate-spin" style={{ animationDuration: '2.5s' }} />
            <Sparkles size={24} className="text-purple-400" style={{ position: 'absolute' }} />
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Evaluating Voice Quality...</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>AI Speech Pipeline is processing compliance and scoring structures</p>
          </div>

          {/* Progress Indicators */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: analysisStep >= 1 ? 'var(--color-success)' : 'var(--text-muted)', fontSize: '14px' }}>
              <Check size={16} color={analysisStep >= 1 ? 'var(--color-success)' : 'var(--text-muted)'} />
              <span>1. Capturing raw browser microphone wave frequencies</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: analysisStep >= 2 ? 'var(--color-success)' : analysisStep === 1 ? 'var(--color-brand)' : 'var(--text-muted)', fontSize: '14px' }}>
              <Check size={16} color={analysisStep >= 2 ? 'var(--color-success)' : 'var(--text-muted)'} />
              <span>2. Running neural Speech-to-Text voice transcription</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: analysisStep >= 3 ? 'var(--color-success)' : analysisStep === 2 ? 'var(--color-brand)' : 'var(--text-muted)', fontSize: '14px' }}>
              <Check size={16} color={analysisStep >= 3 ? 'var(--color-success)' : 'var(--text-muted)'} />
              <span>3. Auditing mandatory QA compliance checklists & risk scores</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: analysisStep >= 4 ? 'var(--color-success)' : analysisStep === 3 ? 'var(--color-brand)' : 'var(--text-muted)', fontSize: '14px' }}>
              <Check size={16} color={analysisStep >= 4 ? 'var(--color-success)' : 'var(--text-muted)'} />
              <span>4. Formatting dynamic competencies radar graphs & review logs</span>
            </div>
          </div>

          {/* Console Debug Logs */}
          <div style={{ width: '100%', textAlign: 'left', background: '#07070a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: '14px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#38bdf8', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {analysisLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Recording setup page */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '28px' }}>
          
          {/* Left panel: Persona Selector list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} className="text-purple-400" />
                Select Customer Scenario
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <div 
                      key={persona.id}
                      onClick={() => !isRecording && setSelectedPersona(persona)}
                      style={{ 
                        padding: '14px', 
                        borderRadius: 'var(--radius-sm)', 
                        border: `1px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-color)'}`,
                        background: isSelected ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
                        cursor: isRecording ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition)'
                      }}
                      className={isRecording ? '' : 'gradient-card-hover'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: isSelected ? '#c084fc' : 'var(--text-primary)' }}>{persona.customerName}</span>
                        <span className={`badge ${persona.priority === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '2px 8px', fontSize: '9px' }}>
                          {persona.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {persona.category} • {persona.department}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>{persona.scenario}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compliance Policy Card Checklist */}
            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} className="text-red-400" />
                Mandatory QA Disclosures
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>Agents are evaluated on reading and mentioning these items during the call.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedPersona.complianceMandates.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-danger)', marginTop: '7px', flexShrink: 0 }} />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Active Voice Recording Canvas & Live logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Recorder console */}
            <div className="glass" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Voice Assessment console</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{selectedPersona.title}</h3>
                </div>

                {/* Live Digital Timer */}
                <div style={{ background: '#0a0a0f', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 'bold', color: isRecording ? '#ec4899' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRecording ? '#ec4899' : 'var(--text-muted)', animation: isRecording ? 'pulse 1.2s infinite' : '' }} />
                  <span>
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Sound Wave Canvas Wrapper */}
              <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-md)', background: '#12121e', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <canvas 
                  ref={canvasRef} 
                  width={600} 
                  height={140} 
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {!isRecording && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(10, 10, 15, 0.4)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
                      <Mic size={20} />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ready for voice recording session</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
                {!isRecording ? (
                  <button 
                    onClick={handleStartRecording}
                    style={{ 
                      background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-secondary) 100%)', 
                      color: 'white', 
                      padding: '14px 28px', 
                      borderRadius: 'var(--radius-full)', 
                      fontWeight: '700', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(139, 92, 246, 0.35)',
                      transition: 'var(--transition)'
                    }}
                    className="gradient-card-hover"
                  >
                    <Mic size={18} />
                    <span>Start Recording Session</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleStopRecording}
                      style={{ 
                        background: 'var(--color-danger)', 
                        color: 'white', 
                        padding: '12px 24px', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: '600', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
                        transition: 'var(--transition)'
                      }}
                      className="gradient-card-hover"
                    >
                      <Square size={16} />
                      <span>End & Finalize Recording</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Live Transcription / Script Dialogue logging */}
            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquareCode size={16} className="text-cyan-400" />
                  Live Dialogue Transcripts
                </h3>

                {isRecording && (
                  <span style={{ fontSize: '11px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', animation: 'pulse 1.5s infinite' }}>
                    <Volume2 size={12} />
                    Listening live...
                  </span>
                )}
              </div>

              {/* Scrolling bubble chat */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-color)', height: '240px', overflowY: 'auto' }}>
                {dialogueLogs.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', flexDirection: 'column', gap: '8px' }}>
                    <span>Active dialog bubbles show here as you talk into your microphone.</span>
                    <span style={{ fontSize: '11px' }}>Or click below to simulate conversation lines offline.</span>
                  </div>
                ) : (
                  dialogueLogs.map((log, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        alignSelf: log.speaker === 'agent' ? 'flex-start' : 'flex-end',
                        background: log.speaker === 'agent' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 92, 246, 0.08)',
                        border: `1px solid ${log.speaker === 'agent' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(139, 92, 246, 0.15)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                        maxWidth: '85%',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}
                      className="fade-in"
                    >
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                        {log.speaker === 'agent' ? currentUser.displayName : selectedPersona.customerName}
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{log.text}</div>
                    </div>
                  ))
                )}
                {currentSpeechText && (
                  <div 
                    style={{ 
                      alignSelf: 'flex-start',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--color-brand)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      maxWidth: '85%',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {currentSpeechText}...
                  </div>
                )}
              </div>

              {/* Simulation triggers helper panel */}
              {isRecording && (
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleOfflineDialogueInjection('agent')}
                    style={{ 
                      flexGrow: 1, 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '8px 12px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}
                    className="gradient-card-hover"
                  >
                    <span>Say Agent compliance line</span>
                    <ChevronRight size={13} />
                  </button>
                  <button 
                    onClick={() => handleOfflineDialogueInjection('customer')}
                    style={{ 
                      flexGrow: 1, 
                      background: 'rgba(139, 92, 246, 0.05)', 
                      border: '1px solid rgba(139, 92, 246, 0.15)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '8px 12px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center',
                      color: '#c084fc'
                    }}
                    className="gradient-card-hover"
                  >
                    <span>Trigger Customer complaint line</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {/* Analyze execution trigger when recording finishes */}
              {!isRecording && dialogueLogs.length > 0 && (
                <button 
                  onClick={handleAnalyzeCall}
                  style={{ 
                    background: 'var(--color-success)', 
                    color: 'white', 
                    padding: '14px 28px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                    transition: 'var(--transition)',
                    marginTop: '8px'
                  }}
                  className="gradient-card-hover"
                >
                  <Sparkles size={16} />
                  <span>Analyze Recorded Audio Session</span>
                </button>
              )}
            </div>

          </div>

          {/* Keyframe Pulsing and Bounce styling declarations */}
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}</style>

        </div>
      )}

    </div>
  );
};
