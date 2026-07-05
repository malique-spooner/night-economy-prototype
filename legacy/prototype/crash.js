/* ════════════════════════════════════════════════════════════════════
   CRASH / SURGE EVENT SEQUENCE
   ════════════════════════════════════════════════════════════════════ */

let activeCrashCategory = null;
let activeCrashCategoryLabel = '';
let activeCrashDrinks = [];
let buyWindowTimeout = null;

function getCrashDrinksForCategory(cat) {
  return D.filter(d => d.cat === cat && !d.soldOut);
}

function getCrashGroupIds() {
  if (typeof BOARD_VIEWS !== 'undefined' && typeof currentBoardView !== 'undefined') {
    const view = BOARD_VIEWS[currentBoardView];
    if (view && Array.isArray(view.ids)) return view.ids;
  }
  return [];
}

function getCrashDrinksForGroup() {
  const ids = new Set(getCrashGroupIds());
  return D.filter(d => ids.has(d.id) && !d.soldOut);
}

function pumpCrashCategory(drinks, deltaMin = 0.04, deltaMax = 0.09) {
  drinks.forEach(d => {
    const prev = d.p;
    const mult = 1 + deltaMin + Math.random() * (deltaMax - deltaMin);
    d.p = clampPrice(d, d.p * mult);
    d.h.push(d.p);
    if (d.h.length > 12) d.h.shift();
    updateRowDisplay(d);
    const pEl = document.getElementById(`p${d.id}`);
    if (pEl) {
      pEl.textContent = '£' + d.p.toFixed(2);
      pEl.className = 'dprice up';
    }
    if (d.p > prev) {
      const row = document.getElementById(`r${d.id}`);
      if (row) {
        row.classList.add('glow-up', 'pulse');
        setTimeout(() => row.classList.remove('glow-up', 'pulse'), 900);
      }
    }
  });
}

function crashCategoryHard(drinks) {
  drinks.forEach(d => {
    const prev = d.p;
    d.p = clampPrice(d, d.b * (0.48 + Math.random() * 0.14));
    d.h.push(d.p);
    if (d.h.length > 12) d.h.shift();
    const pEl = document.getElementById(`p${d.id}`);
    if (pEl) {
      pEl.textContent = '£' + d.p.toFixed(2);
      pEl.className = 'dprice dn';
      pEl.classList.remove('crashing');
      void pEl.offsetWidth;
      pEl.classList.add('crashing');
    }
    updateRowDisplay(d);
    insertTradeRow(d.id, false, prev, 'CRASH');
  });
}

