// ================================================================
//  SportyWin — Main Application Logic
// ================================================================

// ── State ──────────────────────────────────────────────────────
const state = {
  betSlip: [],          // { id, match, market, selection, odd }
  placedBets: [],       // placed bet records
  activeSport: 'football',
  activeSection: 'sports',
  activeFilter: 'all',
  activeSlipType: 'single',
  activeMarket: '1x2',
  balance: 5000.00,
  loggedIn: false,
  jackpotSeconds: 9930  // countdown ~2h45m
};

// ── DOM Refs ───────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMatches();
  renderLiveMatches();
  renderCasino();
  renderVirtual();
  renderResults();
  renderPromos();
  bindEvents();
  startJackpotCountdown();
  startLiveOddsFlicker();
  updateBalance();
});

// ── RENDER MATCHES ─────────────────────────────────────────────
function renderMatches(filter = 'all') {
  const container = $('matchesContainer');
  const sport = state.activeSport;
  const data = MATCHES_DATA[sport];

  if (!data) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary)">No matches available for this sport.</div>';
    return;
  }

  let html = '';
  data.forEach(league => {
    let matches = league.matches;
    if (filter === 'today') matches = matches.filter(m => m.time.includes('Today') || m.isLive);
    if (filter === 'tomorrow') matches = matches.filter(m => m.time.includes('Tomorrow'));
    if (filter === 'live') matches = matches.filter(m => m.isLive);
    if (!matches.length) return;

    html += `
      <div class="league-group">
        <div class="league-header" onclick="toggleLeague(this)">
          <span class="league-flag">${league.flag}</span>
          <span class="league-name">${league.league}</span>
          <span class="league-count">${matches.length}</span>
          <span class="league-toggle">▼</span>
        </div>
        <div class="match-list">
          ${matches.map(m => renderMatchRow(m)).join('')}
        </div>
      </div>`;
  });

  container.innerHTML = html || '<div style="padding:40px;text-align:center;color:var(--text-secondary)">No matches found for this filter.</div>';
}

function renderMatchRow(m) {
  const isInSlip = (sel) => state.betSlip.some(b => b.id === `${m.id}-${sel}`);

  const timeHtml = m.isLive
    ? `<span class="match-time live-time">🔴 ${m.minute}</span>`
    : `<span class="match-time">${m.time}</span>`;

  const homeScore = m.isLive ? `<span class="live-score">${m.liveScore.split('-')[0]}</span>` : '';
  const awayScore = m.isLive ? `<span class="live-score">${m.liveScore.split('-')[1]}</span>` : '';

  const oddsHtml = Object.entries(m.odds).map(([label, val]) => {
    if (!val) return '';
    const selId = `${m.id}-${label}`;
    const active = isInSlip(label) ? 'active' : '';
    const selName = label === '1' ? `${m.home} Win` : label === '2' ? `${m.away} Win` : 'Draw';
    return `
      <button class="odd-btn ${active}" id="odd-${selId}"
        data-match="${m.home} vs ${m.away}"
        data-market="1X2"
        data-selection="${selName}"
        data-odd="${val}"
        data-id="${selId}"
        onclick="toggleOdd(this)">
        <span class="odd-label">${label}</span>
        <span class="odd-value">${val.toFixed(2)}</span>
      </button>`;
  }).join('');

  return `
    <div class="match-row">
      <div class="match-info">
        ${timeHtml}
        <div class="match-teams">
          <span class="match-team">${m.home}${homeScore}</span>
          <span class="match-team">${m.away}${awayScore}</span>
        </div>
      </div>
      <div class="match-odds">
        ${oddsHtml}
        <span class="more-markets">+${m.moreCount}</span>
      </div>
    </div>`;
}

