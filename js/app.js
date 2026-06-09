// ================================================================
//  SportyBet Clone — App Logic
// ================================================================

const state = {
  slip: [],
  bets: [],
  sport: 'football',
  section: 'sports',
  filter: 'all',
  balance: 5000.00,
  jpSecs: 9900,
  casinoCat: 'all',
};

const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMatches();
  renderLive();
  renderCasino();
  renderVirtual();
  renderVirtualEntrance();
  renderQuickGames();
  renderPromos();
  bindAll();
  tickClock();
  tickJackpot();
  flickerOdds();
  updateBalance();
});

// ── RENDER MATCHES ────────────────────────────────────────────
function renderMatches(filter = 'all') {
  const wrap = $('matchesWrap');
  const data = MATCHES_DATA[state.sport];
  if (!data) { wrap.innerHTML = '<div style="padding:30px;text-align:center;color:#555">No matches for this sport.</div>'; return; }

  let html = '';
  data.forEach(league => {
    let ms = league.matches;
    if (filter === 'today')    ms = ms.filter(m => m.time.includes('Today') || m.isLive);
    if (filter === 'tomorrow') ms = ms.filter(m => m.time.includes('Tomorrow'));
    if (filter === 'live')     ms = ms.filter(m => m.isLive);
    if (!ms.length) return;

    html += `<div class="lg-group">
      <div class="lg-head" onclick="toggleLeague(this)">
        <span class="lg-flag">${league.flag}</span>
        <span class="lg-name">${league.league}</span>
        <span class="lg-count">${ms.length}</span>
        <span class="lg-arrow">▼</span>
      </div>
      <div class="match-list">${ms.map(matchRow).join('')}</div>
    </div>`;
  });

  wrap.innerHTML = html || '<div style="padding:30px;text-align:center;color:#555">No matches for this filter.</div>';
}

function matchRow(m) {
  const timeHtml = m.isLive
    ? `<div class="mr-time is-live"><span class="live-pip"></span> ${m.minute}</div>`
    : `<div class="mr-time">${m.time}</div>`;

  const hScore = m.isLive ? `<span class="score-badge">${m.liveScore.split('-')[0]}</span>` : '';
  const aScore = m.isLive ? `<span class="score-badge">${m.liveScore.split('-')[1]}</span>` : '';

  const oddsHtml = Object.entries(m.odds).map(([lbl, val]) => {
    if (!val) return '';
    const sid = `${m.id}-${lbl}`;
    const active = state.slip.some(b => b.id === sid) ? 'active' : '';
    const sel = lbl === '1' ? `${m.home} Win` : lbl === '2' ? `${m.away} Win` : 'Draw';
    return `<button class="odd-btn ${active}" id="odd-${sid}"
      data-id="${sid}" data-match="${m.home} vs ${m.away}"
      data-market="1X2" data-selection="${sel}" data-odd="${val}"
      onclick="toggleOdd(this)">
      <span class="ob-label">${lbl}</span>
      <span class="ob-val">${val.toFixed(2)}</span>
    </button>`;
  }).join('');

  return `<div class="match-row">
    <div>
      ${timeHtml}
      <div class="mr-teams">
        <span class="mr-team">${m.home}${hScore}</span>
        <span class="mr-team">${m.away}${aScore}</span>
      </div>
    </div>
    <div class="mr-odds">${oddsHtml}</div>
    <span class="more-link">+${m.moreCount}</span>
  </div>`;
}

// ── RENDER LIVE ───────────────────────────────────────────────
function renderLive() {
  const wrap = $('liveWrap');
  const rows = LIVE_MATCHES.map(m => {
    const oddsHtml = Object.entries(m.odds).map(([lbl, val]) => {
      if (!val) return '';
      const sid = `${m.id}-${lbl}`;
      const sel = lbl === '1' ? `${m.home} Win` : lbl === '2' ? `${m.away} Win` : 'Draw';
      return `<button class="odd-btn" id="odd-${sid}"
        data-id="${sid}" data-match="${m.home} vs ${m.away}"
        data-market="1X2 Live" data-selection="${sel}" data-odd="${val}"
        onclick="toggleOdd(this)">
        <span class="ob-label">${lbl}</span>
        <span class="ob-val">${val.toFixed(2)}</span>
      </button>`;
    }).join('');

    return `<div class="lg-group">
      <div class="lg-head">
        <span class="lg-flag">${m.sport}</span>
        <span class="lg-name">${m.league}</span>
        <span class="lg-count is-live" style="color:var(--live-red)">🔴 ${m.minute}</span>
      </div>
      <div class="match-list">
        <div class="match-row">
          <div>
            <div class="mr-teams">
              <span class="mr-team">${m.home} <span class="score-badge">${m.score.split('-')[0]}</span></span>
              <span class="mr-team">${m.away} <span class="score-badge">${m.score.split('-')[1]}</span></span>
            </div>
          </div>
          <div class="mr-odds">${oddsHtml}</div>
          <span class="more-link">+markets</span>
        </div>
      </div>
    </div>`;
  }).join('');

  wrap.innerHTML = `<div style="padding:6px">${rows}</div>`;
}

