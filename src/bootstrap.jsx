import React from 'react';
import { createRoot } from 'react-dom/client';
import './supabase-app.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f3ec', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 720, width: '100%', background: '#fff', border: '1px solid #e2ded4', borderRadius: 16, padding: 28, boxShadow: '0 20px 60px #00000010' }}>
            <h1 style={{ marginTop: 0, color: '#7f1d1d' }}>EJ PNG system error</h1>
            <p>The application loaded, but a browser error stopped the interface.</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f5ef', padding: 16, borderRadius: 10, overflow: 'auto' }}>{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, padding: '12px 18px', background: '#173b2c', color: '#fff', fontWeight: 700 }}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root'));

import('./supabase-app.jsx')
  .then(({ default: App }) => {
    if (App) {
      root.render(<ErrorBoundary><App /></ErrorBoundary>);
      return;
    }
    // supabase-app currently mounts itself, so this path is only a safety net.
    root.render(<ErrorBoundary><div className="loading">Loading EJ PNG Management System…</div></ErrorBoundary>);
  })
  .catch((error) => {
    root.render(
      <ErrorBoundary>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f3ec', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 720, width: '100%', background: '#fff', border: '1px solid #e2ded4', borderRadius: 16, padding: 28 }}>
            <h1 style={{ marginTop: 0, color: '#7f1d1d' }}>EJ PNG system could not start</h1>
            <p>We caught the startup error so the page will no longer appear as a blank screen.</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f5ef', padding: 16, borderRadius: 10, overflow: 'auto' }}>{String(error?.stack || error?.message || error)}</pre>
          </div>
        </div>
      </ErrorBoundary>
    );
  });
