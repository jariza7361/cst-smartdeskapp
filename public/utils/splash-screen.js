// Premium splash screen handler (single source of truth)
(() => {
  const STYLE_ID = 'cst-splash-style';
  const SPLASH_ID = 'splash';

  const css = `
    .banner[hidden] {
      display: none;
    }
    .banner.show {
      display: block !important;
    }
    #splash.banner.show {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(5, 8, 15, 0.85);
      display: grid;
      place-items: center;
    }
    #splash.overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      background: color-mix(in oklab, var(--bg, #0b1220) 88%, transparent);
      backdrop-filter: blur(3px);
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    #splash.overlay.show {
      opacity: 1;
    }
    #splash .banner-inner {
      width: min(760px, 94vw);
      border-radius: 18px;
      padding: 28px;
      background: var(--card, #0f172a);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
    }
    #splash .banner-body > h2 {
      margin: 0 0 0.4rem;
    }
    #splash .banner-body > p {
      margin: 0 0 0.75rem;
      color: var(--muted, #94a3b8);
    }
    #splash .note {
      color: #9ca3af;
      margin: 0.25rem 0 0.5rem;
    }
    .banner .banner-actions,
    .banner-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .btn-primary {
      background: #2563eb;
      border: 1px solid #1e40af;
      color: #fff;
      border-radius: 8px;
      padding: 0.5rem 0.8rem;
    }
    .btn-quiet {
      background: #fff;
      border: 1px solid #cfd8e3;
      color: #111827;
      border-radius: 8px;
      padding: 0.5rem 0.8rem;
    }
    .progress {
      height: 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      overflow: hidden;
      margin: 0.5rem 0 1rem;
    }
    .progress .bar {
      width: 100%;
      height: 100%;
      transform-origin: left center;
      transform: scaleX(0);
      background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.35);
    }
    @keyframes fill {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    .progress .bar.run {
      animation: fill 2.4s ease-in-out forwards;
    }
    .pct-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -0.5rem;
      margin-bottom: 0.25rem;
    }
    #splashPct {
      color: #a7b0bd;
      font-variant-numeric: tabular-nums;
    }
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
      splash.className = 'banner overlay';
      splash.setAttribute('aria-hidden', 'true');
      splash.setAttribute('hidden', '');
      splash.innerHTML = `
        <div class="banner-inner">
          <div class="banner-body">
            <h2 id="splashTitle">Welcome to CST SmartDesk</h2>
            <p id="splashStep" aria-live="polite">Please wait… loading</p>
            <div class="progress"><div class="bar" id="splashBar"></div></div>
            <div class="pct-row"><span id="splashPct" aria-live="polite">0%</span></div>
            <p class="note">White-glove support. Faster workflows. Gold-standard results.</p>
            <div class="banner-actions">
              <button id="splashStart" class="btn-primary">Start</button>
              <button id="splashDismiss" class="btn-quiet">Dismiss</button>
              <button id="splashRetry" class="btn-quiet">Retry</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(splash);
    }

    const splashEl = document.getElementById(SPLASH_ID);
    if (splashEl && !splashEl.dataset.wired) {
      splashEl.dataset.wired = '1';
      const start = splashEl.querySelector('#splashStart');
      const dismiss = splashEl.querySelector('#splashDismiss');
      const retry = splashEl.querySelector('#splashRetry');

      if (start) start.addEventListener('click', hide);
      if (dismiss) dismiss.addEventListener('click', hide);
      if (retry) retry.addEventListener('click', () => {
        show();
      });
    }
  }

  const MIN_VISIBLE_MS = 5000;
  let shownAt = 0;
  let hideTimer = null;

  function show() {
    ensureSplash();
    const el = document.getElementById(SPLASH_ID);
    if (!el) return;
    el.removeAttribute('hidden');
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
    const bar = document.getElementById('splashBar');
    if (bar) bar.classList.add('run');
    const pct = document.getElementById('splashPct');
    if (pct) {
      pct.textContent = '0%';
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(100, Math.round((elapsed / MIN_VISIBLE_MS) * 100));
        pct.textContent = `${progress}%`;
        if (progress < 100 && el.classList.contains('show')) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    }
    shownAt = Date.now();
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function hide() {
    const el = document.getElementById(SPLASH_ID);
    if (!el) return;
    const elapsed = Date.now() - shownAt;
    if (shownAt && elapsed < MIN_VISIBLE_MS) {
      const wait = MIN_VISIBLE_MS - elapsed;
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('hidden', '');
      }, wait);
      return;
    }
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('hidden', '');
  }

  window.cstSplash = { show, hide };

  document.addEventListener('DOMContentLoaded', () => {
    show();
  });
})();
