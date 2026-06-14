// ════════════════════════════════════════════════════════════════
// SECRÉTARIAT — Activités, Modérateurs, Jeux d'Anges
// ════════════════════════════════════════════════════════════════

const SecretariatModule = {
  tab: 'activites',

  render(main) {
    const tabs = [
      { key: 'activites', label: '📅 Activités' },
      { key: 'moderateurs', label: '🎤 Modérateurs' },
      { key: 'jda', label: "😇 Jeux d'Anges" },
    ];

    main.innerHTML = `
      <div class="tabbar">
        ${tabs.map(t => `<button class="tab-btn ${this.tab===t.key?'active':''}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="secre-content"></div>
    `;

    main.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { this.tab = btn.dataset.tab; this.render(main); });
    });

    const content = main.querySelector('#secre-content');
    if (this.tab === 'activites') this.renderActivites(content, main);
    else if (this.tab === 'moderateurs') this.renderModerateurs(content, main);
    else this.renderJDA(content, main);
  },

  // ── ACTIVITÉS ──
  renderActivites(container, main) {
    const activites = Store.getActivites();
    const realisees = activites.filter(a=>a.statut==='Réalisée').length;
    const prevues = activites.filter(a=>a.statut==='Prévue').length;

    container.innerHTML = `
      <div class="grid-2">
        <div class="card center">
          <div class="kpi-card__value" style="color:var(--green);">${realisees}</div>
          <div class="kpi-card__label">Réalisées</div>
        </div>
        <div class="card center">
          <div class="kpi-card__value" style="color:var(--blue);">${prevues}</div>
          <div class="kpi-card__label">Prévues</div>
        </div>
      </div>
      <div id="activite-list"></div>
    `;

    if (!activites.length) {
      container.querySelector('#activite-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">📅</div><div class="empty-state__text">Aucune activité enregistrée</div></div>`;
    } else {
      container.querySelector('#activite-list').innerHTML = `<div class="list">${activites.map(a => {
        const statusClass = a.statut==='Réalisée'?'actif':a.statut==='Annulée'?'suspendu':a.statut==='Reportée'?'integrant':'bureau';
        return `
          <div class="list-row" data-id="${a.id}">
            <div class="list-row__avatar">📅</div>
            <div class="list-row__body">
              <div class="list-row__title">${Utils.escapeHtml(a.type)}</div>
              <div class="list-row__subtitle">${Utils.fmtDate(a.date)} ${a.responsable?'· '+a.responsable:''}</div>
            </div>
            <span class="pill ${statusClass}">${a.statut}</span>
          </div>
        `;
      }).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => this.openActiviteDetail(row.dataset.id));
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-activite';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openActiviteForm());
  },

  openActiviteDetail(id) {
    const a = Store.data.activites.find(x=>x.id===id);
    if (!a) return;
    const html = `
      <div class="field">
        <label>Statut</label>
        <select id="a-statut">
          ${['Prévue','Réalisée','Reportée','Annulée'].map(s => `<option value="${s}" ${a.statut===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Budget réalisé (FCFA)</label>
        <input type="number" id="a-budget" value="${a.budgetRealise||0}" min="0">
      </div>
      <div class="field">
        <label>Nb participants</label>
        <input type="number" id="a-part" value="${a.participants||0}" min="0">
      </div>
      <div class="field">
        <label>Commentaires</label>
        <textarea id="a-comm" rows="2">${Utils.escapeHtml(a.commentaires||'')}</textarea>
      </div>
      <div class="grid-2 mt-16">
        <button class="btn danger block" id="del-act">🗑️ Supprimer</button>
        <button class="btn primary block" id="save-act">💾 Enregistrer</button>
      </div>
    `;
    const sheet = Utils.openSheet(`${a.type} — ${Utils.fmtDate(a.date)}`, html);
    sheet.querySelector('#save-act').addEventListener('click', () => {
      Store.updateActivite(id, {
        statut: sheet.querySelector('#a-statut').value,
        budgetRealise: Number(sheet.querySelector('#a-budget').value),
        participants: Number(sheet.querySelector('#a-part').value),
        commentaires: sheet.querySelector('#a-comm').value,
      });
      Utils.closeSheet();
      Utils.toast('Activité mise à jour');
      Router.render();
    });
    sheet.querySelector('#del-act').addEventListener('click', () => {
      Utils.confirmAction('Supprimer cette activité ?', () => {
        Store.deleteActivite(id);
        Utils.closeSheet();
        Utils.toast('Activité supprimée');
        Router.render();
      });
    });
  },

  openActiviteForm() {
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));
    const types = ['Prière mensuelle','Enseignement','Sortie récréative','Soirée thé-débat','Sans Filtre','Agape','Activité spéciale',"Jeux d'Anges",'Répétition','Prestation','Autre'];
    const html = `
      <div class="field">
        <label>Type d'activité</label>
        <select id="af-type">${types.map(t=>`<option>${t}</option>`).join('')}</select>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Date</label>
          <input type="date" id="af-date" value="${Utils.todayISO()}">
        </div>
        <div class="field">
          <label>Heure</label>
          <input type="time" id="af-heure" value="09:00">
        </div>
      </div>
      <div class="field">
        <label>Responsable</label>
        <select id="af-resp">
          <option value="">—</option>
          ${membres.map(m=>`<option>${Utils.escapeHtml(m.nom)}</option>`)}
        </select>
      </div>
      <div class="field">
        <label>Lieu</label>
        <input type="text" id="af-lieu" placeholder="Lieu de l'activité">
      </div>
      <div class="field">
        <label>Objectifs</label>
        <input type="text" id="af-obj">
      </div>
      <div class="field">
        <label>Budget prévu (FCFA)</label>
        <input type="number" id="af-budget" value="0" min="0">
      </div>
      <div class="field">
        <label>Statut</label>
        <select id="af-statut">
          <option>Prévue</option><option>Réalisée</option><option>Reportée</option><option>Annulée</option>
        </select>
      </div>
      <button class="btn primary block" id="save-new-act">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet('Nouvelle activité', html);
    sheet.querySelector('#save-new-act').addEventListener('click', () => {
      Store.addActivite({
        id: Utils.genId('act'),
        type: sheet.querySelector('#af-type').value,
        date: sheet.querySelector('#af-date').value,
        heure: sheet.querySelector('#af-heure').value,
        responsable: sheet.querySelector('#af-resp').value,
        lieu: sheet.querySelector('#af-lieu').value,
        objectifs: sheet.querySelector('#af-obj').value,
        budgetPrevu: Number(sheet.querySelector('#af-budget').value),
        budgetRealise: 0,
        participants: 0,
        statut: sheet.querySelector('#af-statut').value,
        commentaires: '',
      });
      Utils.closeSheet();
      Utils.toast('Activité ajoutée');
      Router.render();
    });
  },

  // ── MODÉRATEURS ──
  renderModerateurs(container, main) {
    const moderations = Store.getModerations();
    const choristes = Store.data.membres.filter(m=>m.statut==='Choriste').sort((a,b)=>a.nom.localeCompare(b.nom));

    // Count per choriste
    const counts = {};
    choristes.forEach(m => counts[m.nom] = 0);
    moderations.forEach(m => { if (counts[m.moderateur] !== undefined) counts[m.moderateur]++; });
    const neverModerated = choristes.filter(m => counts[m.nom] === 0);

    container.innerHTML = `
      ${neverModerated.length ? `
        <div class="alert-banner warn">
          <div class="alert-banner__icon">⚠️</div>
          <div><b>${neverModerated.length} choriste(s)</b> n'ont jamais modéré : ${neverModerated.map(m=>m.nom).join(', ')}</div>
        </div>` : ''}

      <div class="section-title"><span class="ornament">📊</span> Bilan par choriste</div>
      <div class="scroll-table">
        <table>
          <thead><tr><th>Choriste</th><th>Nb modérations</th></tr></thead>
          <tbody>
            ${choristes.sort((a,b)=>counts[b.nom]-counts[a.nom]).map(m => `
              <tr><td>${Utils.escapeHtml(m.nom)}</td><td style="font-weight:700;">${counts[m.nom]}</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section-title"><span class="ornament">📋</span> Historique</div>
      <div id="moderation-list"></div>
    `;

    if (!moderations.length) {
      container.querySelector('#moderation-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">🎤</div><div class="empty-state__text">Aucune modération enregistrée</div></div>`;
    } else {
      container.querySelector('#moderation-list').innerHTML = `<div class="list">${moderations.map(m => `
        <div class="list-row" data-id="${m.id}">
          <div class="list-row__avatar">🎤</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(m.moderateur)}</div>
            <div class="list-row__subtitle">${m.type} · ${Utils.fmtDate(m.date)}</div>
          </div>
          <span class="pill ${m.statut==='Assuré'?'actif':m.statut==='Annulé'?'suspendu':'bureau'}">${m.statut}</span>
        </div>
      `).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => {
          Utils.confirmAction('Supprimer cette modération ?', () => {
            Store.deleteModeration(row.dataset.id);
            Utils.toast('Modération supprimée');
            Router.render();
          });
        });
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-mod';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openModerationForm(choristes));
  },

  openModerationForm(choristes) {
    const html = `
      <div class="field">
        <label>Date</label>
        <input type="date" id="mf-date" value="${Utils.todayISO()}">
      </div>
      <div class="field">
        <label>Modérateur</label>
        <select id="mf-mod">${choristes.map(m=>`<option>${Utils.escapeHtml(m.nom)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Type de séance</label>
        <select id="mf-type">
          <option>Répétition samedi</option>
          <option>Culte dimanche</option>
          <option>Activité spéciale</option>
          <option>Agape</option>
        </select>
      </div>
      <div class="field">
        <label>Statut</label>
        <select id="mf-statut">
          <option>Assuré</option><option>Remplacé</option><option>En attente</option><option>Annulé</option>
        </select>
      </div>
      <button class="btn primary block" id="save-mod">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet('Nouvelle modération', html);
    sheet.querySelector('#save-mod').addEventListener('click', () => {
      Store.addModeration({
        id: Utils.genId('mod'),
        date: sheet.querySelector('#mf-date').value,
        moderateur: sheet.querySelector('#mf-mod').value,
        type: sheet.querySelector('#mf-type').value,
        statut: sheet.querySelector('#mf-statut').value,
      });
      Utils.closeSheet();
      Utils.toast('Modération ajoutée');
      Router.render();
    });
  },

  // ── JEUX D'ANGES ──
  renderJDA(container, main) {
    const jda = Store.getJeuxAnges();
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));

    container.innerHTML = `<div id="jda-list"></div>`;

    if (!jda.length) {
      container.querySelector('#jda-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">😇</div><div class="empty-state__text">Aucun tirage enregistré</div></div>`;
    } else {
      container.querySelector('#jda-list').innerHTML = `<div class="list">${jda.map(j => `
        <div class="list-row" data-id="${j.id}">
          <div class="list-row__avatar">😇</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(j.participant)} → ${Utils.escapeHtml(j.tire)}</div>
            <div class="list-row__subtitle">${j.mois} · ${Utils.fmtDate(j.date)}</div>
          </div>
          <span class="pill ${j.confirmation==='Confirmé'?'actif':'suspendu'}">${j.confirmation}</span>
        </div>
      `).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => {
          Utils.confirmAction('Supprimer ce tirage ?', () => {
            Store.deleteJeuAnge(row.dataset.id);
            Utils.toast('Tirage supprimé');
            Router.render();
          });
        });
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-jda';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openJDAForm(membres));
  },

  openJDAForm(membres) {
    const html = `
      <div class="field">
        <label>Mois</label>
        <select id="jf-mois">${Utils.MONTHS.map(m=>`<option>${m}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Date du tirage</label>
        <input type="date" id="jf-date" value="${Utils.todayISO()}">
      </div>
      <div class="field">
        <label>Participant</label>
        <select id="jf-part">${membres.map(m=>`<option>${Utils.escapeHtml(m.nom)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Nom tiré</label>
        <select id="jf-tire">${membres.map(m=>`<option>${Utils.escapeHtml(m.nom)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label>Confirmation</label>
        <select id="jf-conf">
          <option>Confirmé</option><option>Non confirmé</option><option>En attente</option>
        </select>
      </div>
      <button class="btn primary block" id="save-jda">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet("Nouveau tirage", html);
    sheet.querySelector('#save-jda').addEventListener('click', () => {
      Store.addJeuAnge({
        id: Utils.genId('jda'),
        mois: sheet.querySelector('#jf-mois').value,
        date: sheet.querySelector('#jf-date').value,
        participant: sheet.querySelector('#jf-part').value,
        tire: sheet.querySelector('#jf-tire').value,
        confirmation: sheet.querySelector('#jf-conf').value,
      });
      Utils.closeSheet();
      Utils.toast('Tirage ajouté');
      Router.render();
    });
  },
};