// ── CASINO / VIRTUAL / PROMOS ─────────────────────────────────
function renderCasino() {
  const cats = [
    { id:'all',     label:'All' },
    { id:'crash',   label:'🚀 Crash' },
    { id:'sporty',  label:'⚽ Sporty' },
    { id:'table',   label:'🎲 Table' },
    { id:'numbers', label:'🔢 Numbers' },
    { id:'live',    label:'🔴 Live' },
  ];
  const ac = state.casinoCat;
  $('casinoCats').innerHTML = cats.map(c =>
    `<button class="cat-btn${ac===c.id?' active':''}" onclick="switchCasinoCat('${c.id}')">${c.label}</button>`
  ).join('');

  const games = ac === 'all' ? CASINO_GAMES : CASINO_GAMES.filter(g => g.cat === ac);
  $('casinoGrid').innerHTML = games.map(g => `
    <div class="casino-card" onclick="toast('${g.name} — coming soon!','info')">
      <div class="cc-thumb">
        <img src="${g.img}" alt="${g.name}" class="cc-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <span class="cc-fallback" style="display:none">🎮</span>
      </div>
      ${g.hot ? '<span class="cc-hot">HOT</span>' : ''}
      <div class="cc-name">${g.name}</div>
      <div class="cc-provider">${g.provider}</div>
    </div>`).join('');
}

function switchCasinoCat(cat) {
  state.casinoCat = cat;
  renderCasino();
}

function renderVirtual() {
  $('virtualGrid').innerHTML = VIRTUAL_SPORTS.map(v => `
    <div class="virt-card" onclick="toast('Opening ${v.name}…','info')">
      <div class="vc-thumb">
        <img src="${v.img}" alt="${v.name}" class="vc-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <span class="vc-fallback" style="display:none">⚽</span>
      </div>
      <div class="vc-name">${v.name}</div>
      <div class="vc-desc">${v.desc}</div>
      <span class="vc-live">${v.badge}</span>
    </div>`).join('');
}

function renderVirtualEntrance() {
  const el = $('virtualEntrance');
  if (!el) return;
  el.innerHTML = `<div class="ve-grid">${VIRTUAL_ENTRANCE.map(v => {
    const badge = v.label ? `<span class="ve-badge ${v.label}">${v.label}</span>` : '';
    const imgTag = v.img
      ? `<img src="${v.img}" alt="${v.name}" class="ve-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
      : '';
    const iconTag = `<div class="ve-icon"${v.img ? ' style="display:none"' : ''}>${v.icon}</div>`;
    return `<div class="ve-card${v.size==='Large'?' large':''}" onclick="toast('Opening ${v.name}…','info')">
      <div class="ve-img-wrap">${imgTag}${iconTag}</div>
      ${badge}
      <div class="ve-name-overlay">${v.name}</div>
    </div>`;
  }).join('')}</div>`;
}

function renderQuickGames() {
  const el = $('quickGamesRow');
  if (!el) return;
  const ids = ['c001','c002','c003','c009','c027'];
  const games = CASINO_GAMES.filter(g => ids.includes(g.id));
  el.innerHTML = games.map(g => `
    <div class="qg-card" onclick="switchSection('casino')">
      <img src="${g.img}" alt="${g.name}" class="qg-img" loading="lazy" onerror="this.style.opacity='.3'" />
      ${g.hot ? '<span class="qg-hot-badge">HOT</span>' : ''}
      <span class="qg-name">${g.name}</span>
    </div>`).join('');
}

function renderPromos() {
  $('promosGrid').innerHTML = PROMOTIONS.map(p => `
    <div class="promo-card">
      <div class="pc-banner">${p.icon}</div>
      <div class="pc-body">
        <div class="pc-title">${p.title}</div>
        <div class="pc-desc">${p.desc}</div>
        <button class="pc-btn">${p.cta}</button>
      </div>
    </div>`).join('');
}

// ── ODD TOGGLE ────────────────────────────────────────────────
function toggleOdd(btn) {
  const id = btn.dataset.id;
  const idx = state.slip.findIndex(b => b.id === id);

  if (idx !== -1) {
    state.slip.splice(idx, 1);
    btn.classList.remove('active');
    toast('Selection removed', 'info');
  } else {
    const matchName = btn.dataset.match;
    state.slip = state.slip.filter(b => b.match !== matchName);
    $$(`[data-match="${matchName}"]`).forEach(b => b.classList.remove('active'));

    state.slip.push({
      id, match: matchName,
      market: btn.dataset.market,
      selection: btn.dataset.selection,
      odd: parseFloat(btn.dataset.odd)
    });
    btn.classList.add('active');
    toast(`${btn.dataset.selection} @ ${btn.dataset.odd} added`, 'ok');
  }
  renderSlip();
}

// ── RENDER BET SLIP ───────────────────────────────────────────
function renderSlip() {
  const body = $('bsBody');
  const footer = $('bsFooter');
  const count = state.slip.length;
  $('bsCount').textContent = count;

  if (!count) {
    body.innerHTML = `<div class="bs-empty" id="bsEmpty">
      <div class="bse-icon">🎯</div>
      <p>Your betslip is empty</p>
      <small>Click on odds to add selections</small>
    </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  body.innerHTML = state.slip.map(b => `
    <div class="sel-card">
      <div class="sel-match">${b.match}</div>
      <div class="sel-pick">${b.selection}</div>
      <div class="sel-mkt">${b.market}</div>
      <span class="sel-odd">${b.odd.toFixed(2)}</span>
      <button class="sel-rm" onclick="removeFromSlip('${b.id}')">✕</button>
    </div>`).join('');

  recalc();
}