function getCrashGroupLabel() {
  if (typeof BOARD_VIEWS !== 'undefined' && typeof currentBoardView !== 'undefined') {
    const view = BOARD_VIEWS[currentBoardView];
    if (view && view.label) {
      return view.label
        .toLowerCase()
        .split(' · ')
        .map(part => part.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
        .join(' · ');
    }
  }
  return 'Cocktails';
}

function startCrash() {
  if (crashActive) return;
  crashActive = true;
  activeCrashCategory = typeof getNextCrashCategory === 'function'
    ? getNextCrashCategory()
    : (DEFAULT_CATEGORIES[0] || 'signature');
  let attempts = 0;
  while (attempts < Math.max(1, DEFAULT_CATEGORIES.length) && !getCrashDrinksForCategory(activeCrashCategory).length) {
    activeCrashCategory = typeof getNextCrashCategory === 'function'
      ? getNextCrashCategory()
      : (DEFAULT_CATEGORIES[(attempts + 1) % Math.max(1, DEFAULT_CATEGORIES.length)] || 'signature');
    attempts += 1;
  }
  activeCrashCategoryLabel = typeof formatMarketCategory === 'function'
    ? formatMarketCategory(activeCrashCategory)
    : activeCrashCategory.replace('-', ' ');
  activeCrashDrinks = getCrashDrinksForGroup();
  const crashGroupIds = new Set(getCrashGroupIds());
  const crashPeers = D.filter(d => !crashGroupIds.has(d.id) && !d.soldOut);
  const nbTag = document.getElementById('nb-tag');
  const crashGroupLabel = getCrashGroupLabel();

  /* Stage 1 — Warning (0–8s) */
  threeMode = 'warning';
  document.getElementById('warnBanner').classList.add('show');
  document.getElementById('warnText').textContent = 'Crash';
  document.getElementById('warnSub').textContent = `· ${crashGroupLabel} crash`;
  startCrawl(`⚠ CRASH`, 'rgba(200,160,0,0.85)');
  if (nbTag) nbTag.style.color = '#c9aa52';

  // Prices pump first in the category that is about to crash
  let warnJitter = setInterval(() => {
    pumpCrashCategory(activeCrashDrinks, 0.03, 0.08);
    crashPeers.forEach(d => {
      const drift = d.p > d.b ? 0.008 : 0.003;
      d.p = clampPrice(d, d.p * (1 + drift));
      d.h.push(d.p);
      if (d.h.length > 12) d.h.shift();
      updateRowDisplay(d);
    });
    renderTicker();
  }, 600);

  setTimeout(() => {
    const warnText = document.getElementById('warnText');
    const warnSub = document.getElementById('warnSub');
    startCrawl(`⚠ CRASH`, 'rgba(255,100,100,0.9)');
    if (warnText) warnText.textContent = 'Crash';
    if (warnSub) warnSub.textContent = `· ${crashGroupLabel} crash`;
  }, 5000);

  /* Stage 2 — Shake (8–13s) */
  setTimeout(() => {
    clearInterval(warnJitter);
    const pill = document.getElementById('pill');
    pill.classList.add('crash');
    document.getElementById('stext').textContent = 'Crash';
    const wash = document.getElementById('wash');
    wash.style.transition = 'none';
    wash.style.opacity = '0';
    wash.style.background = 'rgba(255,60,60,0.15)';
    void wash.offsetWidth;
    go(wash, { opacity: '0.7' }, 1800);

    // Board shakes
    const ui = document.getElementById('ui');
    [0, 700, 1400].forEach(delay => {
      setTimeout(() => {
        ui.style.animation = 'none';
        void ui.offsetWidth;
        ui.style.animation = 'shake 0.45s ease-in-out';
        activeCrashDrinks.forEach(d => {
          const row = document.getElementById(`r${d.id}`);
          if (row) {
            row.classList.remove('crash-hit');
            void row.offsetWidth;
            row.classList.add('crash-hit');
          }
        });
      }, delay);
    });

    startCrawl(`CRASH — ${crashGroupLabel.toUpperCase()}`, 'rgba(255,82,82,0.95)');
  }, 8000);

  /* Stage 3 — Full crash (13s) */
  setTimeout(() => {
    threeMode = 'crash';
    // Only the target category crashes hard
    crashCategoryHard(activeCrashDrinks);
    crashPeers.forEach(d => {
      const prev = d.p;
      d.p = clampPrice(d, d.p * (0.98 + Math.random() * 0.03));
      d.h.push(d.p);
      if (d.h.length > 12) d.h.shift();
      updateRowDisplay(d);
      if (d.p > prev) {
        const pEl = document.getElementById(`p${d.id}`);
        if (pEl) pEl.className = 'dprice up';
      }
    });
    renderTicker();
    document.getElementById('warnBanner').classList.remove('show');
    go(document.getElementById('wash'), { opacity: '1' }, 600);
    document.getElementById('ui').classList.add('dim');

    // Event layer
    const layer = document.getElementById('evl');
    layer.style.display = '';
    layer.style.opacity = '';
    layer.style.transition = '';
    layer.classList.add('show');
    ['swt', 'swb'].forEach(id => {
      const el = document.getElementById(id);
      el.style.opacity = '0.9';
      el.style.transition = 'none';
      el.style.transform = 'scaleX(0)';
      setTimeout(() => {
        el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform = 'scaleX(1)';
      }, 100);
    });
    ['btl', 'btr', 'bbl', 'bbr'].forEach((id, i) => {
      const el = document.getElementById(id);
      go(el, { opacity: '1' }, 380, 200 + i * 70);
    });

    const evc = document.getElementById('evc');
    evc.classList.add('show');
    go(evc, { opacity: '1', transform: 'translateY(0) scale(1)' }, 620, 300);
    document.getElementById('epre').textContent = 'Market Crash';
    document.getElementById('ehl').textContent = `${crashGroupLabel} crash`;
    const esub = document.getElementById('esub');
    if (esub) {
      esub.textContent = `${crashGroupLabel.toUpperCase()} UNDER PRESSURE`;
      esub.style.display = '';
      go(esub, { opacity: '1', transform: 'translateY(0)' }, 520, 620);
    }
    go(document.getElementById('epre'), { opacity: '1', transform: 'translateY(0)' }, 480, 460);

    setTimeout(() => {
      document.getElementById('ehl').style.transition = 'all 760ms cubic-bezier(0.16,1,0.3,1)';
      document.getElementById('ehl').style.opacity = '1';
      document.getElementById('ehl').style.transform = 'translateY(0)';
    }, 580);

  }, 13000);

  setTimeout(() => {
    threeMode = 'crash';
    if (nbTag) nbTag.style.color = '#ff5252';
    clearTimeout(buyWindowTimeout);
    buyWindowTimeout = setTimeout(endCrash, 10000);
  }, 13000);
}

function endCrash() {
  clearTimeout(buyWindowTimeout);
  buyWindowTimeout = null;
  crashActive = false;
  activeCrashCategory = null;
  activeCrashCategoryLabel = '';
  activeCrashDrinks = [];
  const ui = document.getElementById('ui');
  ui.classList.remove('dim');
  ui.style.animation = 'none';

  const wash = document.getElementById('wash');
  wash.style.transition = 'opacity 1.2s';
  wash.style.opacity = '0';

  const layer = document.getElementById('evl');
  layer.classList.remove('show');
  layer.style.transition = 'opacity 0.8s';
  layer.style.opacity = '0';

  const pill = document.getElementById('pill');
  pill.classList.remove('crash');
  document.getElementById('stext').textContent = 'Market open';
  const nbTag = document.getElementById('nb-tag');
  if (nbTag) nbTag.style.color = '#c9aa52';

  threeMode = 'normal';
  resetThree();

  setTimeout(() => {
    layer.style.display = 'none';
    const evc = document.getElementById('evc');
    evc.classList.remove('show');
    ['evc', 'epre', 'ehl', 'esub'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.display = '';
      if (id === 'evc') el.style.transform = 'translateY(20px) scale(0.95)';
      if (id === 'epre') el.style.transform = 'translateY(-12px)';
      if (id === 'ehl') el.style.transform = 'translateY(26px)';
      if (id === 'esub') el.style.transform = 'translateY(12px)';
    });
    ['btl', 'btr', 'bbl', 'bbr', 'swt', 'swb'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      if (id.startsWith('sw')) el.style.transform = 'scaleX(0)';
    });

    // Reset prices back toward base
    D.forEach(d => {
      d.p = clampPrice(d, d.b * (0.9 + Math.random() * 0.1));
      d.h.push(d.p);
      if (d.h.length > 12) d.h.shift();
    });

    startCrawl('Market recovering — prices returning to normal · Buy window closed');
    buildBoard();
    renderTicker();
    if (typeof refreshAuxViews === 'function') refreshAuxViews();
  }, 1000);
}
