import './supabase-app.css';

const showStartupError = (error) => {
  const message = String(error?.stack || error?.message || error || 'Unknown browser error');
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f6f3ec;font-family:system-ui,sans-serif;color:#1f2933">
      <div style="max-width:760px;width:100%;background:#fff;border:1px solid #e2ded4;border-radius:16px;padding:28px;box-shadow:0 20px 60px #00000010">
        <h1 style="margin-top:0;color:#7f1d1d">EJ PNG system error</h1>
        <p>The application loaded, but a browser error stopped the interface.</p>
        <pre style="white-space:pre-wrap;background:#f8f5ef;padding:16px;border-radius:10px;overflow:auto">${message.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</pre>
        <button onclick="location.reload()" style="border:0;border-radius:10px;padding:12px 18px;background:#173b2c;color:#fff;font-weight:700">Reload</button>
      </div>
    </div>`;
};

window.addEventListener('error', (event) => showStartupError(event.error || event.message));
window.addEventListener('unhandledrejection', (event) => showStartupError(event.reason));

import('./supabase-app.jsx').catch(showStartupError);
