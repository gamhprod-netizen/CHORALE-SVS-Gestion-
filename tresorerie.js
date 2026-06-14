// ════════════════════════════════════════════════════════════════
// TRÉSORERIE — Cotisations, Offrandes, Mouvements, Bilans
// ════════════════════════════════════════════════════════════════

const TresorerieModule = {
  tab: 'cotisations',
  selectedMonth: null,

  render(main) {
    if (!this.selectedMonth) this.selectedMonth = Utils.monthKey();

    const tabs = [
      { key: 'cotisations', label: '📋 Cotisations' },
      { key: 'offrandes', label: '🙏 Offrandes' },
      { key: 'mouvements', label: '📊 Mouvements' },
      { key: 'bilan', label: '💹 Bilan' },
    ];

    main.innerHTML = `
      <div class="tabbar">
        ${tabs.map(t => `<button class="tab-btn ${this.tab===t.key?'active':''}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="treso-content"></div>
    `;

    main.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tab = btn.dataset.tab;
        this.render(main);
      });
    });

    const content = main.querySelector('#treso-content');
    if (this.tab === 'cotisations') this.renderCotisations(content);
    else if (this.tab === 'offrandes') this.renderOffrandes(content, main);
    else if (this.tab === 'mouvements') this.renderMouvements(content, main);
    else this.renderBilan(content);
  },

  // ── COTISATIONS ──
  renderCotisations(container) {
    const year = Store.data.meta.annee;
    const membres = Store.data.membres.slice().sort((a,b)=>a.nom.localeCompare(b.nom));

    let totalDue = 0, totalPaid = 0;
    membres.forEach(m => {
      const due = Store.getCotisationDue(m);
      totalDue += due;
      totalPaid += Store.getCotisation(m.id, this.selectedMonth);
    });

    container.innerHTML = `
      <div class="card">
        <div class="field">
          <label>Mois sélectionné</label>
          <select id="month-select">
            ${Utils.MONTHS.map((mo,i) => {
              const key = `${year}-${String(i+1).padStart(2,'0')}`;
              return `<option value="${key}" ${this.selectedMonth===key?'selected':''}>${mo} ${year}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="flex-between">
          <span class="text-sm text-muted">Attendu ce mois</span>
          <span style="font-weight:700;">${Utils.fmtFCFA(totalDue)}</span>
        </div>
        <div class="flex-between mt-8">
          <span class="text-sm text-muted">Encaissé ce mois</span>
          <span style="font-weight:700;color:var(--green);">${Utils.fmtFCFA(totalPaid)}</span>
        </div>
        <div class="progress mt-8">
          <div class="progress__fill" style="width:${Math.min(100, totalDue?totalPaid/totalDue*100:0)}%;background:${totalPaid>=totalDue?'var(--green)':'var(--gold)'};"></div>
        </div>
      </div>

      <div class="section-title"><span class="ornament">💰</span> Paiements individuels</div>
      <div class="list">
        ${membres.map(m => {
          const due = Store.getCotisationDue(m);
          const paid = Store.getCotisation(m.id, this.selectedMonth);
          const isPaid = paid >= due;
          return `
            <div class="list-row" style="cursor:default;">
              <div class="list-row__avatar">${Utils.initials(m.nom)}</div>
              <div class="list-row__body">
                <div class="list-row__title">${Utils.escapeHtml(m.nom)}</div>
                <div class="list-row__subtitle">Dû : ${Utils.fmtFCFA(due)}</div>
              </div>
              <button class="btn sm ${isPaid?'sage':'secondary'}" data-toggle-cotis="${m.id}" data-due="${due}">
                ${isPaid ? '✅ Payé' : '☐ Marquer payé'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelector('#month-select').addEventListener('change', (e) => {
      this.selectedMonth = e.target.value;
      this.renderCotisations(container);
    });

    container.querySelectorAll('[data-toggle-cotis]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mid = btn.dataset.toggleCotis;
        const due = Number(btn.dataset.due);
        const current = Store.getCotisation(mid, this.selectedMonth);
        const newVal = current >= due ? 0 : due;
        Store.setCotisation(mid, this.selectedMonth, newVal);
        this.renderCotisations(container);
      });
    });
  },

  // ── OFFRANDES ──
  renderOffrandes(container, main) {
    const offrandes = Store.getOffrandes();
    const totalH = offrandes.reduce((s,o)=>s+Number(o.hommes||0),0);
    const totalF = offrandes.reduce((s,o)=>s+Number(o.femmes||0),0);

    container.innerHTML = `
      <div class="grid-2">
        <div class="card center">
          <div class="text-sm text-muted">Offrandes Hommes</div>
          <div class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--blue);">${Utils.fmtFCFA(totalH)}</div>
        </div>
        <div class="card center">
          <div class="text-sm text-muted">Offrandes Femmes</div>
          <div class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--purple);">${Utils.fmtFCFA(totalF)}</div>
        </div>
      </div>
      <div class="card center" style="margin-top:0;">
        <div class="text-sm text-muted">Total Général</div>
        <div class="font-display" style="font-size:1.6rem;font-weight:700;color:var(--maroon);">${Utils.fmtFCFA(totalH+totalF)}</div>
      </div>
      <div id="offrande-list"></div>
    `;

    if (!offrandes.length) {
      container.querySelector('#offrande-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">🙏</div><div class="empty-state__text">Aucune offrande enregistrée</div></div>`;
    } else {
      container.querySelector('#offrande-list').innerHTML = `<div class="list">${offrandes.map(o => `
        <div class="list-row" data-id="${o.id}">
          <div class="list-row__avatar">🙏</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(o.occasion || 'Offrande')}</div>
            <div class="list-row__subtitle">${Utils.fmtDate(o.date)} · H: ${Utils.fmtFCFA(o.hommes)} / F: ${Utils.fmtFCFA(o.femmes)}</div>
          </div>
          <div class="list-row__meta" style="font-weight:700;">${Utils.fmtFCFA(Number(o.hommes||0)+Number(o.femmes||0))}</div>
        </div>
      `).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => {
          Utils.confirmAction('Supprimer cette offrande ?', () => {
            Store.deleteOffrande(row.dataset.id);
            Utils.toast('Offrande supprimée');
            Router.render();
          });
        });
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-offrande';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openOffrandeForm());
  },

  openOffrandeForm() {
    const html = `
      <div class="field">
        <label>Date</label>
        <input type="date" id="of-date" value="${Utils.todayISO()}">
      </div>
      <div class="field">
        <label>Occasion</label>
        <input type="text" id="of-occasion" placeholder="Ex: Culte dimanche, Agape...">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Offrande Hommes (FCFA)</label>
          <input type="number" id="of-hommes" value="0" min="0" step="50">
        </div>
        <div class="field">
          <label>Offrande Femmes (FCFA)</label>
          <input type="number" id="of-femmes" value="0" min="0" step="50">
        </div>
      </div>
      <button class="btn primary block" id="save-offrande">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet('Nouvelle offrande', html);
    sheet.querySelector('#save-offrande').addEventListener('click', () => {
      Store.addOffrande({
        id: Utils.genId('off'),
        date: sheet.querySelector('#of-date').value,
        occasion: sheet.querySelector('#of-occasion').value,
        hommes: Number(sheet.querySelector('#of-hommes').value),
        femmes: Number(sheet.querySelector('#of-femmes').value),
      });
      Utils.closeSheet();
      Utils.toast('Offrande ajoutée');
      Router.render();
    });
  },

  // ── MOUVEMENTS ──
  renderMouvements(container, main) {
    const mvts = Store.getMouvements();
    const entrees = mvts.filter(m=>m.type==='Entrée').reduce((s,m)=>s+Number(m.montant||0),0);
    const sorties = mvts.filter(m=>m.type==='Sortie').reduce((s,m)=>s+Number(m.montant||0),0);

    container.innerHTML = `
      <div class="grid-2">
        <div class="card center">
          <div class="text-sm text-muted">Entrées</div>
          <div class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--green);">${Utils.fmtFCFA(entrees)}</div>
        </div>
        <div class="card center">
          <div class="text-sm text-muted">Sorties</div>
          <div class="font-display" style="font-size:1.3rem;font-weight:700;color:var(--red);">${Utils.fmtFCFA(sorties)}</div>
        </div>
      </div>
      <div id="mvt-list"></div>
    `;

    if (!mvts.length) {
      container.querySelector('#mvt-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">📊</div><div class="empty-state__text">Aucun mouvement enregistré</div></div>`;
    } else {
      container.querySelector('#mvt-list').innerHTML = `<div class="list">${mvts.map(m => {
        const isEntree = m.type === 'Entrée';
        return `
          <div class="list-row" data-id="${m.id}">
            <div class="list-row__avatar">${isEntree?'⬆️':'⬇️'}</div>
            <div class="list-row__body">
              <div class="list-row__title">${Utils.escapeHtml(m.description || m.categorie)}</div>
              <div class="list-row__subtitle">${m.categorie} · ${Utils.fmtDate(m.date)}</div>
            </div>
            <div class="list-row__meta" style="font-weight:700;color:${isEntree?'var(--green)':'var(--red)'};">
              ${isEntree?'+':'-'}${Utils.fmtFCFA(m.montant)}
            </div>
          </div>
        `;
      }).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => {
          Utils.confirmAction('Supprimer ce mouvement ?', () => {
            Store.deleteMouvement(row.dataset.id);
            Utils.toast('Mouvement supprimé');
            Router.render();
          });
        });
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-mvt';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openMouvementForm());
  },

  openMouvementForm() {
    const html = `
      <div class="field">
        <label>Type</label>
        <select id="mv-type">
          <option value="Entrée">⬆️ Entrée</option>
          <option value="Sortie">⬇️ Sortie</option>
        </select>
      </div>
      <div class="field">
        <label>Date</label>
        <input type="date" id="mv-date" value="${Utils.todayISO()}">
      </div>
      <div class="field">
        <label>Catégorie</label>
        <select id="mv-cat">
          <option>Cotisations</option>
          <option>Offrandes</option>
          <option>Dons</option>
          <option>Sanctions</option>
          <option>Activités</option>
          <option>Achats</option>
          <option>Déplacements</option>
          <option>Salaires</option>
          <option>Autres</option>
        </select>
      </div>
      <div class="field">
        <label>Description</label>
        <input type="text" id="mv-desc" placeholder="Détail de l'opération">
      </div>
      <div class="field">
        <label>Montant (FCFA)</label>
        <input type="number" id="mv-montant" value="0" min="0" step="100">
      </div>
      <button class="btn primary block" id="save-mvt">💾 Enregistrer</button>
    `;
    const sheet = Utils.openSheet('Nouveau mouvement', html);
    sheet.querySelector('#save-mvt').addEventListener('click', () => {
      Store.addMouvement({
        id: Utils.genId('mvt'),
        type: sheet.querySelector('#mv-type').value,
        date: sheet.querySelector('#mv-date').value,
        categorie: sheet.querySelector('#mv-cat').value,
        description: sheet.querySelector('#mv-desc').value,
        montant: Number(sheet.querySelector('#mv-montant').value),
      });
      Utils.closeSheet();
      Utils.toast('Mouvement ajouté');
      Router.render();
    });
  },

  // ── BILAN ──
  renderBilan(container) {
    const year = Store.data.meta.annee;
    const membres = Store.data.membres;

    // Annual cotisations
    let totalAttendu = 0, totalEncaisse = 0;
    const monthlyData = [];
    for (let mo=1; mo<=12; mo++) {
      const key = `${year}-${String(mo).padStart(2,'0')}`;
      let due=0, paid=0;
      membres.forEach(m => {
        due += Store.getCotisationDue(m);
        paid += Store.getCotisation(m.id, key);
      });
      totalAttendu += due; totalEncaisse += paid;
      monthlyData.push({ month: Utils.MONTHS[mo-1], due, paid });
    }
    const txGlobal = totalAttendu > 0 ? totalEncaisse/totalAttendu : 0;

    const offrandes = Store.getOffrandes();
    const totalOffrandes = offrandes.reduce((s,o)=>s+Number(o.hommes||0)+Number(o.femmes||0),0);

    const mvts = Store.getMouvements();
    const entrees = mvts.filter(m=>m.type==='Entrée').reduce((s,m)=>s+Number(m.montant||0),0);
    const sorties = mvts.filter(m=>m.type==='Sortie').reduce((s,m)=>s+Number(m.montant||0),0);
    const soldeNet = entrees - sorties;

    // Quarterly
    const quarters = [
      { label: 'T1 (Jan-Mar)', months: [0,1,2] },
      { label: 'T2 (Avr-Juin)', months: [3,4,5] },
      { label: 'T3 (Juil-Sep)', months: [6,7,8] },
      { label: 'T4 (Oct-Déc)', months: [9,10,11] },
    ];

    container.innerHTML = `
      <div class="card">
        <div class="flex-between">
          <span class="text-sm text-muted">Taux de recouvrement ${year}</span>
          <span class="font-display" style="font-size:1.4rem;font-weight:700;color:var(--maroon);">${Utils.pct(txGlobal)}</span>
        </div>
        <div class="progress mt-8"><div class="progress__fill" style="width:${txGlobal*100}%;background:var(--gold);"></div></div>
        <div class="flex-between mt-8 text-sm">
          <span class="text-muted">Attendu : ${Utils.fmtFCFA(totalAttendu)}</span>
          <span class="text-muted">Encaissé : ${Utils.fmtFCFA(totalEncaisse)}</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="card center">
          <div class="text-sm text-muted">Total Offrandes</div>
          <div class="font-display" style="font-size:1.2rem;font-weight:700;color:var(--purple);">${Utils.fmtFCFA(totalOffrandes)}</div>
        </div>
        <div class="card center">
          <div class="text-sm text-muted">Solde Net</div>
          <div class="font-display" style="font-size:1.2rem;font-weight:700;color:${soldeNet>=0?'var(--green)':'var(--red)'};">${Utils.fmtFCFA(soldeNet)}</div>
        </div>
      </div>

      <div class="section-title"><span class="ornament">📅</span> Bilans Trimestriels</div>
      ${quarters.map(q => {
        const due = q.months.reduce((s,mi)=>s+monthlyData[mi].due,0);
        const paid = q.months.reduce((s,mi)=>s+monthlyData[mi].paid,0);
        const pct = due>0?paid/due:0;
        return `
          <div class="card">
            <div class="flex-between">
              <span style="font-weight:700;">${q.label}</span>
              <span style="font-weight:700;color:var(--maroon);">${Utils.fmtFCFA(paid)}</span>
            </div>
            <div class="progress mt-8"><div class="progress__fill" style="width:${pct*100}%;background:var(--sage);"></div></div>
            <div class="text-sm text-muted mt-8">${Utils.pct(pct)} de ${Utils.fmtFCFA(due)} attendu</div>
          </div>
        `;
      }).join('')}

      <div class="section-title"><span class="ornament">📈</span> Détail mensuel</div>
      <div class="scroll-table">
        <table>
          <thead><tr><th>Mois</th><th>Attendu</th><th>Encaissé</th><th>Taux</th></tr></thead>
          <tbody>
            ${monthlyData.map(md => `
              <tr>
                <td>${md.month}</td>
                <td>${Utils.fmtFCFA(md.due)}</td>
                <td style="color:var(--green);font-weight:700;">${Utils.fmtFCFA(md.paid)}</td>
                <td>${Utils.pct(md.due?md.paid/md.due:0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
