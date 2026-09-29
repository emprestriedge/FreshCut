/* ══════════════════════════════════════════════════════════
   FRESHCUT RECALL — App Logic
   A quick client cheat sheet for stylists.
   Data persists in localStorage, structured for future
   migration to a real backend if needed.
   ══════════════════════════════════════════════════════════ */

// ── DATA LAYER ────────────────────────────────────────────
// All client data stored under one localStorage key

const STORAGE_KEY = 'freshcut-recall-clients';

function loadClients() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

// Generate a unique ID for each client entry
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ── FORM STATE ────────────────────────────────────────────
// Track yes/no toggle states for pets and kids

let hasPets = null;   // null = not answered, true/false = answered
let hasKids = null;

// ── TAB NAVIGATION ────────────────────────────────────────

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === `screen-${tabName}`);
  });

  // When switching to database, refresh the list
  if (tabName === 'database') {
    renderClientList();
  }
}

// ── TOGGLE BUTTONS (Pets / Kids) ──────────────────────────

function togglePets(value) {
  hasPets = value;
  const yesBtn = document.getElementById('petsYes');
  const noBtn = document.getElementById('petsNo');
  const details = document.getElementById('petDetails');

  yesBtn.className = 'toggle-btn' + (value ? ' selected-yes' : '');
  noBtn.className = 'toggle-btn' + (!value ? ' selected-no' : '');

  if (value) {
    details.classList.remove('hidden');
  } else {
    details.classList.add('hidden');
    document.getElementById('petKind').value = '';
  }
}

function toggleKids(value) {
  hasKids = value;
  const yesBtn = document.getElementById('kidsYes');
  const noBtn = document.getElementById('kidsNo');
  const details = document.getElementById('kidDetails');

  yesBtn.className = 'toggle-btn' + (value ? ' selected-yes' : '');
  noBtn.className = 'toggle-btn' + (!value ? ' selected-no' : '');

  if (value) {
    details.classList.remove('hidden');
  } else {
    details.classList.add('hidden');
    document.getElementById('kidInfo').value = '';
  }
}

// ── FORMAT PHONE NUMBER ───────────────────────────────────
// Auto-format phone input as (555) 555-5555

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
}

// ── FORMAT DATE ───────────────────────────────────────────

function formatDate(isoString) {
  const d = new Date(isoString);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = String(d.getFullYear()).slice(2);
  return `${month}/${day}/${year}`;
}

// ── GET INITIALS ──────────────────────────────────────────

