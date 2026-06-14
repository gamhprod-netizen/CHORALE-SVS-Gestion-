// ════════════════════════════════════════════════════════════════
// DASHBOARD — Tableau de bord central
// ════════════════════════════════════════════════════════════════

const DashboardModule = {
  render(main) {
    const d = Store.data;
    const membres = d.membres;
    const choristes = membres.filter(m => m.statut === 'Choriste');
    const integrants = membres.filter(m => m.statut === 'Intégrant');

    // KPIs
    const nbMembres = membres.length;
    const nbChoristes = choristes.length;
    const activitesRealisees = d.activites.filter(a => a.statut === 'Réalisée').length;
    const chantsMaitrises = d.repertoire.filter(c => c.statut === 'Maîtrisé').length;

    // Cotisations
    const year = d.meta.annee;
    let totalDue = 0, totalPaid = 0;
    membres.forEach(m => {
      const due = Store.getCotisationDue(m) * 12;
      totalDue += due;
      for (let mo=1; mo<=12; mo++) {
        totalPaid += Store.getCotisation(m.id, `${year}-${String(mo).padStart(2,'0')}`);
      }
    });
    const txRecouvrement = totalDue > 0 ? totalPaid/totalDue : 0;

    // Alertes discipline
    let alertes = 0;
    choristes.concat(integrants).forEach(m => {
      const dis = Store.getDisciplineStats(m.id);
      if (dis.interdit) alertes++;
    });

    // Anniversaires
    let annivToday = [], annivWeek = [], annivMonth = 0;
    membres.forEach(m => {
      const info = Store.getAnniversaireInfo(m);
      if (!info) return;
      if (info.isToday) annivToday.push(m);
      if (info.isThisWeek && !info.isToday) annivWeek.push(m);
      if (info.isThisMonth) annivMonth++;
    });

    // IGI averages
    let igiSum = 0, igiCount = 0, exemplaires = 0, accompagner = 0;
    choristes.forEach(m => {
      const igi = Store.calcIGI(m.id);
      if (igi) {
        igiSum += igi.igi; igiCount++;
        if (igi.categorie.includes('Exemplaire')) exemplaires++;
        if (igi.categorie.includes('accompagner')) accompagner++;
      }
    });
    const igiMoyen = igiCount > 0 ? igiSum/igiCount : 0;

    main.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card__value">${nbMembres}</div>
          <div class="kpi-card__label">Membres</div>
        </div>
        <div class="kpi-card accent-blue">
          <div class="kpi-card__value">${nbChoristes}</div>
          <div class="kpi-card__label">Choristes</div>
        </div>
        <div class="kpi-card accent-sage">
          <div class="kpi-card__value">${activitesRealisees}</div>
          <div class="kpi-card__label">Activités</div>
        </div>
        <div class="kpi-card accent-gold">
          <div class="kpi-card__value">${Utils.pct(txRecouvrement)}</div>
          <div class="kpi-card__label">Cotis. payées</div>
        </div>
        <div class="kpi-card ${alertes>0?'accent-red':''}">
          <div class="kpi-card__value">${alertes}</div>
          <div class="kpi-card__label">Alertes</div>
        </div>
        <div class="kpi-card accent-purple">
          <div class="kpi-card__value">${chantsMaitrises}</div>
          <div class="kpi-card__label">Chants maîtr.</div>
        </div>
      </div>

      ${annivToday.length ? `
        <div class="alert-banner gold">
          <div class="alert-banner__icon">🎉</div>
          <div><b>Anniversaire${annivToday.length>1?'s':''} aujourd'hui :</b> ${annivToday.map(m=>m.nom).join(', ')}</div>
        </div>` : ''}

      ${annivWeek.length ? `
        <div class="alert-banner info">
          <div class="alert-banner__icon">📅</div>
          <div><b>Anniversaires cette semaine :</b> ${annivWeek.map(m=>m.nom).join(', ')}</div>
        </div>` : ''}

      ${alertes > 0 ? `
        <div class="alert-banner danger">
          <div class="alert-banner__icon">⛔</div>
          <div><b>${alertes} membre(s)</b> non autorisé(s) à prester (2 absences consécutives au samedi). Voir module Discipline.</div>
        </div>` : `
        <div class="alert-banner success">
          <div class="alert-banner__icon">✅</div>
          <div>Aucune alerte disciplinaire — tous les choristes sont autorisés à prester.</div>
        </div>`}

      <div class="section-title"><span class="ornament">🏆</span> Indice Global d'Implication</div>
      <div class="card">
        <div class="flex-between">
          <div>
            <div class="font-display" style="font-size:2rem;font-weight:700;color:var(--maroon);">${igiMoyen.toFixed(1)}<span style="font-size:1rem;color:var(--ink-soft);">/100</span></div>
            <div class="text-sm text-muted">IGI moyen de la chorale</div>
          </div>
          <div style="text-align:right;">
            <div class="pill exemplaire">🌟 ${exemplaires} Exemplaires</div>
            <div class="mt-8 pill accompagner">🆘 ${accompagner} À accompagner</div>
          </div>
        </div>
      </div>

      <div class="section-title"><span class="ornament">📆</span> Cette semaine</div>
      <div class="card">
        ${this.renderRecentSeances()}
      </div>

      <div class="section-title"><span class="ornament">⚡</span> Accès rapide</div>
      <div class="grid-2">
        <button class="btn primary block" data-nav="discipline">⚖️ Pointer présences</button>
        <button class="btn gold block" data-nav="tresorerie">💰 Cotisations</button>
        <button class="btn secondary block" data-nav="membres">👥 Membres</button>
        <button class="btn secondary block" data-nav="rapports">📈 Rapports</button>
      </div>
    `;

    main.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => Router.navigate(btn.dataset.nav));
    });
  },

  renderRecentSeances() {
    const seances = Store.data.seances.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    if (!seances.length) {
      return `<div class="empty-state"><div class="empty-state__icon">📋</div><div class="empty-state__text">Aucune séance enregistrée.<br>Allez dans Discipline pour pointer les présences.</div></div>`;
    }
    return seances.map(s => {
      const presCount = Object.values(s.presences).filter(p => p === 'Présent').length;
      const total = Object.keys(s.presences).length;
      const icon = s.type === 'samedi' ? '🎹' : '⛪';
      const label = s.type === 'samedi' ? 'Répétition samedi' : 'Culte dimanche';
      return `
        <div class="flex-between" style="padding:6px 0;">
          <div>
            <div style="font-weight:600;font-size:0.88rem;">${icon} ${label}</div>
            <div class="text-sm text-muted">${Utils.fmtDate(s.date)}</div>
          </div>
          <div class="pill actif">${presCount}/${total} présents</div>
        </div>
      `;
    }).join('<div class="divider" style="margin:6px 0;"></div>');
  },
};