function removeFromSlip(id) {
  state.slip = state.slip.filter(b => b.id !== id);
  const btn = document.querySelector(`[data-id="${id}"]`);
  if (btn) btn.classList.remove('active');
  renderSlip();
}

function getAccaBoost(n) {
  const table = [0, 0, 5, 15, 30, 50, 75, 100, 150, 200];
  return n < table.length ? table[n] : Math.min(1000, 200 + (n - 9) * 100);
}

function recalc() {
  const stake = parseFloat($('stakeInput')?.value || 0);
  const count = state.slip.length;
  const baseOdds = state.slip.reduce((a, b) => a * b.odd, 1);
  const boostPct = getAccaBoost(count);
  const boostedOdds = boostPct > 0 ? baseOdds * (1 + boostPct / 100) : baseOdds;
  const win = stake > 0 ? stake * boostedOdds : 0;
  const el = $('totalOdds');
  const we = $('potWin');
  if (el) el.textContent = boostedOdds.toFixed(2);
  if (we) we.textContent = `GH₵ ${win.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  const bar = $('accaBoostBar');
  if (bar) {
    if (boostPct > 0) {
      bar.style.display = 'flex';
      bar.innerHTML = `<span class="ab-icon">⚡</span><span class="ab-label">ACCA Boost</span><span class="ab-pct">+${boostPct}%</span><div class="ab-detail">Base: ${baseOdds.toFixed(2)} → Boosted: <span>${boostedOdds.toFixed(2)}</span></div>`;
    } else {
      bar.style.display = 'none';
    }
  }
}

// ── PLACE BET ─────────────────────────────────────────────────
function placeBet() {
  const stake = parseFloat($('stakeInput').value);
  if (!stake || stake < 1) { toast('Minimum stake is GH₵1', 'err'); return; }
  if (stake > state.balance) { toast('Insufficient balance!', 'err'); return; }
  if (!state.slip.length) { toast('Add selections first', 'err'); return; }

  const baseOdds = state.slip.reduce((a, b) => a * b.odd, 1);
  const boostPct = getAccaBoost(state.slip.length);
  const odds = boostPct > 0 ? baseOdds * (1 + boostPct / 100) : baseOdds;
  const win = (stake * odds).toFixed(2);
  const id = 'SB-' + Date.now().toString(36).toUpperCase();

  state.bets.unshift({ id, stake, odds: odds.toFixed(2), win, status: 'pending', selections: [...state.slip] });
  state.balance -= stake;
  updateBalance();

  state.slip.forEach(b => {
    const btn = document.querySelector(`[data-id="${b.id}"]`);
    if (btn) btn.classList.remove('active');
  });
  state.slip = [];
  $('stakeInput').value = '';
  renderSlip();
  renderOpenBets();

  $('betOkId').textContent = id;
  $('betOkMsg').textContent = `Stake: GH₵${stake} · Odds: ${odds.toFixed(2)} · Potential win: GH₵${parseFloat(win).toLocaleString()}`;
  openModal('modalBetOk');
}

// ── OPEN BETS ─────────────────────────────────────────────────
function renderOpenBets() {
  const list = $('obList');
  $('obCount').textContent = state.bets.length;
  if (!state.bets.length) { list.innerHTML = '<p class="no-bets">No open bets</p>'; return; }
  list.innerHTML = state.bets.slice(0, 5).map(b => `
    <div class="obet">
      <div class="obet-top">
        <span class="obet-id">${b.id}</span>
        <span class="st-${b.status}">${b.status === 'pending' ? '⏳ Pending' : b.status === 'won' ? '✅ Won' : '❌ Lost'}</span>
      </div>
      <div>GH₵${b.stake} · Odds ${b.odds}</div>
      <div style="color:var(--green-odd-a);font-size:.68rem">Win: GH₵${parseFloat(b.win).toLocaleString()}</div>
    </div>`).join('');
}

// ── BALANCE ───────────────────────────────────────────────────
function updateBalance() {
  $('balVal').textContent = `GH₵ ${state.balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

// ── SECTION SWITCH ────────────────────────────────────────────
function switchSection(sec) {
  state.section = sec;
  $$('.pg').forEach(p => p.classList.remove('active'));
  const pg = $(`pg-${sec}`);
  if (pg) pg.classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === sec));
}

