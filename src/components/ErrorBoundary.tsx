import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches any render-time error in the React tree and shows a recovery
 * screen instead of a blank white page. Critical safety net — without this,
 * a single undefined property access blanks the entire app.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleClearAndReset = () => {
    // Last-resort recovery: clear local state and reload.
    try {
      localStorage.removeItem('persona_credit_db_v1');
    } catch { /* ignore */ }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '440px',
            background: 'white',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: '#0F292F', margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '24px', fontWeight: 'bold',
            }}>!</div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: '0 0 28px' }}>
              The page hit an unexpected error. Your data is safe — you can return to the homepage
              and your saved report will still be there.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                width: '100%', padding: '14px', background: '#0F292F', color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              Return to Homepage
            </button>
            <button
              onClick={this.handleClearAndReset}
              style={{
                width: '100%', padding: '14px', background: 'transparent', color: '#94A3B8',
                border: 'none', fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              Reset & Start Fresh
            </button>
            {this.state.error && (
              <p style={{
                fontSize: '10px', color: '#CBD5E1', marginTop: '20px',
                wordBreak: 'break-word', fontFamily: 'monospace',
              }}>
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
