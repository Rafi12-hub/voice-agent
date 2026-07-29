import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass">
        <div className="auth-header">
          <div className="auth-logo gradient-brand">
            <Mic size={24} className="text-white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {sent ? 'Check your email for reset instructions' : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="auth-form">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                If an account with <strong>{email}</strong> exists, you will receive a password reset email shortly.
              </p>
            </div>
            <Link to="/login" className="auth-btn gradient-brand" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn gradient-brand" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-dots">Sending...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Send Reset Link <Send size={16} />
                </span>
              )}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
