// ════════════════════════════════════════════════════════════════
// DIRECTION TECHNIQUE — Répertoire, Évaluations, Intégrants, Tests
// ════════════════════════════════════════════════════════════════

const DirectionModule = {
  tab: 'evaluations',

  CRIT_EVAL: [
    'Exécution sans paroles','Justesse vocale','Lecture de portée','Respect tonalité',
    'Respect rythme','Harmonie pupitre','Maintien de voix',"Capacité d'écoute",
    'Reproduction mélodie','Adaptation modulations','Présence scénique','Assurance',
    'Travail personnel','Discipline musicale'
  ],
  CRIT_TEST: [
    'Chant sans paroles','Justesse','Lecture portée','Interprétation','Modulations',
    'Harmonie','Maintien voix','Rythme','Reproduction mélodie','Retrouver sa note','Assurance'
  ],

  render(main) {
    const tabs = [
      { key: 'evaluations', label: '⭐ Évaluations' },
      { key: 'repertoire', label: '🎵 Répertoire' },
      { key: 'integrants', label: '🔍 Intégrants' },
    ];

    main.innerHTML = `
      <div class="tabbar">
        ${tabs.map(t => `<button class="tab-btn ${this.tab===t.key?'active':''}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="dt-content"></div>
    `;

    main.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { this.tab = btn.dataset.tab; this.render(main); });
    });

    const content = main.querySelector('#dt-content');
    if (this.tab === 'evaluations') this.renderEvaluations(content);
    else if (this.tab === 'repertoire') this.renderRepertoire(content, main);
    else this.renderIntegrants(content);
  },

  // ── ÉVALUATIONS MUSICALES ──
  renderEvaluations(container) {
    const choristes = Store.data.membres.filter(m=>m.statut==='Choriste').sort((a,b)=>a.nom.localeCompare(b.nom));

    let sumMoy = 0, count = 0;
    const rows = choristes.map(m => {
      const ev = Store.getEvaluation(m.id);
      let moy = 0;
      if (ev && ev.notes) {
        const vals = Object.values(ev.notes);
        moy = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      }
      sumMoy += moy; count++;
      return { membre: m, moy };
    });
    const moyChorale = count ? sumMoy/count : 0;

    container.innerHTML = `
      <div class="card center">
        <div class="text-sm text-muted">Moyenne musicale de la chorale</div>
        <div class="font-display" style="font-size:1.8rem;font-weight:700;color:var(--maroon);">${moyChorale.toFixed(1)}<span style="font-size:1rem;color:var(--ink-soft);">/20</span></div>
      </div>
      <div class="list">
        ${rows.sort((a,b)=>b.moy-a.moy).map(r => {
          const niveau = this.niveauLabel(r.moy);
          return `
            <div class="list-row" data-id="${r.membre.id}">
              <div class="list-row__avatar">${Utils.initials(r.membre.nom)}</div>
              <div class="list-row__body">
                <div class="list-row__title">${Utils.escapeHtml(r.membre.nom)}</div>
                <div class="list-row__subtitle">${r.membre.pupitre || '—'}</div>
              </div>
              <div class="list-row__meta">
                <div style="font-weight:700;font-size:1rem;">${r.moy.toFixed(1)}/20</div>
                <div class="text-sm">${niveau}</div>
              </div>
              <span class="list-row__chevron">›</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => this.openEvaluationForm(row.dataset.id));
    });
  },

  niveauLabel(moy) {
    if (moy >= 18) return '🌟 Excellent';
    if (moy >= 15) return '⭐ Très bon';
    if (moy >= 12) return '✔️ Bon';
    if (moy >= 10) return '⚠️ Moyen';
    return '🔴 À améliorer';
  },

  openEvaluationForm(membreId) {
    const m = Store.getMembre(membreId);
    const ev = Store.getEvaluation(membreId) || { notes: {} };

    const html = `
      <div class="text-sm text-muted" style="margin-bottom:10px;">Notation de 0 à 20 pour chaque critère</div>
      ${this.CRIT_EVAL.map((crit, i) => {
        const val = ev.notes[crit] !== undefined ? ev.notes[crit] : 10;
        return `
          <div class="field">
            <label>${crit} <span style="float:right;font-weight:700;color:var(--maroon);" id="val-${i}">${val}</span></label>
            <input type="range" min="0" max="20" step="1" value="${val}" data-crit="${Utils.escapeHtml(crit)}" data-idx="${i}" style="width:100%;">
          </div>
        `;
      }).join('')}
      <div class="card center mt-8">
        <div class="text-sm text-muted">Moyenne</div>
        <div class="font-display" id="eval-avg" style="font-size:1.5rem;font-weight:700;color:var(--maroon);">0.0/20</div>
      </div>
      <button class="btn primary block mt-16" id="save-eval">💾 Enregistrer l'évaluation</button>
    `;

    const sheet = Utils.openSheet(`⭐ ${m.nom}`, html);

    const updateAvg = () => {
      const sliders = sheet.querySelectorAll('[data-crit]');
      let sum = 0;
      sliders.forEach(s => sum += Number(s.value));
      const avg = sum / sliders.length;
      sheet.querySelector('#eval-avg').textContent = avg.toFixed(1) + '/20';
    };

    sheet.querySelectorAll('[data-crit]').forEach(slider => {
      slider.addEventListener('input', () => {
        sheet.querySelector('#val-' + slider.dataset.idx).textContent = slider.value;
        updateAvg();
      });
    });
    updateAvg();

    sheet.querySelector('#save-eval').addEventListener('click', () => {
      const notes = {};
      sheet.querySelectorAll('[data-crit]').forEach(s => { notes[s.dataset.crit] = Number(s.value); });
      Store.setEvaluation(membreId, { notes, date: Utils.todayISO() });
      Utils.closeSheet();
      Utils.toast('Évaluation enregistrée');
      Router.render();
    });
  },

  // ── RÉPERTOIRE ──
  renderRepertoire(container, main) {
    const chants = Store.getRepertoire();
    const maitrises = chants.filter(c=>c.statut==='Maîtrisé').length;
    const enCours = chants.filter(c=>c.statut==='En cours').length;

    container.innerHTML = `
      <div class="grid-2">
        <div class="card center">
          <div class="kpi-card__value" style="color:var(--green);">${maitrises}</div>
          <div class="kpi-card__label">Maîtrisés</div>
        </div>
        <div class="card center">
          <div class="kpi-card__value" style="color:var(--gold);">${enCours}</div>
          <div class="kpi-card__label">En cours</div>
        </div>
      </div>
      <div id="chant-list"></div>
    `;

    if (!chants.length) {
      container.querySelector('#chant-list').innerHTML = `<div class="empty-state"><div class="empty-state__icon">🎵</div><div class="empty-state__text">Aucun chant dans le répertoire</div></div>`;
    } else {
      container.querySelector('#chant-list').innerHTML = `<div class="list">${chants.map(c => {
        const statusClass = c.statut==='Maîtrisé'?'actif':c.statut==='À apprendre'?'suspendu':c.statut==='À réviser'?'integrant':'bureau';
        return `
          <div class="list-row" data-id="${c.id}">
            <div class="list-row__avatar">🎵</div>
            <div class="list-row__body">
              <div class="list-row__title">${Utils.escapeHtml(c.titre)}</div>
              <div class="list-row__subtitle">${c.categorie || '—'} ${c.tonalite?'· '+c.tonalite:''}</div>
            </div>
            <span class="pill ${statusClass}">${c.statut}</span>
          </div>
        `;
      }).join('')}</div>`;

      container.querySelectorAll('.list-row').forEach(row => {
        row.addEventListener('click', () => this.openChantDetail(row.dataset.id));
      });
    }

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.id = 'fab-add-chant';
    main.appendChild(fab);
    fab.addEventListener('click', () => this.openChantForm());
  },

  openChantDetail(id) {
    const c = Store.data.repertoire.find(x=>x.id===id);
    const html = `
      <div class="field">
        <label>Statut</label>
        <select id="c-statut">
          ${['À apprendre','En cours','Maîtrisé','À réviser','Archivé'].map(s=>`<option value="${s}" ${c.statut===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Niveau de maîtrise</label>
        <select id="c-niveau">
          ${['1-Débutant','2-En cours','3-Intermédiaire','4-Avancé','5-Maîtrisé'].map(s=>`<option value="${s}" ${c.niveau===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="grid-2 mt-16">
        <button class="btn danger block" id="del-chant">🗑️ Supprimer</button>
        <button class="btn primary block" id="save-chant">💾 Enregistrer</button>
      </div>
    `;
    const sheet = Utils.openSheet(c.titre, html);
    sheet.querySelector('#save-chant').addEventListener('click', () => {
      Store.updateChant(id, {
        statut: sheet.querySelector('#c-statut').value,
        niveau: sheet.querySelector('#c-niveau').value,
      });
      Utils.closeSheet();
      Utils.toast('Chant mis à jour');
      Router.render();
    });
    sheet.querySelector('#del-chant').addEventListener('click', () => {
      Utils.confirmAction('Supprimer ce chant du répertoire ?', () => {
        Store.deleteChant(id);
        Utils.closeSheet();
        Utils.toast('Chant supprimé');
        Router.render();
      });
    });
  },

  openChantForm() {
    const html = `
      <div class="field">
        <label>Titre</label>
        <input type="text" id="cf-titre" placeholder="Titre du chant">
      </div>
      <div class="field">
        <label>Auteur / Compositeur</label>
        <input type="text" id="cf-auteur">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Tonalité</label>
          <input type="text" id="cf-tonalite" placeholder="Ex: Ré majeur">
        </div>
        <div class="field">
          <label>Catégorie</label>
          <select id="cf-cat">
            <option>Gospel</option><option>Louange</option><option>Adoration</option>
            <option>Cantique</option><option>Contemporain</option><option>Traditionnel</option><option>Autre</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Statut</label>
        <select id="cf-statut">
          <option>À apprendre</option><option>En cours</option><option>Maîtrisé</option><option>À réviser</option>
        </select>
      </div>
      <button class="btn primary block" id="save-new-chant">💾 Ajouter au répertoire</button>
    `;
    const sheet = Utils.openSheet('Nouveau chant', html);
    sheet.querySelector('#save-new-chant').addEventListener('click', () => {
      const titre = sheet.querySelector('#cf-titre').value.trim();
      if (!titre) { Utils.toast('Le titre est requis'); return; }
      Store.addChant({
        id: Utils.genId('chant'),
        titre,
        auteur: sheet.querySelector('#cf-auteur').value,
        tonalite: sheet.querySelector('#cf-tonalite').value,
        categorie: sheet.querySelector('#cf-cat').value,
        statut: sheet.querySelector('#cf-statut').value,
        niveau: '1-Débutant',
        dateApprentissage: Utils.todayISO(),
      });
      Utils.closeSheet();
      Utils.toast('Chant ajouté');
      Router.render();
    });
  },

  // ── INTÉGRANTS ──
  renderIntegrants(container) {
    const integrants = Store.data.membres.filter(m=>m.statut==='Intégrant').sort((a,b)=>a.nom.localeCompare(b.nom));

    if (!integrants.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🔍</div><div class="empty-state__text">Aucun intégrant enregistré</div></div>`;
      return;
    }

    container.innerHTML = `<div class="list">${integrants.map(m => {
      const dis = Store.getDisciplineStats(m.id);
      const test = Store.getTestIntegration(m.id);
      let result = '⏳ En observation';
      let pillClass = 'integrant';
      if (test && test.moyenne) {
        if (test.moyenne >= 10) { result = '✅ Admis'; pillClass = 'actif'; }
        else { result = '❌ Refusé'; pillClass = 'suspendu'; }
      } else if (dis.total >= 2 && dis.txSamedi >= 0.7) {
        result = '✅ Éligible au test';
        pillClass = 'actif';
      }
      return `
        <div class="list-row" data-id="${m.id}">
          <div class="list-row__avatar">${Utils.initials(m.nom)}</div>
          <div class="list-row__body">
            <div class="list-row__title">${Utils.escapeHtml(m.nom)}</div>
            <div class="list-row__subtitle">Tx présence : ${Utils.pct(dis.txSamedi)} · ${dis.total} séances</div>
          </div>
          <span class="pill ${pillClass}">${result}</span>
        </div>
      `;
    }).join('')}</div>`;

    container.querySelectorAll('.list-row').forEach(row => {
      row.addEventListener('click', () => this.openTestForm(row.dataset.id));
    });
  },

  openTestForm(membreId) {
    const m = Store.getMembre(membreId);
    const test = Store.getTestIntegration(membreId) || { notes: {} };

    const html = `
      <div class="text-sm text-muted" style="margin-bottom:10px;">Test d'intégration — Notation de 0 à 20</div>
      ${this.CRIT_TEST.map((crit, i) => {
        const val = test.notes[crit] !== undefined ? test.notes[crit] : 10;
        return `
          <div class="field">
            <label>${crit} <span style="float:right;font-weight:700;color:var(--maroon);" id="tval-${i}">${val}</span></label>
            <input type="range" min="0" max="20" step="1" value="${val}" data-tcrit="${Utils.escapeHtml(crit)}" data-tidx="${i}" style="width:100%;">
          </div>
        `;
      }).join('')}
      <div class="card center mt-8">
        <div class="text-sm text-muted">Moyenne</div>
        <div class="font-display" id="test-avg" style="font-size:1.5rem;font-weight:700;color:var(--maroon);">0.0/20</div>
        <div class="text-sm mt-8" id="test-result">—</div>
      </div>
      <button class="btn primary block mt-16" id="save-test">💾 Enregistrer le test</button>
    `;

    const sheet = Utils.openSheet(`📝 Test — ${m.nom}`, html);

    const updateAvg = () => {
      const sliders = sheet.querySelectorAll('[data-tcrit]');
      let sum = 0;
      sliders.forEach(s => sum += Number(s.value));
      const avg = sum / sliders.length;
      sheet.querySelector('#test-avg').textContent = avg.toFixed(2) + '/20';
      const resultEl = sheet.querySelector('#test-result');
      if (avg >= 10) {
        resultEl.innerHTML = '<span class="pill actif">✅ ADMIS (≥10/20)</span>';
      } else {
        resultEl.innerHTML = '<span class="pill suspendu">❌ REFUSÉ (&lt;10/20)</span>';
      }
    };

    sheet.querySelectorAll('[data-tcrit]').forEach(slider => {
      slider.addEventListener('input', () => {
        sheet.querySelector('#tval-' + slider.dataset.tidx).textContent = slider.value;
        updateAvg();
      });
    });
    updateAvg();

    sheet.querySelector('#save-test').addEventListener('click', () => {
      const notes = {};
      sheet.querySelectorAll('[data-tcrit]').forEach(s => { notes[s.dataset.tcrit] = Number(s.value); });
      const vals = Object.values(notes);
      const moyenne = vals.reduce((a,b)=>a+b,0)/vals.length;
      Store.setTestIntegration(membreId, { notes, moyenne, date: Utils.todayISO() });

      if (moyenne >= 10) {
        Utils.closeSheet();
        Utils.confirmAction(`${m.nom} est admis avec ${moyenne.toFixed(2)}/20. Le faire passer au statut <b>Choriste</b> ?`, () => {
          const newId = Store.nextMemberId('Choriste');
          Store.deleteMembre(membreId);
          m.statut = 'Choriste';
          m.id = newId;
          Store.upsertMembre(m);
          Utils.toast(`${m.nom} est maintenant Choriste !`);
          Router.render();
        });
      } else {
        Utils.closeSheet();
        Utils.toast('Test enregistré');
        Router.render();
      }
    });
  },
};
