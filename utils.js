// ════════════════════════════════════════════════════════════════
// UTILS — fonctions partagées
// ════════════════════════════════════════════════════════════════

const Utils = {
  MONTHS: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  STATUTS_PRESENCE: ['Présent','Retard justifié','Retard non justifié','Absence justifiée','Absence non justifiée','Voyage'],
  PUPITRES: ['Soprano','Alto','Ténor','Basse','Baryton','Mezzo-Soprano','Non défini'],

  genId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  },

  fmtFCFA(n) {
    n = Number(n) || 0;
    return n.toLocaleString('fr-FR') + ' FCFA';
  },

  fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
  },

  fmtDateLong(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  },

  todayISO() {
    const d = new Date();
    return d.toISOString().slice(0,10);
  },

  monthKey(date) {
    const d = date ? new Date(date) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  },

  statusClass(status) {
    switch(status) {
      case 'Présent': return 'status-present';
      case 'Retard justifié': return 'status-ret-j';
      case 'Retard non justifié': return 'status-ret-nj';
      case 'Absence justifiée': return 'status-abs-j';
      case 'Absence non justifiée': return 'status-abs-nj';
      case 'Voyage': return 'status-voyage';
      default: return '';
    }
  },

  statusShort(status) {
    switch(status) {
      case 'Présent': return 'P';
      case 'Retard justifié': return 'RJ';
      case 'Retard non justifié': return 'RNJ';
      case 'Absence justifiée': return 'AJ';
      case 'Absence non justifiée': return 'ANJ';
      case 'Voyage': return 'V';
      default: return '—';
    }
  },

  initials(nom) {
    const parts = nom.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  },

  pct(n) {
    return Math.round((n||0) * 100) + '%';
  },

  escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  },

  toast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2700);
  },

  // Show a bottom sheet modal. content = HTML string. Returns the sheet element.
  openSheet(title, contentHTML) {
    this.closeSheet();
    const overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';
    overlay.id = 'active-sheet';
    overlay.innerHTML = `
      <div class="sheet">
        <div class="sheet__handle"></div>
        <div class="sheet__header">
          <div class="sheet__title">${title}</div>
          <button class="sheet__close" data-close-sheet>✕</button>
        </div>
        <div class="sheet__body">${contentHTML}</div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-close-sheet]')) {
        this.closeSheet();
      }
    });
    document.body.appendChild(overlay);
    return overlay;
  },

  closeSheet() {
    const el = document.getElementById('active-sheet');
    if (el) el.remove();
  },

  confirmAction(msg, onConfirm) {
    const html = `
      <p class="text-sm mt-8" style="margin-bottom:18px;">${msg}</p>
      <div class="grid-2">
        <button class="btn secondary block" data-close-sheet>Annuler</button>
        <button class="btn danger block" id="confirm-yes">Confirmer</button>
      </div>
    `;
    const sheet = this.openSheet('⚠️ Confirmation', html);
    sheet.querySelector('#confirm-yes').addEventListener('click', () => {
      this.closeSheet();
      onConfirm();
    });
  },
};
