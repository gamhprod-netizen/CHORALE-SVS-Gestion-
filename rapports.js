// ════════════════════════════════════════════════════════════════
// RAPPORTS — Génération automatique
// ════════════════════════════════════════════════════════════════

const RapportsModule = {
  render(main) {
    const d = Store.data;
    const membres = d.membres;
    const choristes = membres.filter(m=>m.statut==='Choriste');
    const integrants = membres.filter(m=>m.statut==='Intégrant');
    const year = d.meta.annee;

    // R1 — Synthèse générale
    const effectifTotal = membres.length;
    const effectifActif = membres.filter(m=>m.situation==='Actif').length;
    const activitesRealisees = d.activites.filter(a=>a.statut==='Réalisée').length;
    const repetitionsTenues = d.repetitions.filter(r=>r.statut==='Tenue').length;
    const chantsMaitrises = d.repertoire.filter(c=>c.statut==='Maîtrisé').length;

    // R2 — Discipline
    let sumTxSam=0, sumTxDim=0, interdits=0, n=0;
    let interditsNames = [];
    membres.forEach(m => {
      const dis = Store.getDisciplineStats(m.id);
      sumTxSam += dis.txSamedi; sumTxDim += dis.txDimanche; n++;
      if (dis.interdit) { interdits++; interditsNames.push(m.nom); }
    });
    const txSamMoy = n?sumTxSam/n:0, txDimMoy = n?sumTxDim/n:0;
    const sanctionsCount = d.sanctions.length;

    // R3 — Financier
    let totalDue=0, totalPaid=0, membresAJour=0, membresRetard=0;
    membres.forEach(m => {
      const due = Store.getCotisationDue(m)*12;
      let paid = 0;
      for(let mo=1;mo<=12;mo++) paid += Store.getCotisation(m.id, `${year}-${String(mo).padStart(2,'0')}`);
      totalDue += due; totalPaid += paid;
      if (paid >= due) membresAJour++; else membresRetard++;
    });
    const arrears = totalDue - totalPaid;
    const txRecouvrement = totalDue?totalPaid/totalDue:0;
    const offrandes = d.offrandes.reduce((s,o)=>s+Number(o.hommes||0)+Number(o.femmes||0),0);
    const mvts = d.mouvements;
    const entrees = mvts.filter(m=>m.type==='Entrée').reduce((s,m)=>s+Number(m.montant||0),0);
    const sorties = mvts.filter(m=>m.type==='Sortie').reduce((s,m)=>s+Number(m.montant||0),0);

    // R4 — Technique
    let sumMoyMusicale=0, nMus=0;
    let nivCounts = { excellent:0, tresbon:0, bon:0, ameliorer:0 };
    choristes.forEach(m => {
      const ev = Store.getEvaluation(m.id);
      let moy = 0;
      if (ev && ev.notes) {
        const vals = Object.values(ev.notes);
        moy = vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
      }
      sumMoyMusicale += moy; nMus++;
      if (moy>=18) nivCounts.excellent++;
      else if (moy>=15) nivCounts.tresbon++;
      else if (moy>=12) nivCounts.bon++;
      else if (moy<10) nivCounts.ameliorer++;
    });
    const moyMusicaleChorale = nMus?sumMoyMusicale/nMus:0;
    const chantsEnCours = d.repertoire.filter(c=>c.statut==='En cours').length;

    // R5 — Intégrants
    let eligibles=0, admis=0, refuses=0;
    integrants.forEach(m => {
      const dis = Store.getDisciplineStats(m.id);
      const test = Store.getTestIntegration(m.id);
      if (test && test.moyenne!=null) {
        if (test.moyenne>=10) admis++; else refuses++;
      } else if (dis.total>=2 && dis.txSamedi>=0.7) eligibles++;
    });

    // R6 — Anniversaires
    let annivToday=[], annivWeek=0, annivMonth=[];
    membres.forEach(m => {
      const info = Store.getAnniversaireInfo(m);
      if (!info) return;
      if (info.isToday) annivToday.push(m.nom);
      if (info.isThisWeek && !info.isToday) annivWeek++;
      if (info.isThisMonth) annivMonth.push(m.nom);
    });

    // R7 — IGI
    let igiSum=0, igiN=0, exemplaires=0, tresImpliques=0, accompagner=0;
    choristes.forEach(m => {
      const igi = Store.calcIGI(m.id);
      if (igi) {
        igiSum += igi.igi; igiN++;
        if (igi.categorie.includes('Exemplaire')) exemplaires++;
        if (igi.categorie.includes('Très impliqué')) tresImpliques++;
        if (igi.categorie.includes('accompagner')) accompagner++;
      }
    });
    const igiMoyen = igiN?igiSum/igiN:0;

    main.innerHTML = `
      <div class="card center">
        <div class="font-display" style="font-size:1.1rem;font-weight:700;color:var(--maroon);">📈 Rapport Automatique</div>
        <div class="text-sm text-muted">Année ${year} — Généré le ${Utils.fmtDate(Utils.todayISO())}</div>
      </div>

      <div class="section-title"><span class="ornament">📋</span> 1. Synthèse générale</div>
      <div class="card">
        ${this.row('Effectif total inscrit', effectifTotal)}
        ${this.row('Membres actifs', effectifActif)}
        ${this.row('Choristes', choristes.length)}
        ${this.row('Intégrants en cours', integrants.length)}
        ${this.row('Activités réalisées', activitesRealisees)}
        ${this.row('Répétitions tenues', repetitionsTenues)}
        ${this.row('Chants maîtrisés', chantsMaitrises)}
      </div>

      <div class="section-title"><span class="ornament">⚖️</span> 2. Rapport disciplinaire</div>
      <div class="card">
        ${this.row('Taux présence moyen — Samedis', Utils.pct(txSamMoy))}
        ${this.row('Taux présence moyen — Dimanches', Utils.pct(txDimMoy))}
        ${this.row('Membres interdits de prestation', interdits, interdits>0?'var(--red)':null)}
        ${this.row('Sanctions financières émises', sanctionsCount)}
      </div>
      ${interdits>0 ? `
        <div class="alert-banner danger">
          <div class="alert-banner__icon">⛔</div>
          <div><b>Interdits :</b> ${interditsNames.join(', ')}</div>
        </div>` : ''}

      <div class="section-title"><span class="ornament">💰</span> 3. Rapport financier</div>
      <div class="card">
        ${this.row('Cotisations attendues (annuel)', Utils.fmtFCFA(totalDue))}
        ${this.row('Cotisations encaissées', Utils.fmtFCFA(totalPaid))}
        ${this.row('Arriérés', Utils.fmtFCFA(arrears), arrears>0?'var(--red)':null)}
        ${this.row('Taux de recouvrement', Utils.pct(txRecouvrement))}
        ${this.row('Membres à jour', membresAJour)}
        ${this.row('Membres en retard', membresRetard, membresRetard>0?'var(--red)':null)}
        ${this.row('Total offrandes', Utils.fmtFCFA(offrandes))}
        ${this.row('Solde net (Entrées - Sorties)', Utils.fmtFCFA(entrees-sorties), 'var(--green)')}
      </div>

      <div class="section-title"><span class="ornament">🎼</span> 4. Rapport technique & musical</div>
      <div class="card">
        ${this.row('Moyenne musicale chorale', moyMusicaleChorale.toFixed(1)+'/20')}
        ${this.row('Choristes Excellents (≥18)', nivCounts.excellent)}
        ${this.row('Choristes Très bons (15-17)', nivCounts.tresbon)}
        ${this.row('Choristes Bons (12-14)', nivCounts.bon)}
        ${this.row('Choristes à améliorer (<10)', nivCounts.ameliorer, nivCounts.ameliorer>0?'var(--red)':null)}
        ${this.row('Chants maîtrisés', chantsMaitrises)}
        ${this.row('Chants en cours', chantsEnCours)}
      </div>

      <div class="section-title"><span class="ornament">🔍</span> 5. Rapport des intégrants</div>
      <div class="card">
        ${this.row('Intégrants en observation', integrants.length)}
        ${this.row('Éligibles au test', eligibles)}
        ${this.row('Admis', admis, 'var(--green)')}
        ${this.row('Refusés', refuses, refuses>0?'var(--red)':null)}
      </div>

      <div class="section-title"><span class="ornament">🎂</span> 6. Rapport des anniversaires</div>
      <div class="card">
        ${this.row("Aujourd'hui", annivToday.length, annivToday.length?'var(--gold)':null)}
        ${this.row('Dans les 7 prochains jours', annivWeek)}
        ${this.row('Ce mois', annivMonth.length)}
      </div>
      ${annivMonth.length ? `
        <div class="alert-banner gold">
          <div class="alert-banner__icon">🎂</div>
          <div><b>Ce mois :</b> ${annivMonth.join(', ')}</div>
        </div>` : ''}

      <div class="section-title"><span class="ornament">🏆</span> 7. Synthèse IGI</div>
      <div class="card">
        ${this.row('IGI moyen de la chorale', igiMoyen.toFixed(1)+'/100')}
        ${this.row('Choristes Exemplaires (≥90)', exemplaires, 'var(--green)')}
        ${this.row('Choristes Très impliqués (≥75)', tresImpliques)}
        ${this.row('Choristes À accompagner (<35)', accompagner, accompagner>0?'var(--red)':null)}
      </div>

      <div class="grid-2 mt-16">
        <button class="btn secondary block" id="export-data">📤 Exporter (JSON)</button>
        <button class="btn ghost block" id="import-data">📥 Importer</button>
      </div>
      <button class="btn danger block mt-8" id="reset-data">🗑️ Réinitialiser les données</button>
      <input type="file" id="import-file" accept=".json" style="display:none;">
    `;

    main.querySelector('#export-data').addEventListener('click', () => this.exportData());
    main.querySelector('#import-data').addEventListener('click', () => main.querySelector('#import-file').click());
    main.querySelector('#import-file').addEventListener('change', (e) => this.importData(e));
    main.querySelector('#reset-data').addEventListener('click', () => {
      Utils.confirmAction('⚠️ <b>Toutes les données seront effacées</b> et remplacées par les données initiales. Cette action est irréversible. Continuer ?', () => {
        Store.resetAll();
        Utils.toast('Données réinitialisées');
        Router.navigate('dashboard');
      });
    });
  },

  row(label, value, color) {
    return `<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--line);">
      <span class="text-sm text-muted">${label}</span>
      <span style="font-weight:700;${color?'color:'+color+';':''}">${value}</span>
    </div>`;
  },

  exportData() {
    const json = Store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chorale_export_${Utils.todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Utils.toast('Export téléchargé');
  },

  importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      Utils.confirmAction('Importer ce fichier remplacera toutes les données actuelles. Continuer ?', () => {
        const ok = Store.importJSON(evt.target.result);
        if (ok) {
          Utils.toast('Données importées avec succès');
          Router.navigate('dashboard');
        } else {
          Utils.toast('Erreur : fichier invalide');
        }
      });
    };
    reader.readAsText(file);
  },
};
