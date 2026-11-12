/**
 * ===================================================================
 * ExpenseSync - Unit 2 Part A: Vanilla JavaScript Application
 * Concepts: DOM Manipulation, Events, ES6 Array Methods, Closures,
 * Precision Decimal Rounding & 4 Splitwise Algorithms.
 * ===================================================================
 */

// Initial application state
let state = {
  totalAmount: 2400.0,
  splitMode: 'EQUAL', // 'EQUAL' | 'EXACT' | 'PERCENT' | 'SHARES'
  paidById: 1,
  members: [
    { id: 1, name: 'Rahul Sharma (You)', value: 1, share: 600.0 },
    { id: 2, name: 'Priya Nair', value: 1, share: 600.0 },
    { id: 3, name: 'Amit Patel', value: 1, share: 600.0 },
    { id: 4, name: 'Sneha Rao', value: 1, share: 600.0 }
  ]
};

// DOM Element Selectors
const totalAmountInput = document.getElementById('totalAmount');
const paidBySelect = document.getElementById('paidBySelect');
const splitRadios = document.querySelectorAll('input[name="splitMode"]');
const membersContainer = document.getElementById('membersContainer');
const addMemberBtn = document.getElementById('addMemberBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const statusAlert = document.getElementById('statusAlert');
const resultsCard = document.getElementById('resultsCard');
const settlementList = document.getElementById('settlementList');

// Lifecycle initialization
document.addEventListener('DOMContentLoaded', () => {
  renderPaidByOptions();
  renderMembers();
  recalculateShares();
  setupEventListeners();
});

/**
 * Attaches event listeners for real-time interactivity
 */
function setupEventListeners() {
  // Total amount live change
  totalAmountInput.addEventListener('input', (e) => {
    state.totalAmount = parseFloat(e.target.value) || 0;
    recalculateShares();
  });

  // Payer selection change
  paidBySelect.addEventListener('change', (e) => {
    state.paidById = parseInt(e.target.value, 10);
    recalculateShares();
  });

  // Split mode radio toggle
  splitRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      state.splitMode = e.target.value;
      resetDefaultInputsForMode(state.splitMode);
      renderMembers();
      recalculateShares();
    });
  });

  // Add new dynamic member
  addMemberBtn.addEventListener('click', handleAddMember);

  // Calculate & finalize button with Confetti
  calculateBtn.addEventListener('click', handleCalculateAndSettle);

  // Reset button
  resetBtn.addEventListener('click', handleReset);
}

/**
 * Resets inputs based on selected split mode
 */
function resetDefaultInputsForMode(mode) {
  const n = state.members.length;
  state.members.forEach((m) => {
    if (mode === 'EQUAL') m.value = 1;
    else if (mode === 'EXACT') m.value = Number((state.totalAmount / n).toFixed(2));
    else if (mode === 'PERCENT') m.value = Number((100 / n).toFixed(2));
    else if (mode === 'SHARES') m.value = 1;
  });
}

/**
 * Renders the payer <select> dropdown
 */
function renderPaidByOptions() {
  paidBySelect.innerHTML = '';
  state.members.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    if (m.id === state.paidById) opt.selected = true;
    paidBySelect.appendChild(opt);
  });
}

/**
 * Renders the interactive member list in the DOM
 */
function renderMembers() {
  membersContainer.innerHTML = '';

  state.members.forEach((member, index) => {
    const row = document.createElement('div');
    row.className = 'member-row';

    // Member Name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'member-name';
    nameSpan.textContent = member.name;
    row.appendChild(nameSpan);

    // Dynamic input based on mode
    if (state.splitMode !== 'EQUAL') {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'member-input';
      input.value = member.value;
      input.step = state.splitMode === 'SHARES' ? '1' : '0.01';
      input.min = '0';
      input.placeholder = state.splitMode === 'PERCENT' ? '%' : state.splitMode === 'SHARES' ? 'Shares' : '₹';

      input.addEventListener('input', (e) => {
        member.value = parseFloat(e.target.value) || 0;
        recalculateShares();
      });

      row.appendChild(input);
    }

    // Share pill display
    const sharePill = document.createElement('span');
    sharePill.className = 'member-share-pill';
    sharePill.id = `share-pill-${member.id}`;
    sharePill.textContent = `₹${member.share.toFixed(2)}`;
    row.appendChild(sharePill);

    // Remove member button (only if > 2 members)
    if (state.members.length > 2) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-secondary btn-sm';
      removeBtn.style.padding = '0.2rem 0.5rem';
      removeBtn.innerHTML = '✕';
      removeBtn.title = 'Remove member';
      removeBtn.addEventListener('click', () => handleRemoveMember(member.id));
      row.appendChild(removeBtn);
    }

    membersContainer.appendChild(row);
  });
}

/**
 * Core Mathematical Split Algorithms with paise/cent rounding absorption
 */