function switchSport(sport) {
  state.sport = sport;
  $$('.sn-item').forEach(i => i.classList.toggle('active', i.dataset.sport === sport));
  renderMatches(state.filter);
  switchSection('sports');
}

function toggleLeague(hd) {
  hd.classList.toggle('shut');
  const list = hd.nextElementSibling;
  if (list) list.classList.toggle('hidden');
}

// ── MODALS ────────────────────────────────────────────────────
function openModal(id) { const m = $(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = $(id); if (m) m.classList.remove('open'); }

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 3000);
}

// ── CLOCK ─────────────────────────────────────────────────────
function tickClock() {
  const el = $('topTime');
  if (!el) return;
  const update = () => { el.textContent = new Date().toLocaleTimeString('en-GH'); };
  update();
  setInterval(update, 1000);
}

// ── JACKPOT COUNTDOWN ─────────────────────────────────────────
function tickJackpot() {
  const el = $('jpCd');
  if (!el) return;
  setInterval(() => {
    if (state.jpSecs > 0) state.jpSecs--;
    const h = Math.floor(state.jpSecs / 3600);
    const m = Math.floor((state.jpSecs % 3600) / 60);
    const s = state.jpSecs % 60;
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, 1000);
}

// ── LIVE ODDS FLICKER ─────────────────────────────────────────
function flickerOdds() {
  setInterval(() => {
    const btns = Array.from($$('.odd-btn:not(.active)'));
    if (!btns.length) return;
    const btn = btns[Math.floor(Math.random() * btns.length)];
    const valEl = btn.querySelector('.ob-val');
    if (!valEl) return;
    const cur = parseFloat(valEl.textContent);
    if (!cur) return;
    const delta = (Math.random() - 0.5) * 0.08;
    const nv = Math.max(1.01, cur + delta);
    valEl.textContent = nv.toFixed(2);
    const dir = delta > 0 ? 'up' : 'dn';
    btn.classList.remove('up','dn','flash-up','flash-dn');
    btn.classList.add(dir, `flash-${dir}`);
    if (btn.dataset.odd) btn.dataset.odd = nv.toFixed(2);
    setTimeout(() => btn.classList.remove('up','dn','flash-up','flash-dn'), 800);
  }, 2200);
}

function handleSearchResult(sport) {
  $('searchResults').style.display = 'none';
  if ($('searchInput')) $('searchInput').value = '';
  switchSport(sport);
}

// ── BIND ALL ──────────────────────────────────────────────────
function bindAll() {
  // Promo strip close
  $('psClose')?.addEventListener('click', () => { $('promoStrip').style.display = 'none'; });

  // Nav links
  $$('.nav-item').forEach(n => {
    n.addEventListener('click', e => { e.preventDefault(); switchSection(n.dataset.section); });
  });

  // Sport nav
  $$('.sn-item').forEach(i => {
    i.addEventListener('click', () => switchSport(i.dataset.sport));
  });

  // Filter pills
  $$('.fpill').forEach(p => {
    p.addEventListener('click', () => {
      $$('.fpill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      state.filter = p.dataset.filter;
      renderMatches(state.filter);
    });
  });

  // Bet slip tabs
  $$('.bs-tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('.bs-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    });
  });

  // Stake input + quick amounts
  $('stakeInput')?.addEventListener('input', recalc);
  $$('.qa').forEach(b => {
    b.addEventListener('click', () => { $('stakeInput').value = b.dataset.a; recalc(); });
  });

  // Place bet
  $('placeBetBtn')?.addEventListener('click', placeBet);

  // Clear slip
  $('bsTrash')?.addEventListener('click', () => {
    state.slip.forEach(b => { const btn = document.querySelector(`[data-id="${b.id}"]`); if (btn) btn.classList.remove('active'); });
    state.slip = [];
    renderSlip();
    toast('Bet slip cleared', 'info');
  });

  // Header buttons → modals
  $('depositBtn')?.addEventListener('click', () => openModal('modalDeposit'));
  $('loginBtn')?.addEventListener('click',   () => openModal('modalLogin'));
  $('joinBtn')?.addEventListener('click',    () => openModal('modalJoin'));

  // Modal close buttons
  $$('.modal-x').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
  $$('.modal-bg').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));

  // Switch between login/join
  $('toJoin')?.addEventListener('click', e => { e.preventDefault(); closeModal('modalLogin'); openModal('modalJoin'); });
  $('toLogin')?.addEventListener('click', e => { e.preventDefault(); closeModal('modalJoin'); openModal('modalLogin'); });

  // Deposit confirm
  $('doDeposit')?.addEventListener('click', () => {
    const amt = parseFloat($('depAmt')?.value);
    if (!amt || amt < 20) { toast('Minimum deposit is GH₵20', 'err'); return; }
    state.balance += amt;
    updateBalance();
    closeModal('modalDeposit');
    $('depAmt').value = '';
    toast(`GH₵${amt.toLocaleString()} deposited! 🎉`, 'ok');
  });

  // Login confirm
  $('doLogin')?.addEventListener('click', () => {
    const u = $('lgUser')?.value.trim();
    const p = $('lgPass')?.value.trim();
    if (!u || !p) { toast('Please fill in all fields', 'err'); return; }
    closeModal('modalLogin');
    toast('Welcome back! 👋', 'ok');
  });

  // Join confirm
  $('doJoin')?.addEventListener('click', () => {
    const name = $('rgName')?.value.trim();
    const phone = $('rgPhone')?.value.trim();
    const terms = $('rgTerms')?.checked;
    if (!name || !phone) { toast('Please fill in all required fields', 'err'); return; }
    if (!terms) { toast('Please accept the Terms & Conditions', 'err'); return; }
    closeModal('modalJoin');
    toast(`Welcome, ${name}! Account created 🎉`, 'ok');
  });

  // Pay method tabs
  $$('.ptab').forEach(b => {
    b.addEventListener('click', () => {
      $$('.ptab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  // Hero odds
  $$('.hero-odds .odd-btn').forEach(b => b.addEventListener('click', () => toggleOdd(b)));

  // Hamburger mobile toggle
  $('hamburger')?.addEventListener('click', () => $('leftPanel')?.classList.toggle('open'));

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-bg.open').forEach(m => m.classList.remove('open'));
  });

  // Search
  const srInput = $('searchInput');
  const srResults = $('searchResults');
  if (srInput && srResults) {
    srInput.addEventListener('input', () => {
      const q = srInput.value.trim().toLowerCase();
      if (q.length < 2) { srResults.style.display = 'none'; return; }
      const hits = [];
      Object.entries(MATCHES_DATA).forEach(([sport, leagues]) => {
        leagues.forEach(lg => {
          lg.matches.forEach(m => {
            if (m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q) || lg.league.toLowerCase().includes(q)) {
              hits.push({ flag: lg.flag, league: lg.league, match: `${m.home} vs ${m.away}`, time: m.time, sport });
            }
          });
        });
      });
      if (!hits.length) { srResults.style.display = 'none'; return; }
      srResults.innerHTML = hits.slice(0, 6).map(h =>
        `<div class="sr-item" onclick="handleSearchResult('${h.sport}')">
          <span class="sr-flag">${h.flag}</span>
          <div><div class="sr-match">${h.match}</div><div class="sr-league">${h.league} · ${h.time}</div></div>
        </div>`).join('');
      srResults.style.display = 'block';
    });
    document.addEventListener('click', e => {
      if (!$('searchWrap')?.contains(e.target)) srResults.style.display = 'none';
    });
  }
}
