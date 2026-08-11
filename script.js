(() => {
  'use strict';

  const money = (n) => '$' + Number(n).toLocaleString('en-US');
  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  /* — keep the pinned hero flush below the nav, even if the nav wraps — */
  const navEl = document.querySelector('.nav');
  const syncNavHeight = () => {
    if (navEl) document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
  };
  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);

  const BASE_PRICE = 5000;
  const INCREMENT = 5000;

  const MODULES = [
    { key: 'identity', name: 'Visual Identity System', desc: 'Mark, type, color, grid, photography direction, guidelines.' },
    { key: 'web', name: 'Website Design & Build', desc: 'Design, front-end build, responsive QA, performance budget.' },
    { key: 'cms', name: 'CMS & Content Model', desc: 'Editable content model, roles, publishing workflow, training.' },
    { key: 'motion', name: 'Motion & Brand Film', desc: 'Motion system, animated logo, one 60-second brand film.' }
  ];

  const PRESETS = [
    { id: 'foundation', tier: 'Base', label: 'Foundation', keys: [], desc: 'Brand strategy only. Positioning, messaging, naming review.' },
    { id: 'signature', tier: 'Most chosen', label: 'Signature', keys: ['identity', 'web'], desc: 'Strategy, identity system and a designed, built website.' },
    { id: 'flagship', tier: 'Full stack', label: 'Flagship', keys: MODULES.map((m) => m.key), desc: 'Everything: identity, build, CMS and motion.' }
  ];

  const TICKER = [
    'Enquiry received · Verso Coffee Roasters',
    'Studio notified · email + Slack',
    'Contact record written to CMS',
    'Proposal template generated from scope'
  ];

  /* — pricing configurator — */
  const on = { identity: true, web: true };
  let displayTotal = 15000;
  let countTimer = null;

  const moduleListEl = document.getElementById('module-list');
  const presetListEl = document.getElementById('preset-list');
  const summaryListEl = document.getElementById('summary-list');
  const totalEl = document.getElementById('summary-total');
  const blocksEl = document.getElementById('summary-blocks');
  const timelineEl = document.getElementById('summary-timeline');
  const scopeInput = document.getElementById('rm-scope');

  const activeCount = () => MODULES.filter((m) => on[m.key]).length;
  const total = () => BASE_PRICE + activeCount() * INCREMENT;

  function animateTotal(target) {
    clearInterval(countTimer);
    const from = displayTotal;
    if (from === target) { totalEl.textContent = money(target); return; }
    const stepSize = (target - from) / 12;
    let i = 0;
    countTimer = setInterval(() => {
      i += 1;
      const v = i >= 12 ? target : Math.round((from + stepSize * i) / 100) * 100;
      displayTotal = v;
      totalEl.textContent = money(v);
      if (i >= 12) clearInterval(countTimer);
    }, 28);
  }

  function scopeLabel() {
    const picked = MODULES.filter((m) => on[m.key]).map((m) => m.name);
    return ['Brand Strategy Core'].concat(picked).join(' + ');
  }

  function render() {
    // presets
    presetListEl.querySelectorAll('.preset-btn').forEach((btn) => {
      const preset = PRESETS.find((p) => p.id === btn.dataset.presetId);
      const selected = preset.keys.length === activeCount() && preset.keys.every((k) => on[k]);
      btn.classList.toggle('is-selected', selected);
    });

    // module rows
    moduleListEl.querySelectorAll('.config-row.module').forEach((row) => {
      const key = row.dataset.moduleKey;
      const isOn = !!on[key];
      row.classList.toggle('is-on', isOn);
      row.setAttribute('aria-checked', String(isOn));
      const priceEl = row.querySelector('.row-price');
      priceEl.textContent = (isOn ? '+ ' : '') + money(INCREMENT);
    });

    // summary list
    const chosen = [{ name: 'Brand Strategy Core', priceLabel: money(BASE_PRICE) }].concat(
      MODULES.filter((m) => on[m.key]).map((m) => ({ name: m.name, priceLabel: money(INCREMENT) }))
    );
    summaryListEl.innerHTML = chosen
      .map((c) => `<div class="row"><span>${c.name}</span><span>${c.priceLabel}</span></div>`)
      .join('');

    const count = activeCount();
    blocksEl.textContent = count === 0
      ? 'Strategy only · no add-on blocks'
      : `${count} ${count === 1 ? 'add-on block' : 'add-on blocks'} at ${money(INCREMENT)} each`;

    const weeks = Math.round(4 + count * 1.5);
    timelineEl.textContent = `Estimated ${weeks} weeks · Payment in two instalments · Retainer billed quarterly.`;

    animateTotal(total());
  }

  function toggleModule(key) {
    if (on[key]) delete on[key];
    else on[key] = true;
    render();
  }

  function applyPreset(preset) {
    Object.keys(on).forEach((k) => delete on[k]);
    preset.keys.forEach((k) => { on[k] = true; });
    render();
  }

  MODULES.forEach((m) => {
    const row = document.createElement('div');
    row.className = 'config-row module';
    row.dataset.moduleKey = m.key;
    row.setAttribute('role', 'checkbox');
    row.setAttribute('tabindex', '0');
    row.innerHTML = `
      <span class="swatch"></span>
      <div class="row-body">
        <p class="row-title">${m.name}</p>
        <p class="row-desc">${m.desc}</p>
      </div>
      <span class="row-price"></span>
    `;
    row.addEventListener('click', () => toggleModule(m.key));
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleModule(m.key); }
    });
    moduleListEl.appendChild(row);
  });

  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.dataset.presetId = p.id;
    btn.innerHTML = `
      <span class="tier">${p.tier}</span>
      <span class="label">${p.label}</span>
      <span class="price">${money(BASE_PRICE + p.keys.length * INCREMENT)}</span>
      <span class="desc">${p.desc}</span>
    `;
    btn.addEventListener('click', () => applyPreset(p));
    presetListEl.appendChild(btn);
  });

  render();

  const requestScopeBtn = document.getElementById('request-scope');
  if (requestScopeBtn) {
    requestScopeBtn.addEventListener('click', () => {
      if (scopeInput) scopeInput.value = scopeLabel();
    });
  }

  /* — studio activity ticker — */
  const tickerEl = document.getElementById('ticker');
  let tickerIndex = 0;
  function renderTicker() {
    const lines = TICKER.map((t, i) => {
      const d = (i - tickerIndex + TICKER.length) % TICKER.length;
      const opacity = d === 0 ? 1 : d === 1 ? 0.55 : d === 2 ? 0.28 : 0;
      return { text: t, opacity };
    }).filter((l) => l.opacity !== 0);
    tickerEl.innerHTML = lines
      .map((l) => `<div class="activity-line" style="opacity:${l.opacity}"><time>${now()}</time><span>${l.text}</span></div>`)
      .join('');
  }
  renderTicker();
  setInterval(() => {
    tickerIndex = (tickerIndex + 1) % TICKER.length;
    renderTicker();
  }, 2600);

  /* — scroll reveal — */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* — scroll-scrubbed hero — */
  const stage = document.querySelector('.scrub-hero');
  const pin = document.querySelector('.scrub-pin');
  const figure = document.querySelector('[data-hero-figure]');
  const scrim = document.querySelector('.scrub-scrim');
  const scrubBlocks = Array.from(document.querySelectorAll('.scrub-block'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // How much scroll (in viewport-heights) each headline gets before the next
  // one starts crossfading in. Bigger = more time to read each line.
  const SEGMENT_LEN = 1.7;
  // A block sits fully visible, alone, for HOLD_HALF segments on either side
  // of its own center, then crossfades over TRANS segments into the next.
  // 2*HOLD_HALF + TRANS = 1 makes one block's fade-out exactly meet the
  // next block's fade-in — no dead gap, no distant blocks bleeding through.
  const HOLD_HALF = 0.4;
  const TRANS = 0.2;

  if (stage && pin && !reduceMotion) {
    stage.style.height = (scrubBlocks.length * SEGMENT_LEN * 100) + 'vh';

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      const r = pin.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { tx = 0; ty = 0; };
    pin.addEventListener('pointermove', onMove);
    pin.addEventListener('pointerleave', onLeave);

    const loop = () => {
      mx += (tx - mx) * 0.07;
      my += (ty - my) * 0.07;

      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const segmentPx = SEGMENT_LEN * vh;
      const scrolled = Math.max(0, -rect.top);
      const progress = scrolled / segmentPx; // continuous, in segment units
      const depth = Math.max(0, Math.min(1, progress / (scrubBlocks.length || 1)));

      // slow, continuous zoom-out + upward pan tied to scroll — a "slight
      // scroll effect" on the photo, independent of the pointer parallax
      const scrollScale = 1.1 - depth * 0.08;
      const scrollPanY = depth * -34;
      if (figure) {
        figure.style.transform =
          `translate3d(${mx * 10}px,${my * 5 + scrollPanY}px,0) scale(${scrollScale})`;
      }

      scrubBlocks.forEach((block, i) => {
        const local = progress - i;
        const absLocal = Math.abs(local);
        if (absLocal <= HOLD_HALF) {
          block.style.opacity = '1';
          block.style.transform = 'translate3d(0,0,0) scale(1)';
          block.style.visibility = 'visible';
        } else if (absLocal < HOLD_HALF + TRANS) {
          const t = (absLocal - HOLD_HALF) / TRANS; // 0 at hold edge, 1 at gone
          const opacity = 1 - t;
          const translateY = Math.sign(local) * t * 44;
          const scale = 1 - t * 0.04;
          block.style.opacity = String(opacity);
          block.style.transform = `translate3d(0,${translateY}px,0) scale(${scale})`;
          block.style.visibility = 'visible';
        } else {
          block.style.opacity = '0';
          block.style.visibility = 'hidden';
        }
      });

      if (scrim) {
        scrim.style.opacity = String(0.32 + depth * 0.24);
      }

      requestAnimationFrame(loop);
    };
    loop();
  }

  /* — contact form — */
  const form = document.getElementById('contact-form');
  const formNoteEl = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rm-name').value.trim();
      const email = document.getElementById('rm-email').value.trim();
      const message = document.getElementById('rm-msg').value.trim();
      if (!name || !email || !message) {
        formNoteEl.textContent = 'Name, email and message are required.';
        return;
      }
      formNoteEl.textContent = "Received. We'll reply within one business day.";
      form.reset();
      if (scopeInput) scopeInput.value = 'Brand strategy + Web';
    });
  }
})();
