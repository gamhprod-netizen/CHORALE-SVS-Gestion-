// ════════════════════════════════════════════════════════════════
// DISCIPLINE — Présences Samedis & Dimanches + Alertes + Sanctions
// ════════════════════════════════════════════════════════════════

const DisciplineModule = {
  tab: 'pointage', // pointage | stats | sanctions

  render(main) {
    const tabs = [
      { key: 'pointage', label: '✅ Pointage' },
      { key: 'stats', label: '📊 Statistiques' },
      { key: 'sanctions', label: '💸 Sanctions' },
    ];

    main.innerHTML = `
      <div class="tabbar">
        ${tabs.map(t => `<button class="tab-btn ${this.tab===t.key?'active':''}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="discipline-content"></div>
    `;

    main.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tab = btn.dataset.tab;
        this.render(main);
      });
    });

    const content = main.querySelector('#discipline-content');
    if (this.tab === 'pointage') this.renderPointage(content);
    else if (this.tab === 'stats') this.renderStats(content);
    else this.renderSanctions(content, main);
  },

  // ── POINTAGE ──
  renderPointage(container) {
    const seances = Store.getSeances();
    container.innerHTML = `
      <div class="card">
        <div class="section-title" style="margin-top:0;"><span class="ornament">📝</span> Nouvelle séance</div>
        <div class="field-row">
          <div class="field">
            <label>Type de séance</label>
            <select id="new-type">
              <option value="samedi">🎹 Répétition Samedi</option>
              <option value="dimanche">⛪ Culte Dimanche</option>
            </select>
          </div>
          <div class="field">
            <label>Date</label>
            <input type="date" id="new-date" value="${Utils.todayISO()}">
          </div>
        </div>
        <button class="btn primary block" id="start-seance">Pointer cette séance</button>
      </div>

      <div class="section-title"><span class="ornament">📋</span> Séances enregistrées</div>
      <div id="seance-list"></div>
    `;

    container.querySelector('#start-seance').addEventListener('click', () => {
      const type = container.querySelector('#new-type').value;
      const date = container.querySelector('#new-date').value;
      if (!date) { Utils.toast('Veuillez choisir une date'); return; }

      // Check if seance exists for that date+type
      let existing = Store.data.seances.find(s => s.date === date && s.type === type);
      if (!existing) {
        existing = {
          id: Utils.genId('seance'),
          date, type,
          presences: {},
        };
        // Pre-fill all members with '—'
        Store.data.membres.forEach(m => { existing.presences[m.id] = '—'; });
        Store.upsertSeance(existing);
      }
      this.openPointageSheet(existing.id);
    });

    this.renderSeanceList(container.querySelector('#seance-list'), seances);
  },

  renderSeanceList(container, seances) {
    if (!seances.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📋</div><div class="empty-state__text">Aucune séance enregistrée</div></div>`;
      return;
    }
    container.innerHTML = `<div class="list">${seances.slice(0, 20).map(s => {
      const icon = s.type === 'samedi' ? '🎹' : '⛪';
      const label = s.type === 'samedi' ? 'Répétition Samedi' : 'Culte Dimanche';
      const total = Object.keys(s.presences).length;
      const present = Object.values(s.presences).filter(p=>p==='Présent').length;
      return `
        <div class="list-row" data-id="${s.id}">
          <div class="list-row__avatar">${icon}</div>
          <div class="list-row__body">
            <div class="list-row__title">${label}</div>
            <div class="list-row__subtitle">${Utils.fmtDate(s.date)}</div>
          </div>
          <div class="list-row__meta">
            <span class="pill actif">${present}/${total}</span>
          </div>
          <span class="list-row__chevron">›</span>
        </div>
      `;
    }).join('')}</div>`;

    container.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => this.openPointageSheet(row.dataset.id));
    });
  },

  openPointageSheet(seanceId) {
    const seance = Store.getSeance(seanceId);
    if (!seance) return;
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));
    const label = seance.type === 'samedi' ? '🎹 Répétition Samedi' : '⛪ Culte Dimanche';

    const html = `
      <div class="text-sm text-muted mb-8" style="margin-bottom:10px;">${Utils.fmtDateLong(seance.date)}</div>
      <div class="card" style="padding:10px;">
        <div class="flex-between" style="margin-bottom:6px;">
          <span class="text-sm" style="font-weight:700;">Marquer tous :</span>
          <div style="display:flex;gap:6px;">
            <button class="btn sm sage" data-bulk="Présent">Présents</button>
            <button class="btn sm secondary" data-bulk="—">Effacer</button>
          </div>
        </div>
      </div>
      <div class="list" style="margin-top:8px;">
        ${membres.map(m => {
          const st = seance.presences[m.id] || '—';
          return `
            <div class="list-row" style="cursor:default;">
              <div class="list-row__avatar">${Utils.initials(m.nom)}</div>
              <div class="list-row__body">
                <div class="list-row__title">${Utils.escapeHtml(m.nom)}</div>
                <div class="list-row__subtitle">${m.statut}</div>
              </div>
              <select class="status-select ${Utils.statusClass(st)}" data-member="${m.id}" style="max-width:130px;">
                ${['—'].concat(Utils.STATUTS_PRESENCE).map(s => `<option value="${s}" ${st===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
          `;
        }).join('')}
      </div>
      <div class="grid-2 mt-16">
        <button class="btn danger block" id="delete-seance">🗑️ Supprimer séance</button>
        <button class="btn primary block" id="close-pointage">✅ Terminé</button>
      </div>
    `;

    const sheet = Utils.openSheet(label, html);

    sheet.querySelectorAll('[data-member]').forEach(sel => {
      sel.addEventListener('change', () => {
        const mid = sel.dataset.member;
        seance.presences[mid] = sel.value;
        sel.className = 'status-select ' + Utils.statusClass(sel.value);
        Store.upsertSeance(seance);
      });
    });

    sheet.querySelectorAll('[data-bulk]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.bulk;
        membres.forEach(m => { seance.presences[m.id] = val; });
        Store.upsertSeance(seance);
        Utils.closeSheet();
        this.openPointageSheet(seanceId);
      });
    });

    sheet.querySelector('#delete-seance').addEventListener('click', () => {
      Utils.confirmAction('Supprimer cette séance et toutes ses présences ?', () => {
        Store.deleteSeance(seanceId);
        Utils.closeSheet();
        Utils.toast('Séance supprimée');
        Router.render();
      });
    });

    sheet.querySelector('#close-pointage').addEventListener('click', () => {
      Utils.closeSheet();
      Router.render();
    });
  },

  // ── STATISTIQUES ──
  renderStats(container) {
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));

    container.innerHTML = `
      <div class="scroll-table">
        <table>
          <thead>
            <tr>
              <th>Membre</th>
              <th>Tx Sam.</th>
              <th>Tx Dim.</th>
              <th>Abs.NJ</th>
              <th>Consec.</th>
              <th>Prestation</th>
            </tr>
          </thead>
          <tbody>
            ${membres.map(m => {
              const dis = Store.getDisciplineStats(m.id);
              const txSamColor = dis.txSamedi>=0.8?'var(--green)':dis.txSamedi>=0.6?'var(--amber)':'var(--red)';
              const txDimColor = dis.txDimanche>=0.8?'var(--green)':dis.txDimanche>=0.6?'var(--amber)':'var(--red)';
              return `
                <tr>
                  <td>${Utils.escapeHtml(m.nom)}</td>
                  <td style="color:${txSamColor};font-weight:700;">${Utils.pct(dis.txSamedi)}</td>
                  <td style="color:${txDimColor};font-weight:700;">${Utils.pct(dis.txDimanche)}</td>
                  <td>${dis.absNJ}</td>
                  <td style="font-weight:700;color:${dis.currentStreak>=2?'var(--red)':'inherit'};">${dis.currentStreak}</td>
                  <td>${dis.interdit ? '<span class="pill suspendu">⛔</span>' : '<span class="pill actif">✅</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-sm text-muted mt-16" style="text-align:center;">
        ℹ️ Règle d'alerte : 2 absences consécutives (justifiées ou non) au samedi → interdiction de prester. Une présence réinitialise le compteur.
      </div>
    `;
  },

  // ── SANCTIONS ──
  renderSanctions(container, main) {
    const sanctions = Store.getSanctions();
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));

    const totalPaye = sanctions.filter(s=>s.statut==='Payé').reduce((sum,s)=>sum+Number(s.montant||0),0);

    container.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <span class="text-sm text-muted">Total sanctions payées</span>
          <span class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--maroon);">${Utils.fmtFCFA(totalPaye)}</span>
        </div>
      </div>
      <div id="sanction-list"></div>
    `;

    this.renderSanctionList(container.querySelector('#sanction-list'), sanctions);

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-sanction';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openSanctionForm(membres));
  },

  renderSanctionList(container, sanctions) {
    if (!sanctions.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">💸</div><div class="empty-state__text">Aucune sanction enregistrée</div></div>`;
      return;
    }
    container.innerHTML = `<div class="list">${sanctions.map(s => {
      const statusClass = s.statut === 'Payé' ? 'actif' : s.statut === 'Annulé' ? 'suspendu' : 'bureau';
      return `
        <div class="list-row" data-id="${s.id}">
          <div class="list-row__avatar">💸</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(s.membre)}</div>
            <div class="list-row__subtitle">${s.motif} · ${Utils.fmtDate(s.date)}</div>
          </div>
          <div class="list-row__meta">
            <div style="font-weight:700;">${Utils.fmtFCFA(s.montant)}</div>
            <span class="pill ${statusClass}">${s.statut}</span>
          </div>
        </div>
      `;
    }).join('')}</div>`;

    container.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => this.openSanctionDetail(row.dataset.id));
    });
  },

  openSanctionDetail(id) {
    const s = Store.data.sanctions.find(x=>x.id===id);
    if (!s) return;
    const html = `
      <div class="field">
        <label>Statut</label>
        <select id="s-statut">
          ${['En attente','Payé','Annulé'].map(st => `<option value="${st}" ${s.statut===st?'selected':''}>${st}</option>`).join('')}
        </select>
      </div>
      <div class="grid-2 mt-16">
        <button class="btn danger block" id="del-sanction">🗑️ Supprimer</button>
        <button class="btn primary block" id="save-sanction">💾 Enregistrer</button>
      </div>
    `;
    const sheet = Utils.openSheet(`${s.membre} — ${Utils.fmtFCFA(s.montant)}`, html);
    sheet.querySelector('#save-sanction').addEventListener('click', () => {
      Store.updateSanction(id, { statut: sheet.querySelector('#s-statut').value });
      Utils.closeSheet();
      Utils.toast('Sanction mise à jour');
      Router.render();
    });
    sheet.querySelector('#del-sanction').addEventListener('click', () => {
      Utils.confirmAction('Supprimer cette sanction ?', () => {
        Store.deleteSanction(id);
        Utils.closeSheet();
        Utils.toast('Sanction supprimée');
        Router.render();
      });
    });
  },

  openSanctionForm(membres) {
    const html = `
      <div class="field">
        <label>Membre</label>
        <select id="sf-membre">
          ${membres.map(m => `<option value="${Utils.escapeHtml(m.nom)}">${Utils.escapeHtml(m.nom)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Date</label>
        <input type="date" id="sf-date" value="${Utils.todayISO()}">
      </div>
      <div class="field">
        <label>Motif</label>
        <select id="sf-motif">
          <option>Absence NJ</option>
          <option>Retard NJ</option>
          <option>Comportement</option>
          <option>Autre</option>
        </select>
      </div>
      <div class="field">
        <label>Montant (FCFA)</label>
        <input type="number" id="sf-montant" value="500" min="0" step="50">
      </div>
      <button class="btn primary block" id="save-new-sanction">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet('Nouvelle sanction', html);
    sheet.querySelector('#save-new-sanction').addEventListener('click', () => {
      Store.addSanction({
        id: Utils.genId('sanc'),
        membre: sheet.querySelector('#sf-membre').value,
        date: sheet.querySelector('#sf-date').value,
        motif: sheet.querySelector('#sf-motif').value,
        montant: Number(sheet.querySelector('#sf-montant').value),
        statut: 'En attente',
      });
      Utils.closeSheet();
      Utils.toast('Sanction ajoutée');
      Router.render();
    });
  },
};