// ── RENDER LIVE MATCHES ────────────────────────────────────────
function renderLiveMatches() {
  const container = $('liveMatchesContainer');
  const html = `
    <div class="league-group">
      <div class="league-header">
        <span class="live-dot"></span>
        <span class="league-name" style="margin-left:6px">Live Now — ${LIVE_MATCHES.length} matches</span>
      </div>
      <div class="match-list">
        ${LIVE_MATCHES.map(m => {
          const oddsHtml = Object.entries(m.odds).map(([label, val]) => {
            if (!val) return '';
            return `
              <button class="odd-btn" id="odd-${m.id}-${label}"
                data-match="${m.home} vs ${m.away}"
                data-market="1X2 (Live)"
                data-selection="${label === '1' ? m.home + ' Win' : label === '2' ? m.away + ' Win' : 'Draw'}"
                data-odd="${val}"
                data-id="${m.id}-${label}"
                onclick="toggleOdd(this)">
                <span class="odd-label">${label}</span>
                <span class="odd-value">${val.toFixed(2)}</span>
              </button>`;
          }).join('');
          return `
            <div class="match-row">
              <div class="match-info">
                <span class="match-time live-time">${m.sport} 🔴 ${m.minute} | ${m.league}</span>
                <div class="match-teams">
                  <span class="match-team">${m.home} <span class="live-score">${m.score.split('-')[0]}</span></span>
                  <span class="match-team">${m.away} <span class="live-score">${m.score.split('-')[1]}</span></span>
                </div>
              </div>
              <div class="match-odds">${oddsHtml}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
  container.innerHTML = html;
}

// ── RENDER CASINO ──────────────────────────────────────────────
function renderCasino() {
  const container = $('casinoGrid');
  container.innerHTML = CASINO_GAMES.map(g => `
    <div class="casino-card" onclick="showToast('${g.name} loading...', 'info')">
      <div class="casino-thumb">
        <span>${g.icon}</span>
      </div>
      <div class="casino-name">${g.name}${g.hot ? ' 🔥' : ''}</div>
      <div class="casino-provider">${g.provider}</div>
    </div>`).join('');
}

// ── RENDER VIRTUAL ─────────────────────────────────────────────
function renderVirtual() {
  const container = $('virtualGrid');
  container.innerHTML = VIRTUAL_SPORTS.map(v => `
    <div class="virtual-card" onclick="showToast('Opening ${v.name}...', 'info')">
      <div class="virtual-icon">${v.icon}</div>
      <div class="virtual-name">${v.name}</div>
      <div class="virtual-desc">${v.desc}</div>
      <span class="virtual-badge">${v.badge}</span>
    </div>`).join('');
}

// ── RENDER RESULTS ─────────────────────────────────────────────
function renderResults() {
  const container = $('resultsContainer');
  container.innerHTML = RECENT_RESULTS.map(r => `
    <div class="result-row">
      <div class="result-home">${r.home}</div>
      <div class="result-score">${r.score}</div>
      <div class="result-away">${r.away}</div>
      <div class="result-time">${r.time}<br><small style="color:var(--text-secondary)">${r.league}</small></div>
    </div>`).join('');
}

// ── RENDER PROMOS ──────────────────────────────────────────────
function renderPromos() {
  const container = $('promosGrid');
  container.innerHTML = PROMOTIONS.map(p => `
    <div class="promo-card">
      <div class="promo-banner-img">${p.icon}</div>
      <div class="promo-card-body">
        <div class="promo-card-title">${p.title}</div>
        <div class="promo-card-desc">${p.desc}</div>
        <button class="promo-card-btn" onclick="handlePromo('${p.id}')">${p.cta}</button>
      </div>
    </div>`).join('');
}

// ── ODD TOGGLE (Add/Remove from Bet Slip) ─────────────────────
function toggleOdd(btn) {
  const id = btn.dataset.id;
  const existing = state.betSlip.findIndex(b => b.id === id);

  if (existing !== -1) {
    state.betSlip.splice(existing, 1);
    btn.classList.remove('active');
    showToast('Selection removed.', 'info');
  } else {
    // Remove any other selection for the same match
    const matchName = btn.dataset.match;
    state.betSlip = state.betSlip.filter(b => b.match !== matchName);
    // Deactivate other buttons for this match
    $$(`[data-match="${matchName}"]`).forEach(b => b.classList.remove('active'));

    state.betSlip.push({
      id,
      match: btn.dataset.match,
      market: btn.dataset.market,
      selection: btn.dataset.selection,
      odd: parseFloat(btn.dataset.odd)
    });
    btn.classList.add('active');
    showToast(`${btn.dataset.selection} @ ${btn.dataset.odd} added!`, 'success');
  }

  renderBetSlip();
}