function recalculateShares() {
  const total = Number(state.totalAmount) || 0;
  const n = state.members.length;
  if (n === 0) return;

  hideAlert();

  if (state.splitMode === 'EQUAL') {
    // Equal Split: divide by n with penny rounding absorbed by last member
    const baseShare = Math.floor((total / n) * 100) / 100;
    let distributed = 0;

    state.members.forEach((m, idx) => {
      if (idx === n - 1) {
        // Last member absorbs the difference
        m.share = Number((total - distributed).toFixed(2));
      } else {
        m.share = baseShare;
        distributed += baseShare;
      }
    });

  } else if (state.splitMode === 'EXACT') {
    // Exact Split: user specifies exact currency amounts
    let currentSum = 0;
    state.members.forEach((m) => {
      m.share = Number(m.value) || 0;
      currentSum += m.share;
    });

    const diff = Number((total - currentSum).toFixed(2));
    if (Math.abs(diff) > 0.01) {
      showAlert(`Exact amounts total ₹${currentSum.toFixed(2)}, which does not match total ₹${total.toFixed(2)} (Difference: ₹${diff.toFixed(2)})`, 'danger');
    }

  } else if (state.splitMode === 'PERCENT') {
    // Percentage Split: user specifies % totaling 100%
    const totalPercent = state.members.reduce((acc, m) => acc + (Number(m.value) || 0), 0);
    
    if (Math.abs(totalPercent - 100) > 0.1) {
      showAlert(`Percentages currently sum to ${totalPercent.toFixed(1)}%. Must equal 100%.`, 'danger');
    }

    let distributed = 0;
    state.members.forEach((m, idx) => {
      if (idx === n - 1) {
        m.share = Number((total - distributed).toFixed(2));
      } else {
        const share = Math.floor((total * (m.value / 100)) * 100) / 100;
        m.share = share;
        distributed += share;
      }
    });

  } else if (state.splitMode === 'SHARES') {
    // Shares Split: e.g. 2:1:1:1
    const totalShares = state.members.reduce((acc, m) => acc + (Number(m.value) || 0), 0);

    if (totalShares <= 0) {
      showAlert('Total shares must be greater than zero.', 'danger');
      return;
    }

    let distributed = 0;
    state.members.forEach((m, idx) => {
      if (idx === n - 1) {
        m.share = Number((total - distributed).toFixed(2));
      } else {
        const share = Math.floor((total * (m.value / totalShares)) * 100) / 100;
        m.share = share;
        distributed += share;
      }
    });
  }

  // Update UI share pills
  state.members.forEach((m) => {
    const pill = document.getElementById(`share-pill-${m.id}`);
    if (pill) {
      pill.textContent = `₹${m.share.toFixed(2)}`;
    }
  });
}

/**
 * Computes who owes whom for this single transaction and triggers Confetti
 */
function handleCalculateAndSettle() {
  recalculateShares();

  const total = state.totalAmount;
  const currentSum = state.members.reduce((acc, m) => acc + m.share, 0);

  if (Math.abs(total - currentSum) > 0.05) {
    showAlert(`Cannot finalize: Sum of shares (₹${currentSum.toFixed(2)}) does not match bill total (₹${total.toFixed(2)})`, 'danger');
    return;
  }

  const payer = state.members.find((m) => m.id === state.paidById);
  resultsCard.style.display = 'block';
  settlementList.innerHTML = '';

  state.members.forEach((m) => {
    const item = document.createElement('div');
    item.style.padding = '0.6rem 0.8rem';
    item.style.borderRadius = '6px';
    item.style.background = '#f8fafc';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';

    if (m.id === payer.id) {
      const netOwedToPayer = total - m.share;
      item.innerHTML = `<strong>${m.name} (Paid ₹${total.toFixed(2)})</strong> <span style="color: var(--success); font-weight: bold;">Gets back ₹${netOwedToPayer.toFixed(2)}</span>`;
    } else {
      item.innerHTML = `<span>${m.name}</span> <span style="color: var(--danger); font-weight: bold;">Owes ${payer.name.split(' ')[0]} ₹${m.share.toFixed(2)}</span>`;
    }

    settlementList.appendChild(item);
  });

  showAlert(`Split finalized successfully! All ${state.members.length} member shares verified.`, 'success');

  // Trigger third-party library: Canvas Confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  }
}

/**
 * Dynamic member addition
 */
function handleAddMember() {
  const name = prompt('Enter new member name:');
  if (!name || name.trim() === '') return;

  const newId = Date.now();
  state.members.push({
    id: newId,
    name: name.trim(),
    value: 1,
    share: 0
  });

  renderPaidByOptions();
  renderMembers();
  recalculateShares();
}

/**
 * Member removal
 */
function handleRemoveMember(id) {
  state.members = state.members.filter((m) => m.id !== id);
  if (state.paidById === id) {
    state.paidById = state.members[0].id;
  }
  renderPaidByOptions();
  renderMembers();
  recalculateShares();
}

/**
 * Reset form
 */
function handleReset() {
  state.totalAmount = 2400.0;
  totalAmountInput.value = '2400';
  state.splitMode = 'EQUAL';
  document.querySelector('input[value="EQUAL"]').checked = true;
  resetDefaultInputsForMode('EQUAL');
  resultsCard.style.display = 'none';
  hideAlert();
  renderMembers();
  recalculateShares();
}

function showAlert(msg, type) {
  statusAlert.textContent = msg;
  statusAlert.className = `alert alert-${type}`;
  statusAlert.style.display = 'block';
}

function hideAlert() {
  statusAlert.style.display = 'none';
}
