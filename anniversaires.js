// ════════════════════════════════════════════════════════════════
// ANNIVERSAIRES — Alertes et calendrier
// ════════════════════════════════════════════════════════════════

const AnniversairesModule = {
  render(main) {
    const membres = Store.data.membres;
    const withDates = membres.filter(m => m.dateNaissance);
    const withoutDates = membres.filter(m => !m.dateNaissance);

    const today = [], week = [], byMonth = {};
    Utils.MONTHS.forEach(m => byMonth[m] = []);

    withDates.forEach(m => {
      const info = Store.getAnniversaireInfo(m);
      if (info.isToday) today.push(m);
      else if (info.isThisWeek) week.push({ m, info });
      const dob = new Date(m.dateNaissance);
      byMonth[Utils.MONTHS[dob.getMonth()]].push(m);
    });

    week.sort((a,b) => a.info.daysRemaining - b.info.daysRemaining);

    main.innerHTML = `
      ${today.length ? `
        <div class="alert-banner gold">
          <div class="alert-banner__icon">🎉</div>
          <div><b>Aujourd'hui :</b> ${today.map(m=>m.nom).join(', ')}</div>
        </div>` : `
        <div class="alert-banner info">
          <div class="alert-banner__icon">📅</div>
          <div>Aucun anniversaire aujourd'hui.</div>
        </div>`}

      <div class="section-title"><span class="ornament">📅</span> Dans les 7 prochains jours</div>
      ${week.length ? `
        <div class="list">
          ${week.map(({m,info}) => `
            <div class="list-row" style="cursor:default;">
              <div class="list-row__avatar">🎂</div>
              <div class="list-row__body">
                <div class="list-row__title">${Utils.escapeHtml(m.nom)}</div>
                <div class="list-row__subtitle">${Utils.fmtDate(m.dateNaissance)} → ${info.age+1} ans</div>
              </div>
              <div class="pill bureau">Dans ${info.daysRemaining}j</div>
            </div>
          `).join('')}
        </div>` : `<div class="empty-state"><div class="empty-state__icon">📅</div><div class="empty-state__text">Aucun anniversaire cette semaine</div></div>`}

      <div class="section-title"><span class="ornament">📆</span> Calendrier par mois</div>
      <div class="list">
        ${Utils.MONTHS.map((mo, idx) => {
          const list = byMonth[mo];
          const isCurrentMonth = new Date().getMonth() === idx;
          return `
            <div class="list-row" style="cursor:default;${isCurrentMonth?'background:var(--gold-soft);':''}">
              <div class="list-row__body">
                <div class="list-row__title">${mo} ${isCurrentMonth ? '📍' : ''}</div>
                <div class="list-row__subtitle">${list.length ? list.map(m=>m.nom + ' (' + new Date(m.dateNaissance).getDate() + ')').join(', ') : 'Aucun'}</div>
              </div>
              <div class="pill ${list.length?'actif':''}">${list.length || ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      ${withoutDates.length ? `
        <div class="alert-banner warn mt-16">
          <div class="alert-banner__icon">ℹ️</div>
          <div><b>${withoutDates.length} membre(s)</b> sans date de naissance enregistrée. Complétez leur profil dans le module Membres.</div>
        </div>` : ''}
    `;
  },
};