// ── RENDER BET SLIP ────────────────────────────────────────────
function renderBetSlip() {
  const selectionsEl = $('betSelections');
  const emptySlip = $('emptySlip');
  const footer = $('betslipFooter');
  const count = state.betSlip.length;

  $('slipCount').textContent = count;

  if (count === 0) {
    selectionsEl.innerHTML = `
      <div class="empty-slip" id="emptySlip">
        <div class="empty-icon">🎯</div>
        <p>Your bet slip is empty.</p>
        <p class="empty-hint">Click on odds to add selections.</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  const selHtml = state.betSlip.map(b => `
    <div class="bet-selection">
      <div class="selection-match">${b.match}</div>
      <div class="selection-pick">${b.selection}</div>
      <div class="selection-market">${b.market}</div>
      <span class="selection-odd">${b.odd.toFixed(2)}</span>
      <button class="selection-remove" onclick="removeSelection('${b.id}')" title="Remove">×</button>
    </div>`).join('');

  selectionsEl.innerHTML = selHtml;
  updateBetSummary();
}

function removeSelection(id) {
  state.betSlip = state.betSlip.filter(b => b.id !== id);
  // Deactivate the button
  const btn = document.querySelector(`[data-id="${id}"]`);
  if (btn) btn.classList.remove('active');
  renderBetSlip();
  showToast('Selection removed.', 'info');
}

function updateBetSummary() {
  const stake = parseFloat($('stakeInput')?.value || 0);
  const totalOdds = state.betSlip.reduce((acc, b) => acc * b.odd, 1);
  const potentialWin = stake > 0 ? (stake * totalOdds).toFixed(2) : '0.00';

  const totalOddsEl = $('totalOdds');
  const potWinEl = $('potentialWin');
  if (totalOddsEl) totalOddsEl.textContent = totalOdds.toFixed(2);
  if (potWinEl) potWinEl.textContent = `GH₵ ${parseFloat(potentialWin).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

// ── PLACE BET ──────────────────────────────────────────────────
function placeBet() {
  const stake = parseFloat($('stakeInput').value);
  if (!stake || stake < 1) { showToast('Minimum stake is GH₵1.', 'error'); return; }
  if (stake > state.balance) { showToast('Insufficient balance!', 'error'); return; }
  if (state.betSlip.length === 0) { showToast('Add selections to your bet slip.', 'error'); return; }

  const totalOdds = state.betSlip.reduce((acc, b) => acc * b.odd, 1);
  const potentialWin = (stake * totalOdds).toFixed(2);
  const betId = 'BET-' + Date.now().toString(36).toUpperCase();

  const bet = {
    id: betId,
    stake,
    totalOdds: totalOdds.toFixed(2),
    potentialWin,
    selections: [...state.betSlip],
    status: 'pending',
    time: new Date().toLocaleTimeString()
  };

  state.placedBets.unshift(bet);
  state.balance -= stake;
  updateBalance();

  // Clear slip
  state.betSlip.forEach(b => {
    const btn = document.querySelector(`[data-id="${b.id}"]`);
    if (btn) btn.classList.remove('active');
  });
  state.betSlip = [];
  $('stakeInput').value = '';
  renderBetSlip();
  renderMyBets();

  // Show confirmation modal
  $('betRef').textContent = betId;
  $('betConfirmText').textContent = `Stake: GH₵${stake} | Potential Win: GH₵${parseFloat(potentialWin).toLocaleString()}`;
  openModal('betConfirmModal');

  showToast('Bet placed successfully! 🎉', 'success');
}

// ── MY BETS ────────────────────────────────────────────────────
function renderMyBets() {
  const container = $('myBetsList');
  $('myBetsCount').textContent = state.placedBets.length;

  if (!state.placedBets.length) {
    container.innerHTML = '<p class="no-bets">No bets placed yet.</p>';
    return;
  }

  container.innerHTML = state.placedBets.slice(0, 5).map(b => {
    const statusClass = `status-${b.status}`;
    const statusLabel = b.status === 'pending' ? '⏳ Pending' : b.status === 'won' ? '✅ Won' : '❌ Lost';
    return `
      <div class="my-bet-item">
        <div class="bet-item-header">
          <span class="bet-item-id">${b.id}</span>
          <span class="bet-item-status ${statusClass}">${statusLabel}</span>
        </div>
        <div>Stake: <strong>GH₵${b.stake}</strong> | Odds: <strong>${b.totalOdds}</strong></div>
        <div style="color:var(--primary-light);font-size:0.7rem">Win: GH₵${parseFloat(b.potentialWin).toLocaleString()}</div>
      </div>`;
  }).join('');
}

// ── BALANCE ────────────────────────────────────────────────────
function updateBalance() {
  $('balanceAmount').textContent = `GH₵ ${state.balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

// ── NAVIGATION ─────────────────────────────────────────────────
function switchSection(section) {
  state.activeSection = section;
  $$('.content-section').forEach(s => s.classList.remove('active'));
  const target = $(`section-${section}`);
  if (target) target.classList.add('active');

  $$('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });
}

function switchSport(sport) {
  state.activeSport = sport;
  $$('.sport-item').forEach(item => {
    item.classList.toggle('active', item.dataset.sport === sport);
  });
  renderMatches(state.activeFilter);
}

function toggleLeague(header) {
  header.classList.toggle('collapsed');
  const list = header.nextElementSibling;
  if (list) {
    list.style.display = header.classList.contains('collapsed') ? 'none' : 'block';
  }
}

// ── MODALS ─────────────────────────────────────────────────────
function openModal(id) {
  const modal = $(id);
  if (modal) { modal.classList.add('open'); }
}

function closeModal(id) {
  const modal = $(id);
  if (modal) modal.classList.remove('open');
}

// ── TOAST ──────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── JACKPOT COUNTDOWN ──────────────────────────────────────────
function startJackpotCountdown() {
  const el = $('jackpotCountdown');
  if (!el) return;

  setInterval(() => {
    if (state.jackpotSeconds > 0) state.jackpotSeconds--;
    const h = Math.floor(state.jackpotSeconds / 3600);
    const m = Math.floor((state.jackpotSeconds % 3600) / 60);
    const s = state.jackpotSeconds % 60;
    el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

// ── SIMULATED LIVE ODDS FLICKER ────────────────────────────────
function startLiveOddsFlicker() {
  setInterval(() => {
    const allOddBtns = $$('.odd-btn:not(.active)');
    if (!allOddBtns.length) return;

    const btn = allOddBtns[Math.floor(Math.random() * allOddBtns.length)];
    const currentVal = parseFloat(btn.querySelector('.odd-value')?.textContent || '0');
    if (!currentVal) return;

    const delta = (Math.random() - 0.5) * 0.1;
    const newVal = Math.max(1.01, currentVal + delta);
    const direction = delta > 0 ? 'up' : 'down';

    const valEl = btn.querySelector('.odd-value');
    if (valEl) {
      valEl.textContent = newVal.toFixed(2);
      btn.classList.remove('flash-up', 'flash-down', 'price-up', 'price-down');
      btn.classList.add(`flash-${direction}`, `price-${direction}`);
      setTimeout(() => {
        btn.classList.remove('flash-up', 'flash-down', 'price-up', 'price-down');
      }, 800);

      // Update in-memory data too
      if (btn.dataset.odd) btn.dataset.odd = newVal.toFixed(2);
    }
  }, 2500);
}

// ── DEPOSIT SIMULATION ─────────────────────────────────────────
function handleDeposit() {
  const amount = parseFloat($('depositAmount')?.value);
  if (!amount || amount < 10) { showToast('Minimum deposit is GH₵10.', 'error'); return; }
  state.balance += amount;
  updateBalance();
  closeModal('depositModal');
  showToast(`GH₵${amount.toLocaleString()} deposited successfully! 🎉`, 'success');
  $('depositAmount').value = '';
}

// ── LOGIN SIMULATION ───────────────────────────────────────────
function handleLogin() {
  const user = $('loginUser')?.value.trim();
  const pass = $('loginPass')?.value.trim();
  if (!user || !pass) { showToast('Please enter credentials.', 'error'); return; }
  state.loggedIn = true;
  closeModal('loginModal');
  showToast(`Welcome back! 👋`, 'success');
}

function handleRegister() {
  const name = $('regName')?.value.trim();
  const phone = $('regPhone')?.value.trim();
  const pass = $('regPass')?.value.trim();
  const terms = $('regTerms')?.checked;
  if (!name || !phone || !pass) { showToast('Please fill in all required fields.', 'error'); return; }
  if (!terms) { showToast('Please accept the Terms & Conditions.', 'error'); return; }
  state.loggedIn = true;
  closeModal('registerModal');
  showToast(`Account created! Welcome, ${name}! 🎉`, 'success');
}

function handlePromo(id) {
  openModal('loginModal');
  showToast('Log in to claim this promotion!', 'info');
}

// ── BIND EVENTS ────────────────────────────────────────────────
function bindEvents() {
  // Promo banner close
  $('promoClose')?.addEventListener('click', () => {
    $('promoBanner').style.display = 'none';
  });

  // Nav links
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });

  // Sport list
  $$('.sport-item').forEach(item => {
    item.addEventListener('click', () => {
      switchSection('sports');
      switchSport(item.dataset.sport);
    });
  });

  // Filter tabs
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeFilter = tab.dataset.filter;
      renderMatches(state.activeFilter);
    });
  });

  // Bet slip tabs
  $$('.slip-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.slip-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeSlipType = tab.dataset.type;
    });
  });

  // Stake input
  $('stakeInput')?.addEventListener('input', updateBetSummary);

  // Quick stake buttons
  $$('.quick-stake').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $('stakeInput');
      if (input) {
        input.value = btn.dataset.amount;
        updateBetSummary();
      }
    });
  });

  // Place bet
  $('placeBetBtn')?.addEventListener('click', placeBet);

  // Clear slip
  $('clearSlip')?.addEventListener('click', () => {
    state.betSlip.forEach(b => {
      const btn = document.querySelector(`[data-id="${b.id}"]`);
      if (btn) btn.classList.remove('active');
    });
    state.betSlip = [];
    renderBetSlip();
    showToast('Bet slip cleared.', 'info');
  });

  // Modal open buttons
  $('depositBtn')?.addEventListener('click', () => openModal('depositModal'));
  $('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
  $('registerBtn')?.addEventListener('click', () => openModal('registerModal'));

  // Modal close buttons
  $$('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // Modal overlays close on background click
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Deposit confirm
  $('confirmDeposit')?.addEventListener('click', handleDeposit);

  // Login/Register confirm
  $('confirmLogin')?.addEventListener('click', handleLogin);
  $('confirmRegister')?.addEventListener('click', handleRegister);

  // Switch between login/register modals
  $('switchToRegister')?.addEventListener('click', e => {
    e.preventDefault();
    closeModal('loginModal');
    openModal('registerModal');
  });
  $('switchToLogin')?.addEventListener('click', e => {
    e.preventDefault();
    closeModal('registerModal');
    openModal('loginModal');
  });

  // Payment methods
  $$('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.pay-method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Featured match odds
  $$('.feat-odd').forEach(btn => {
    btn.addEventListener('click', () => toggleOdd(btn));
  });

  // Market select
  $('marketSelect')?.addEventListener('change', e => {
    state.activeMarket = e.target.value;
    showToast(`Market switched to ${e.target.options[e.target.selectedIndex].text}`, 'info');
  });

  // Mobile menu toggle
  $('menuToggle')?.addEventListener('click', () => {
    $('sidebarLeft')?.classList.toggle('open');
  });

  // Keyboard shortcut: Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}
