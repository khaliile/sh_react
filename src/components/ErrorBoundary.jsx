import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });

    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_boundary_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
        sessionStorage.setItem('chunk_boundary_reload', now.toString());
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    if (window.confirm('Reset local storage cache to fix corrupted state? Your main study logs will be preserved if possible.')) {
      try {
        localStorage.removeItem('app_routine_schedule');
        localStorage.removeItem('app_manual_active_task');
        localStorage.removeItem('app_routine_is_customized');
      } catch { /* noop */ }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#090d16',
          color: '#e2e8f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '560px',
            background: '#131b2e',
            border: '1px solid #ef444455',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Something went wrong</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Reload App
              </button>
              <button
                onClick={this.handleResetStorage}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid #ef444466',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Repair Corrupted Data
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
