// ════════════════════════════════════════════════════════════════
// MEMBRES — Base de données centrale
// ════════════════════════════════════════════════════════════════

const MembresModule = {
  filter: { statut: '', search: '' },

  render(main) {
    const tabs = [
      { key: '', label: 'Tous' },
      { key: 'Bureau', label: 'Bureau' },
      { key: 'Choriste', label: 'Choristes' },
      { key: 'Intégrant', label: 'Intégrants' },
    ];

    main.innerHTML = `
      <div class="search-bar">
        <span class="search-bar__icon">🔍</span>
        <input type="text" placeholder="Rechercher un membre..." id="member-search" value="${Utils.escapeHtml(this.filter.search)}">
      </div>
      <div class="tabbar">
        ${tabs.map(t => `<button class="tab-btn ${this.filter.statut===t.key?'active':''}" data-statut="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="member-list"></div>
    `;

    main.querySelectorAll('[data-statut]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter.statut = btn.dataset.statut;
        this.render(main);
      });
    });

    main.querySelector('#member-search').addEventListener('input', (e) => {
      this.filter.search = e.target.value;
      this.renderList(main.querySelector('#member-list'));
    });

    this.renderList(main.querySelector('#member-list'));

    // FAB
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-member';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openMemberForm());
  },

  renderList(container) {
    const list = Store.getMembres({
      statut: this.filter.statut || undefined,
      search: this.filter.search || undefined,
    }).sort((a,b) => a.nom.localeCompare(b.nom));

    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__text">Aucun membre trouvé</div></div>`;
      return;
    }

    container.innerHTML = `<div class="list">${list.map(m => {
      const pillClass = m.statut === 'Bureau' ? 'bureau' : m.statut === 'Intégrant' ? 'integrant' : 'choriste';
      const anniv = Store.getAnniversaireInfo(m);
      const annivBadge = anniv && anniv.isToday ? ' 🎂' : '';
      return `
        <div class="list-row" data-id="${m.id}">
          <div class="list-row__avatar">${Utils.initials(m.nom)}</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(m.nom)}${annivBadge}</div>
            <div class="list-row__subtitle">${m.fonction || m.pupitre || '—'}</div>
          </div>
          <div class="list-row__meta">
            <span class="pill ${pillClass}">${m.statut}</span>
          </div>
          <span class="list-row__chevron">›</span>
        </div>
      `;
    }).join('')}</div>`;

    container.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => this.openMemberDetail(row.dataset.id));
    });
  },

  openMemberDetail(id) {
    const m = Store.getMembre(id);
    if (!m) return;
    const igi = m.statut === 'Choriste' ? Store.calcIGI(id) : null;
    const dis = Store.getDisciplineStats(id);
    const anniv = Store.getAnniversaireInfo(m);

    const html = `
      <div class="card" style="text-align:center;">
        <div class="list-row__avatar" style="width:60px;height:60px;font-size:1.4rem;margin:0 auto 8px;">${Utils.initials(m.nom)}</div>
        <div class="font-display" style="font-size:1.3rem;font-weight:700;">${Utils.escapeHtml(m.nom)}</div>
        <div class="text-muted text-sm">${m.fonction || '—'} ${m.pupitre ? '· '+m.pupitre : ''}</div>
        <div class="mt-8"><span class="pill ${m.statut==='Bureau'?'bureau':m.statut==='Intégrant'?'integrant':'choriste'}">${m.statut}</span> <span class="pill actif">${m.situation}</span></div>
      </div>

      <div class="grid-2">
        <div class="card center">
          <div class="text-sm text-muted">Tx Présence Sam.</div>
          <div class="font-display" style="font-size:1.4rem;font-weight:700;color:${dis.txSamedi>=0.8?'var(--green)':'var(--red)'};">${Utils.pct(dis.txSamedi)}</div>
        </div>
        <div class="card center">
          <div class="text-sm text-muted">Tx Présence Dim.</div>
          <div class="font-display" style="font-size:1.4rem;font-weight:700;color:${dis.txDimanche>=0.8?'var(--green)':'var(--red)'};">${Utils.pct(dis.txDimanche)}</div>
        </div>
      </div>

      ${dis.interdit ? `
        <div class="alert-banner danger">
          <div class="alert-banner__icon">⛔</div>
          <div><b>Non autorisé à prester</b> — ${dis.currentStreak} absences consécutives au samedi.</div>
        </div>` : ''}

      ${igi ? `
        <div class="card">
          <div class="flex-between">
            <span class="text-sm text-muted">Indice Global d'Implication</span>
            <span class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--maroon);">${igi.igi}/100</span>
          </div>
          <div class="progress mt-8"><div class="progress__fill" style="width:${igi.igi}%;background:var(--gold);"></div></div>
          <div class="mt-8"><span class="pill ${igi.categorie.includes('Exemplaire')||igi.categorie.includes('impliqué')&&!igi.categorie.includes('Peu')?'exemplaire':igi.categorie.includes('accompagner')?'accompagner':'actif'}">${igi.categorie}</span></div>
        </div>` : ''}

      ${anniv ? `
        <div class="card">
          <div class="flex-between">
            <span class="text-sm text-muted">🎂 Anniversaire</span>
            <span style="font-weight:700;">${Utils.fmtDate(m.dateNaissance)} (${anniv.age} ans)</span>
          </div>
          <div class="text-sm text-muted mt-8">${anniv.isToday ? "🎉 C'est aujourd'hui !" : `Dans ${anniv.daysRemaining} jour(s)`}</div>
        </div>` : ''}

      <div class="section-title"><span class="ornament">ℹ️</span> Informations</div>
      <div class="card">
        ${this.infoRow('Identifiant', m.id)}
        ${this.infoRow('Sexe', m.sexe === 'M' ? 'Masculin' : 'Féminin')}
        ${this.infoRow('Téléphone', m.telephone || '—')}
        ${this.infoRow('Adresse', m.adresse || '—')}
        ${this.infoRow('Email', m.email || '—')}
        ${this.infoRow("Date d'entrée", Utils.fmtDate(m.dateEntree))}
        ${this.infoRow('Cotisation/mois', Utils.fmtFCFA(Store.getCotisationDue(m)))}
        ${m.observations ? this.infoRow('Observations', m.observations) : ''}
      </div>

      <div class="grid-2 mt-16">
        <button class="btn secondary block" id="edit-member">✏️ Modifier</button>
        <button class="btn danger block" id="delete-member">🗑️ Supprimer</button>
      </div>
    `;

    const sheet = Utils.openSheet(`👤 ${m.nom}`, html);
    sheet.querySelector('#edit-member').addEventListener('click', () => {
      Utils.closeSheet();
      this.openMemberForm(m);
    });
    sheet.querySelector('#delete-member').addEventListener('click', () => {
      Utils.confirmAction(`Supprimer définitivement <b>${Utils.escapeHtml(m.nom)}</b> de la base de données ?`, () => {
        Store.deleteMembre(id);
        Utils.toast('Membre supprimé');
        Router.render();
      });
    });
  },

  infoRow(label, value) {
    return `<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--line);"><span class="text-sm text-muted">${label}</span><span class="text-sm" style="font-weight:600;text-align:right;max-width:60%;">${Utils.escapeHtml(value)}</span></div>`;
  },

  openMemberForm(membre) {
    const isEdit = !!membre;
    const m = membre || { id:'', nom:'', prenom:'', sexe:'F', dateNaissance:'', telephone:'', adresse:'', pupitre:'', fonction:'', statut:'Choriste', dateEntree: Utils.todayISO(), situation:'Actif', email:'', observations:'' };

    const html = `
      <div class="field">
        <label>Nom complet *</label>
        <input type="text" id="f-nom" value="${Utils.escapeHtml(m.nom)}" placeholder="Nom du membre">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Sexe</label>
          <select id="f-sexe">
            <option value="F" ${m.sexe==='F'?'selected':''}>Féminin</option>
            <option value="M" ${m.sexe==='M'?'selected':''}>Masculin</option>
          </select>
        </div>
        <div class="field">
          <label>Statut</label>
          <select id="f-statut">
            <option value="Choriste" ${m.statut==='Choriste'?'selected':''}>Choriste</option>
            <option value="Bureau" ${m.statut==='Bureau'?'selected':''}>Bureau</option>
            <option value="Intégrant" ${m.statut==='Intégrant'?'selected':''}>Intégrant</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Fonction</label>
        <input type="text" id="f-fonction" value="${Utils.escapeHtml(m.fonction)}" placeholder="Ex: Président, Choriste...">
      </div>
      <div class="field">
        <label>Pupitre</label>
        <select id="f-pupitre">
          <option value="">—</option>
          ${Utils.PUPITRES.map(p => `<option value="${p}" ${m.pupitre===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Date de naissance</label>
          <input type="date" id="f-naissance" value="${m.dateNaissance || ''}">
        </div>
        <div class="field">
          <label>Téléphone</label>
          <input type="tel" id="f-tel" value="${Utils.escapeHtml(m.telephone)}" placeholder="07 00 00 00 00">
        </div>
      </div>
      <div class="field">
        <label>Adresse</label>
        <input type="text" id="f-adresse" value="${Utils.escapeHtml(m.adresse)}">
      </div>
      <div class="field">
        <label>Email</label>
        <input type="email" id="f-email" value="${Utils.escapeHtml(m.email)}">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Date d'entrée</label>
          <input type="date" id="f-entree" value="${m.dateEntree || ''}">
        </div>
        <div class="field">
          <label>Situation</label>
          <select id="f-situation">
            ${['Actif','Suspendu','Démission','Intégré','Observateur'].map(s => `<option value="${s}" ${m.situation===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field">
        <label>Observations</label>
        <textarea id="f-obs" rows="2">${Utils.escapeHtml(m.observations)}</textarea>
      </div>
      <button class="btn primary block" id="save-member">💾 ${isEdit?'Enregistrer':'Ajouter le membre'}</button>
    `;

    const sheet = Utils.openSheet(isEdit ? 'Modifier le membre' : 'Nouveau membre', html);
    sheet.querySelector('#save-member').addEventListener('click', () => {
      const nom = sheet.querySelector('#f-nom').value.trim();
      if (!nom) { Utils.toast('Le nom est requis'); return; }
      const statut = sheet.querySelector('#f-statut').value;

      const updated = {
        id: isEdit ? m.id : Store.nextMemberId(statut),
        nom,
        prenom: m.prenom,
        sexe: sheet.querySelector('#f-sexe').value,
        dateNaissance: sheet.querySelector('#f-naissance').value,
        telephone: sheet.querySelector('#f-tel').value,
        adresse: sheet.querySelector('#f-adresse').value,
        pupitre: sheet.querySelector('#f-pupitre').value,
        fonction: sheet.querySelector('#f-fonction').value,
        statut,
        dateEntree: sheet.querySelector('#f-entree').value,
        situation: sheet.querySelector('#f-situation').value,
        email: sheet.querySelector('#f-email').value,
        observations: sheet.querySelector('#f-obs').value,
      };

      Store.upsertMembre(updated);
      Utils.closeSheet();
      Utils.toast(isEdit ? 'Membre modifié' : 'Membre ajouté');
      Router.render();
    });
  },
};
