// Premium splash screen handler (single source of truth)
(() => {
  const STYLE_ID = 'cst-splash-style';
  const SPLASH_ID = 'premium-splash';

  const css = `
    .splash-overlay{
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.75);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      z-index: 9999;
    }
    .splash-card{
      width: min(520px, 92vw);
      padding: 22px 24px;
      border-radius: 16px;
      background: rgba(255,255,255,0.10);
      border: 1px solid rgba(255,255,255,0.20);
      color: #fff;
      text-align: center;
    }
    .splash-logo{ font-size: 22px; font-weight: 800; letter-spacing: 0.4px; }
    .splash-sub{ margin-top: 6px; opacity: 0.85; }
    .splash-spinner{
      width: 34px;
      height: 34px;
      margin: 16px auto 0;
      border-radius: 999px;
      border: 3px solid rgba(255,255,255,0.25);
      border-top-color: rgba(255,255,255,0.95);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  function ensureSplash() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }

    if (!document.getElementById(SPLASH_ID)) {
      const splash = document.createElement('div');
      splash.id = SPLASH_ID;
      splash.className = 'splash-overlay';
      splash.setAttribute('aria-hidden', 'true');
      splash.innerHTML = `
        <div class="splash-card">
          <div class="splash-logo">CST SmartDesk</div>
          <div class="splash-sub">Loading premium workspace...</div>
          <div class="splash-spinner"></div>
        </div>
      `;
      document.body.appendChild(splash);
    }
  }

  function show() {
    ensureSplash();
    const el = document.getElementById(SPLASH_ID);
    if (!el) return;
    el.style.display = 'flex';
    el.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    const el = document.getElementById(SPLASH_ID);
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
  }

  window.cstSplash = { show, hide };

  document.addEventListener('DOMContentLoaded', () => {
    show();
  });
})();
