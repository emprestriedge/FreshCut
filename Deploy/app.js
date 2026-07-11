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
        clipper,
        talked,
        hasPets,
        petKind: hasPets ? petKind : '',
        hasKids,
        kidInfo: hasKids ? kidInfo : '',
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
      clipper,
      talked,
      hasPets,
      petKind: hasPets ? petKind : '',
      hasKids,
      kidInfo: hasKids ? kidInfo : '',
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

function renderClientList(filter = '') {
  const clients = loadClients();
  const listEl = document.getElementById('clientList');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('clientCount');
  const search = filter.toLowerCase().trim();

  // Filter clients by name or phone
  const filtered = search
    ? clients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        (c.phone && c.phone.replace(/\D/g, '').includes(search.replace(/\D/g, '')))
      )
    : clients;

  // Update count
  const total = clients.length;
  const showing = filtered.length;
  if (search && showing !== total) {
    countEl.textContent = `${showing} of ${total} people`;
  } else {
    countEl.textContent = `${total} ${total === 1 ? 'person' : 'people'} saved`;
  }

  // Show empty state or list
  if (clients.length === 0) {
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No matches found</p>
      </div>
    `;
    return;
  }

  // Build client cards
  listEl.innerHTML = filtered.map(client => {
    const initials = getInitials(client.name);
    const preview = client.clipper || client.talked || 'Tap to view';
    const lastDate = formatDate(client.editedAt || client.createdAt);
    return `
      <div class="client-card" onclick="openProfile('${client.id}')">
        <div class="client-avatar">${initials}</div>
        <div class="client-info">
          <div class="client-name">${escapeHtml(client.name)}</div>
          <div class="client-preview">${escapeHtml(preview)}</div>
        </div>
        <div class="client-date">${lastDate}</div>
      </div>
    `;
  }).join('');
}

// ── SEARCH / FILTER ───────────────────────────────────────

function filterClients() {
  const query = document.getElementById('searchInput').value;
  renderClientList(query);
}

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
    { label: 'Phone', value: client.phone, icon: 'fa-phone' },
    { label: 'Clipper / Hair Type', value: client.clipper, icon: 'fa-ruler' },
    { label: 'Talked About', value: client.talked, icon: 'fa-comments' },
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
    }
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

  const headers = ['Name', 'Phone', 'Clipper/Hair Type', 'Talked About', 'Pets', 'Pet Kind', 'Kids', 'Kid Info', 'Date Added', 'Date Edited'];
  const rows = clients.map(c => [
    c.name,
    c.phone || '',
    c.clipper || '',
    c.talked || '',
    c.hasPets === true ? 'Yes' : c.hasPets === false ? 'No' : '',
    c.petKind || '',
    c.hasKids === true ? 'Yes' : c.hasKids === false ? 'No' : '',
    c.kidInfo || '',
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