function getInitials(name) {
  return name.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── SAVE / UPDATE ENTRY ───────────────────────────────────

function handleSave(event) {
  event.preventDefault();

  const editId = document.getElementById('editId').value;
  const name = document.getElementById('personName').value.trim();
  const phone = document.getElementById('phoneNumber').value.trim();
  const clipper = document.getElementById('clipperType').value.trim();
  const talked = document.getElementById('talkAbout').value.trim();
  const location = document.getElementById('location').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const petKind = document.getElementById('petKind').value.trim();
  const kidInfo = document.getElementById('kidInfo').value.trim();

  if (!name) return; // Name is required

  const clients = loadClients();
  const now = new Date().toISOString();

  if (editId) {
    // Updating an existing entry
    const index = clients.findIndex(c => c.id === editId);
    if (index !== -1) {
      clients[index] = {
        ...clients[index],
        name,
        phone,
        location,
        clipper,
        talked,
        hasPets,
        petKind: hasPets ? petKind : '',
        hasKids,
        kidInfo: hasKids ? kidInfo : '',
        notes,
        editedAt: now
      };
    }
    saveClients(clients);
    showToast('Updated!');
  } else {
    // Creating a new entry
    const newClient = {
      id: generateId(),
      name,
      phone,
      location,
      clipper,
      talked,
      hasPets,
      petKind: hasPets ? petKind : '',
      hasKids,
      kidInfo: hasKids ? kidInfo : '',
      notes,
      createdAt: now,
      editedAt: null
    };
    clients.unshift(newClient); // Add to top of list
    saveClients(clients);
    showToast('Saved!');
  }

  clearForm();
}

// ── CLEAR FORM ────────────────────────────────────────────

function clearForm() {
  document.getElementById('editId').value = '';
  document.getElementById('personName').value = '';
  document.getElementById('phoneNumber').value = '';
  document.getElementById('clipperType').value = '';
  document.getElementById('talkAbout').value = '';
  document.getElementById('petKind').value = '';
  document.getElementById('kidInfo').value = '';
  document.getElementById('location').value = '';
  document.getElementById('notes').value = '';

  // Reset toggles
  hasPets = null;
  hasKids = null;
  document.getElementById('petsYes').className = 'toggle-btn';
  document.getElementById('petsNo').className = 'toggle-btn';
  document.getElementById('kidsYes').className = 'toggle-btn';
  document.getElementById('kidsNo').className = 'toggle-btn';
  document.getElementById('petDetails').classList.add('hidden');
  document.getElementById('kidDetails').classList.add('hidden');

  // Reset save button back to normal
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.innerHTML = '<i class="fas fa-check"></i> Save';
  saveBtn.classList.remove('editing');

  // Update header back to default
  document.querySelector('#screen-add .screen-header h1').innerHTML =
    '<i class="fas fa-scissors"></i> FreshCut Recall';
  document.querySelector('#screen-add .tagline').textContent =
    "Quick — who'd you just meet?";
}

// ── RENDER CLIENT LIST ────────────────────────────────────
// Search + date filter live in state so every re-render
// (tab switch, delete, save) keeps what you were looking at.

let searchQuery = '';   // what's typed in the search box
let filterDay = null;   // 'YYYY-M-D' when a calendar day is picked
let calView = null;     // first day of the month the calendar shows

// Fields a keyword can match, in the order a match is shown on the card
const SEARCH_FIELDS = [
  ['talked', 'Conversation'],
  ['petKind', 'Pets'],
  ['kidInfo', 'Kids'],
  ['notes', 'Notes'],
  ['location', 'Location'],
  ['clipper', 'Hair'],
  ['name', ''],
  ['phone', '']
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// A calendar day as a plain key, in local time
function dayKey(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Which fields contain one search word (phone matches on digits only)
function fieldsMatching(client, word) {
  const hits = SEARCH_FIELDS
    .filter(([key]) => client[key] && String(client[key]).toLowerCase().includes(word))
    .map(([key]) => key);
  const digits = word.replace(/\D/g, '');
  if (digits.length >= 3 && client.phone && client.phone.replace(/\D/g, '').includes(digits) && !hits.includes('phone')) {
    hits.push('phone');
  }
  return hits;
}

// Every word must appear somewhere (any order). Returns the matched fields, or null.
function matchClient(client, words) {
  const found = new Set();
  for (const word of words) {
    const hits = fieldsMatching(client, word);
    if (hits.length === 0) return null;
    hits.forEach(h => found.add(h));
  }
  return found;
}

// Wrap each search word in <mark> (text is escaped first)
function highlight(text, words) {
  let out = escapeHtml(text);
  words.forEach(w => {
    const safe = escapeHtml(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(${safe})`, 'ig'), '<mark>$1</mark>');
  });
  return out;
}

function renderClientList() {
  const clients = loadClients();
  const listEl = document.getElementById('clientList');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('clientCount');
  const words = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

  // Filter by picked day (added OR edited that day), then by keywords
  const rows = [];
  clients.forEach(c => {
    if (filterDay) {
      const onDay = (c.createdAt && dayKey(c.createdAt) === filterDay) ||
                    (c.editedAt && dayKey(c.editedAt) === filterDay);
      if (!onDay) return;
    }
    const found = words.length ? matchClient(c, words) : new Set();
    if (found) rows.push({ client: c, found });
  });

  // Update count
  const total = clients.length;
  const showing = rows.length;
  if (filterDay) {
    const [, m, d] = filterDay.split('-').map(Number);
    countEl.innerHTML = `${showing} of ${total} on ${MONTH_NAMES[m - 1].slice(0, 3)} ${d}` +
      `<button type="button" class="clear-link" onclick="clearDateFilter()">Clear date</button>`;
  } else if (words.length && showing !== total) {
    countEl.textContent = `${showing} of ${total} people`;
  } else {
    countEl.textContent = `${total} ${total === 1 ? 'person' : 'people'} saved`;
  }
  document.getElementById('calBtn').classList.toggle('on', !!filterDay);

  // Show empty state or list
  if (clients.length === 0) {
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';

  if (rows.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No matches found${filterDay ? ' on that day' : ''}</p>
      </div>
    `;
    return;
  }

  // Build client cards
  listEl.innerHTML = rows.map(({ client, found }) => {
    const initials = getInitials(client.name);
    const lastDate = formatDate(client.editedAt || client.createdAt);

    // When a keyword hits a detail field, show that field instead of the usual preview
    let preview = escapeHtml(client.clipper || client.talked || 'Tap to view');
    let snippet = false;
    if (words.length) {
      const hit = SEARCH_FIELDS.find(([key, label]) => label && found.has(key));
      if (hit) {
        preview = `<span class="fld">${hit[1]}</span>${highlight(client[hit[0]], words)}`;
        snippet = true;
      }
    }
    const nameHtml = words.length && found.has('name') ? highlight(client.name, words) : escapeHtml(client.name);

    return `
      <div class="client-card" onclick="openProfile('${client.id}')">
        <div class="client-avatar">${initials}</div>
        <div class="client-info">
          <div class="client-name">${nameHtml}</div>
          <div class="client-preview${snippet ? ' snip' : ''}">${preview}</div>
        </div>
        <div class="client-date">${lastDate}</div>
      </div>
    `;
  }).join('');
}

// ── SEARCH / FILTER ───────────────────────────────────────

function filterClients() {
  searchQuery = document.getElementById('searchInput').value;
  renderClientList();
}

// ── DATE PICKER ───────────────────────────────────────────
// Calendar icon in the search box. Teal dots mark days with entries.

function toggleCalendar(open) {
  const cal = document.getElementById('calendar');
  const btn = document.getElementById('calBtn');
  const willOpen = typeof open === 'boolean' ? open : cal.classList.contains('hidden');
  if (willOpen) {
    if (!calView) {
      const now = new Date();
      calView = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    renderCalendar();
  }
  cal.classList.toggle('hidden', !willOpen);
  btn.setAttribute('aria-expanded', willOpen);
}

function renderCalendar() {
  const cal = document.getElementById('calendar');
  const y = calView.getFullYear();
  const m = calView.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  // Days that have an entry added or edited
  const withEntries = new Set();
  loadClients().forEach(c => {
    if (c.createdAt) withEntries.add(dayKey(c.createdAt));
    if (c.editedAt) withEntries.add(dayKey(c.editedAt));
  });

  let cells = ['S','M','T','W','T','F','S'].map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < firstWeekday; i++) cells += '<span class="cal-day blank"></span>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${m + 1}-${d}`;
    const cls = ['cal-day',
      withEntries.has(key) ? 'has' : '',
      filterDay === key ? 'sel' : '',
      (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) ? 'today' : ''
    ].filter(Boolean).join(' ');
    cells += `<button type="button" class="${cls}" onclick="pickDay('${key}')" aria-label="${MONTH_NAMES[m]} ${d}">${d}</button>`;
  }

  cal.innerHTML = `
    <div class="cal-head">
      <button type="button" class="cal-nav" onclick="calNav(-1)" aria-label="Previous month"><i class="fas fa-chevron-left"></i></button>
      <div class="cal-title">${MONTH_NAMES[m]} ${y}</div>
      <button type="button" class="cal-nav" onclick="calNav(1)" aria-label="Next month"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-foot">
      <span><span class="cal-dot"></span> days with entries</span>
      ${filterDay ? '<button type="button" class="clear-link" onclick="clearDateFilter()">Clear date</button>' : ''}
    </div>
  `;
}

function calNav(step) {
  calView = new Date(calView.getFullYear(), calView.getMonth() + step, 1);
  renderCalendar();
}

function pickDay(key) {
  filterDay = filterDay === key ? null : key;   // tap the same day again to clear
  toggleCalendar(false);
  renderClientList();
}

function clearDateFilter() {
  filterDay = null;
  renderClientList();
  if (!document.getElementById('calendar').classList.contains('hidden')) renderCalendar();
}

// Close the calendar when tapping anywhere outside it
document.addEventListener('click', function(e) {
  const cal = document.getElementById('calendar');
  if (cal.classList.contains('hidden')) return;
  if (!document.contains(e.target)) return;   // tapped a button the calendar just redrew
  if (e.target.closest('#calendar') || e.target.closest('#calBtn')) return;
  toggleCalendar(false);
});

// ── PROFILE MODAL ─────────────────────────────────────────

function openProfile(clientId) {
  const clients = loadClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return;

  const modal = document.getElementById('profileModal');
  const content = document.getElementById('profileContent');

  // Build date string
  let dateStr = `Added ${formatDate(client.createdAt)}`;
  if (client.editedAt) {
    dateStr += `, edited on ${formatDate(client.editedAt)}`;
  }

  // Build profile fields
  const fields = [
    { label: 'Phone Number', value: client.phone, icon: 'fa-phone' },
    { label: 'Location', value: client.location, icon: 'fa-location-dot' },
    { label: 'Hair Type / Clipper Guard', value: client.clipper, icon: 'fa-ruler' },
    { label: 'Conversation', value: client.talked, icon: 'fa-comments' },
    {
      label: 'Pets',
      value: client.hasPets === true
        ? (client.petKind || 'Yes')
        : client.hasPets === false
          ? 'No'
          : null,
      icon: 'fa-paw'
    },
    {
      label: 'Kids',
      value: client.hasKids === true
        ? (client.kidInfo || 'Yes')
        : client.hasKids === false
          ? 'No'
          : null,
      icon: 'fa-child'
    },
    { label: 'Notes', value: client.notes, icon: 'fa-note-sticky' }
  ];

  const fieldsHtml = fields.map(f => {
    const val = f.value
      ? `<div class="profile-field-value">${escapeHtml(f.value)}</div>`
      : `<div class="profile-field-value empty">Not recorded</div>`;
    return `
      <div class="profile-field">
        <div class="profile-field-label"><i class="fas ${f.icon}"></i> ${f.label}</div>
        ${val}
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${getInitials(client.name)}</div>
      <div class="profile-name">${escapeHtml(client.name)}</div>
      <div class="profile-date">${dateStr}</div>
    </div>
    <div class="profile-fields">
      ${fieldsHtml}
    </div>
    <div class="profile-actions">
      <button class="btn-edit" onclick="editClient('${client.id}')">
        <i class="fas fa-pen"></i> Edit
      </button>
      <button class="btn-delete" onclick="confirmDelete('${client.id}')">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeProfile() {
  document.getElementById('profileModal').classList.add('hidden');
}

// Close modal on overlay click (not card click)
document.getElementById('profileModal').addEventListener('click', function(e) {
  if (e.target === this) closeProfile();
});

// ── EDIT CLIENT ───────────────────────────────────────────
// Loads a client's data into the add form for editing

function editClient(clientId) {
  const clients = loadClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return;

  closeProfile();

  // Switch to add tab
  switchTab('add');

  // Fill the form with existing data
  document.getElementById('editId').value = client.id;
  document.getElementById('personName').value = client.name;
  document.getElementById('phoneNumber').value = client.phone || '';
  document.getElementById('clipperType').value = client.clipper || '';
  document.getElementById('talkAbout').value = client.talked || '';
  document.getElementById('location').value = client.location || '';
  document.getElementById('notes').value = client.notes || '';

  // Set pet toggle
  if (client.hasPets === true) {
    togglePets(true);
    document.getElementById('petKind').value = client.petKind || '';
  } else if (client.hasPets === false) {
    togglePets(false);
  }

  // Set kid toggle
  if (client.hasKids === true) {
    toggleKids(true);
    document.getElementById('kidInfo').value = client.kidInfo || '';
  } else if (client.hasKids === false) {
    toggleKids(false);
  }

  // Update button to show we're editing
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.innerHTML = '<i class="fas fa-pen"></i> Update';
  saveBtn.classList.add('editing');

  // Update header to show editing state
  document.querySelector('#screen-add .screen-header h1').innerHTML =
    `<i class="fas fa-pen"></i> Editing ${escapeHtml(client.name.split(' ')[0])}`;
  document.querySelector('#screen-add .tagline').textContent =
    'Update their info below';

  // Scroll to top so they see the form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── DELETE CLIENT ─────────────────────────────────────────

function confirmDelete(clientId) {
  const actionsEl = document.querySelector('.profile-actions');
  actionsEl.innerHTML = `
    <div class="confirm-delete">
      <p>Delete this person? This can't be undone.</p>
      <div class="btn-row">
        <button class="btn-confirm-delete" onclick="deleteClient('${clientId}')">
          <i class="fas fa-trash"></i> Yes, delete
        </button>
        <button class="btn-cancel-delete" onclick="openProfile('${clientId}')">
          Cancel
        </button>
      </div>
    </div>
  `;
}

function deleteClient(clientId) {
  let clients = loadClients();
  clients = clients.filter(c => c.id !== clientId);
  saveClients(clients);
  closeProfile();
  renderClientList();
  showToast('Deleted');
}

// ── TOAST NOTIFICATION ────────────────────────────────────

function showToast(message) {
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}

// ── UTILITY ───────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── PHONE NUMBER AUTO-FORMAT ──────────────────────────────

document.getElementById('phoneNumber').addEventListener('input', function(e) {
  const formatted = formatPhoneNumber(this.value);
  this.value = formatted;
});

// ── EXPORT TO CSV ─────────────────────────────────────────
// Safety net — lets you download all your data as a spreadsheet

function exportToCSV() {
  const clients = loadClients();
  if (clients.length === 0) {
    showToast('No data to export');
    return;
  }

  const headers = ['Name', 'Phone', 'Location', 'Hair Type/Clipper Guard', 'Conversation', 'Pets', 'Pet Kind', 'Kids', 'Kid Info', 'Notes', 'Date Added', 'Date Edited'];
  const rows = clients.map(c => [
    c.name,
    c.phone || '',
    c.location || '',
    c.clipper || '',
    c.talked || '',
    c.hasPets === true ? 'Yes' : c.hasPets === false ? 'No' : '',
    c.petKind || '',
    c.hasKids === true ? 'Yes' : c.hasKids === false ? 'No' : '',
    c.kidInfo || '',
    c.notes || '',
    c.createdAt ? formatDate(c.createdAt) : '',
    c.editedAt ? formatDate(c.editedAt) : ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `freshcut-recall-backup-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported!');
}

// ── INIT ──────────────────────────────────────────────────
// App starts on the "Add" screen — ready to capture fast

document.addEventListener('DOMContentLoaded', function() {
  // Nothing to init — the add form is already showing
  // Client list renders when they switch to that tab
});