import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '48px',
          textAlign: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            ⚠️
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.5' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            style={{
              background: 'var(--color-brand)',
              color: 'white',
              padding: '12px 28px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
          {this.state.error && (
            <details style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '600px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Error Details</summary>
              <pre style={{
                marginTop: '8px',
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                lineHeight: '1.4'
              }}>
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
