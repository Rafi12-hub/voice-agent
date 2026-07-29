import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore } from './store/useAppStore';
import './App.css';

const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const CallList = lazy(() => import('./components/CallList').then(m => ({ default: m.CallList })));
const CallDetail = lazy(() => import('./components/CallDetail').then(m => ({ default: m.CallDetail })));
const CallRecorder = lazy(() => import('./components/CallRecorder').then(m => ({ default: m.CallRecorder })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Coach = lazy(() => import('./pages/Coach').then(m => ({ default: m.Coach })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    gap: '12px'
  }}>
    <div className="wave-bar" style={{ height: '16px', width: '4px', animationDelay: '0.1s' }} />
    <div className="wave-bar" style={{ height: '16px', width: '4px', animationDelay: '0.3s' }} />
    <div className="wave-bar" style={{ height: '16px', width: '4px', animationDelay: '0.5s' }} />
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
          <Route path="/*" element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/record" element={<CallRecorder />} />
                  <Route path="/calls" element={<CallPage />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/coach" element={<Coach />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

function CallPage() {
  const selectedCall = useAppStore((s) => s.selectedCall);
  return selectedCall ? <CallDetail /> : <CallList />;
}

export default App;
