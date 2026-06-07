/* ════════════════════════════════════════════════════════════════════
   HOME VIEW — base home panel functions
   ════════════════════════════════════════════════════════════════════ */

function applyDecay() {
  D.forEach(d => {
    d.p = clampPrice(d, d.p * 0.995);
    d.h.push(d.p);
    if (d.h.length > 12) d.h.shift();
    pushDrinkTimelinePoint(d, 'tick');
    updateRowDisplay(d);
  });
  renderTicker();
}

/* ════════════════════════════════════════════════════════════════════
   BOARD RENDERING
   ════════════════════════════════════════════════════════════════════ */

let currentBoardView = 0;

function buildBoard(viewIdx) {
  if (viewIdx !== undefined) currentBoardView = viewIdx;
  const view = BOARD_VIEWS[currentBoardView];
  const inner = document.getElementById('boardInner');
  const featured = document.getElementById('boardFeatured');
  if (!inner) return;

  const labelEl = document.getElementById('boardViewLabel');
  if (labelEl) labelEl.textContent = view.label;

  // Update board dots
  document.querySelectorAll('.bdot').forEach((dot, idx) => {
    if (idx === currentBoardView) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  inner.style.transition = 'opacity 0.35s';
  inner.style.opacity = '0';
  if (featured) featured.style.opacity = '0';

  setTimeout(() => {
    inner.innerHTML = '';
    const drinks = D.filter(d => view.ids.includes(d.id));
    const featuredDrinks = [...drinks]
      .filter(d => !d.soldOut)
      .sort((a, b) => b.o - a.o || Math.abs((b.p - b.b) / b.b) - Math.abs((a.p - a.b) / a.b))
      .slice(0, 3);
    const cats = [...new Set(drinks.map(d => d.cat))];

    if (featured) {
      featured.innerHTML = featuredDrinks.map((d, idx) => {
        const pct = ((d.p - d.b) / d.b * 100);
        const up = d.p >= d.b;
        return `
          <article class="feature-tile ${d.soldOut ? 'sold-out' : ''}">
            <div class="feature-tile-top">
              <span class="feature-rank">0${idx + 1}</span>
              <span class="feature-cat">${d.cat.replace('-', ' ')}</span>
            </div>
            <strong class="feature-name">${d.n}</strong>
            <div class="feature-bottom">
              <div class="feature-price ${up ? 'up' : 'dn'}">£${d.p.toFixed(2)}</div>
              <div class="feature-change ${up ? 'up' : 'dn'}">${up ? '+' : ''}${pct.toFixed(1)}%</div>
            </div>
            ${buildPricePositionMarkup(d)}
          </article>
        `;
      }).join('');
      featured.style.opacity = '1';
    }

    cats.forEach(cat => {
      const items = drinks.filter(d => d.cat === cat);
      if (!items.length) return;

      const sec = document.createElement('div');
      sec.className = 'cat-section';

      const gainers = items.filter(d => d.p > d.b).length;
      const catChg = (items.reduce((s, d) => s + ((d.p - d.b) / d.b * 100), 0) / items.length).toFixed(1);
      const hdr = document.createElement('div');
      hdr.className = 'cat-header';
      hdr.innerHTML = `<span class="cat-name ${cat}">◆ ${cat.replace('-', ' ')}</span><span class="cat-meta">${catChg > 0 ? '+' : ''}${catChg}%</span>`;
      sec.appendChild(hdr);

      items.forEach(d => {
        const row = document.createElement('div');
        row.className = `drow ${d.o > 0 ? 'fresh' : 'decaying'} ${d.soldOut ? 'sold-out' : ''}`;
        row.id = `r${d.id}`;
        const pct = ((d.p - d.b) / d.b * 100).toFixed(1);
        const up = d.p >= d.b;
        const soldBadge = d.soldOut ? '<span class="val-badge">SOLD OUT</span>' : '';
        row.innerHTML = `
          <div><div class="dname">${d.n}${soldBadge}</div><div class="dcat-sub">${d.cat.replace('-',' ')}</div></div>
          <div class="dprice ${up?'up':'dn'}" id="p${d.id}">£${d.p.toFixed(2)}</div>
          <div class="spark-cell" id="sp${d.id}">${buildPricePositionMarkup(d)}</div>
          <div class="dpct ${up?'up':'dn'}" id="pct${d.id}">${up?'+':''}${pct}%</div>
          <div class="decay-wrap"><div class="decay-bar"><div class="decay-fill" style="width:${Math.min(100, d.o * 8.33)}%"></div></div><div class="darr ${up?'up':'dn'}" id="arr${d.id}">${up?'▲':'▼'}</div></div>
        `;
        sec.appendChild(row);
      });
      inner.appendChild(sec);
    });

    hydrateLineCharts(inner);
    inner.style.opacity = '1';
  }, 350);
}

function rotateBoardView() {
  buildBoard((currentBoardView + 1) % BOARD_VIEWS.length);
}

function insertTradeRow(dId, isUp, prev, type) {
  const drink = D.find(d => d.id === dId);
  if (!drink) return;

  const parent = document.getElementById(`r${dId}`);
  if (!parent) return;

  const row = document.createElement('div');
  row.className = `trow ${isUp ? 'up' : 'dn'} entering`;

  const chg = drink.p - prev;
  const pct = (chg / prev * 100).toFixed(2);
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  row.innerHTML = `
    <div class="tr-label"><span class="tr-tag ${type.toLowerCase()}">${type}</span><span class="tr-name">${drink.n}</span></div>
    <div class="tr-price ${isUp ? 'up' : 'dn'}">£${drink.p.toFixed(2)}</div>
    <div class="tr-move ${isUp ? 'up' : 'dn'}">+${chg.toFixed(2)}</div>
    <div class="tr-move ${isUp ? 'up' : 'dn'}">${pct > 0 ? '+' : ''}${pct}%</div>
    <div class="tr-time">${time}</div>
  `;

  parent.parentNode.insertBefore(row, parent.nextSibling);

  setTimeout(() => row.classList.add('exiting'), 5000);
  setTimeout(() => row.remove(), 5500);
}

/* ════════════════════════════════════════════════════════════════════
   PANEL UPDATES
   ════════════════════════════════════════════════════════════════════ */

function getVisibleBoardDrinks() {
  const view = BOARD_VIEWS[currentBoardView] || BOARD_VIEWS[0];
  return D.filter(d => view.ids.includes(d.id) && !d.soldOut);
}

function getTopMover(drinks = getVisibleBoardDrinks()) {
  return [...drinks].sort((a, b) => Math.abs((b.p - b.b) / b.b) - Math.abs((a.p - a.b) / a.b))[0] || null;
}

function getBestValue(drinks = getVisibleBoardDrinks()) {
  return [...drinks].sort((a, b) => a.p - b.p)[0] || null;
}

function updateMarketPanel() {
  const drinks = getVisibleBoardDrinks();
  if (!drinks.length) return;

  const mover = getTopMover(drinks) || drinks[0];
  const best = getBestValue(drinks) || drinks[0];
  const upCount = drinks.filter(d => d.p > d.b).length;
  const downCount = drinks.filter(d => d.p < d.b).length;
  const mood = upCount >= downCount ? 'Room heating up' : 'Value opening';
  const moverChange = ((mover.p - mover.b) / mover.b * 100);
  const bestChange = ((best.p - best.b) / best.b * 100);
  const now = new Date();

  const kickerEl = document.getElementById('storyA-kicker');
  const headlineEl = document.getElementById('storyA-headline');
  const copyEl = document.getElementById('storyA-copy');
  const boardEl = document.getElementById('storyA-board');
  const moodEl = document.getElementById('storyA-mood');
  const valueEl = document.getElementById('storyA-value');

  if (kickerEl) kickerEl.textContent = 'Room signal';
  if (headlineEl) {
    headlineEl.textContent = mover.p >= mover.b
      ? `${mover.n} is setting the pace.`
      : `${mover.n} is cooling the room.`;
  }
  if (copyEl) {
    copyEl.textContent = `${mover.n} is ${moverChange >= 0 ? '+' : ''}${moverChange.toFixed(1)}% against base, while ${best.n} is the cleanest value on the board at ${formatMoney(best.p)}.`;
  }
  if (boardEl) boardEl.textContent = mover.n;
  if (moodEl) moodEl.textContent = mover.p >= mover.b ? mood : 'Cooling off';
  if (valueEl) valueEl.textContent = `${formatMoney(best.p)}${bestChange > 0 ? ' ▲' : bestChange < 0 ? ' ▼' : ''}`;

  const timeEl = document.getElementById('lupdt');
  if (timeEl) timeEl.textContent = `Updated ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

/* ════════════════════════════════════════════════════════════════════
   CATEGORY ANALYTICS HELPERS
   ════════════════════════════════════════════════════════════════════ */

function getCategoryInsight(cat) {
  const items = D.filter(d => d.cat === cat);
  if (items.length === 0) return 'No data';
  const up = items.filter(d => d.p > d.b).length;
  const total = items.length;
  const pct = Math.round((up / total) * 100);

  if (up > total * 0.65) return `${cat} surging · ${pct}% gainers`;
  if (up < total * 0.35) return `${cat} declining · ${pct}% gainers`;
  return `${cat} mixed · ${pct}% gainers`;
}

function getCategoryRank(drink) {
  const cat = drink.cat;
  const items = D.filter(d => d.cat === cat).sort((a, b) => {
    const aChange = ((a.p - a.b) / a.b * 100);
    const bChange = ((b.p - b.b) / b.b * 100);
    return bChange - aChange; // Descending order (best performers first)
  });

  const currentDrink = items.find(d => d.id === drink.id);
  const rank = items.indexOf(currentDrink) + 1;

  return {
    rank: rank,
    total: items.length,
    peers: items.map((d, idx) => ({
      name: d.n,
      change: ((d.p - d.b) / d.b * 100),
      isCurrentDrink: d.id === drink.id,
      isBetterThanCurrent: idx < items.indexOf(currentDrink),
      isWorseThanCurrent: idx > items.indexOf(currentDrink)
    }))
  };
}

function updateMiniSpotlight() {
  const nameEl = document.getElementById('spotA-name');
  if (!nameEl) return;

  const active = [...D].filter(d => d.o > 0).sort((a, b) => b.o - a.o || Math.abs((b.p - b.b) / b.b) - Math.abs((a.p - a.b) / a.b));
  const drink = active[0] || getTopMover(getVisibleBoardDrinks()) || D[Math.floor(Math.random() * D.length)];
  const timeline = (drink.timeline && drink.timeline.length ? drink.timeline : buildSyntheticTimeline(drink)).slice(-43);
  const chg = ((drink.p - drink.b) / drink.b * 100);
  const isUp = chg >= 0;

  nameEl.textContent = drink.n;
  const subEl = document.getElementById('spotA-sub');
  if (subEl) subEl.textContent = `${drink.cat.replace('-', ' ')} · ${drink.o > 0 ? 'live orders' : 'session snapshot'}`;

  const priceEl = document.getElementById('spotA-price');
  if (priceEl) priceEl.textContent = formatMoney(drink.p);

  const chgEl = document.getElementById('spotA-change');
  if (chgEl) {
    chgEl.textContent = `${chg >= 0 ? '+' : ''}${chg.toFixed(1)}%`;
    chgEl.className = isUp ? 'up' : 'dn';
  }

  const low = Math.min(...timeline.map(point => point.p));
  const high = Math.max(...timeline.map(point => point.p));
  const lowEl = document.getElementById('spotA-low');
  const highEl = document.getElementById('spotA-high');
  if (lowEl) lowEl.textContent = formatMoney(low);
  if (highEl) highEl.textContent = formatMoney(high);

  const boardEl = document.getElementById('spotA-board');
  if (boardEl) boardEl.textContent = drink.cat.replace('-', ' ');
  const moodEl = document.getElementById('spotA-mood');
  if (moodEl) moodEl.textContent = drink.p >= drink.b ? 'Live pick' : 'Good value';

  const chartEl = document.getElementById('spotA-chart');
  if (chartEl) {
    chartEl.innerHTML = svgSpark(timeline.map(point => point.p), isUp, 260, 170);
    hydrateLineCharts(chartEl);
  }
}
