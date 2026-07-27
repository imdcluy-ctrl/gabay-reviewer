import React, { Component } from 'react';

interface RootErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

/** Root-level ErrorBoundary — catches ANY unhandled render crash
 *  and shows a recovery UI instead of a blank white page. */
export class RootErrorBoundary extends Component<
  { children: React.ReactNode },
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RootErrorBoundary] Caught render crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            padding: '2rem',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'var(--color-bg-primary, #0F172A)',
            color: 'var(--color-text-primary, #F1F5F9)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary, #94A3B8)',
              maxWidth: '480px',
              margin: '0 0 1.5rem',
              lineHeight: 1.5,
            }}
          >
            Gabay encountered an unexpected error. This is usually temporary — please try reloading.
          </p>
          {this.state.error && (
            <pre
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                maxWidth: '600px',
                overflow: 'auto',
                textAlign: 'left',
                color: '#F87171',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                background: '#0D7377',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload App
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--color-text-primary, #F1F5F9)',
                border: '1.5px solid var(--color-border, #334155)',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
