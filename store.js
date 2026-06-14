// ════════════════════════════════════════════════════════════════
// STORE — Gestion centralisée des données + persistance localStorage
// ════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chorale_data_v2';

const Store = {
  data: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        // Merge any new fields from seed (forward compatibility)
        this.data = Object.assign({}, structuredClone(SEED_DATA), this.data);
      } else {
        this.data = structuredClone(SEED_DATA);
        this.save();
      }
    } catch (e) {
      console.error('Erreur chargement données', e);
      this.data = structuredClone(SEED_DATA);
    }
    return this.data;
  },

  save() {
    this.data.meta.lastUpdate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },

  // ── MEMBRES ──
  getMembres(filter) {
    let list = this.data.membres;
    if (filter) {
      if (filter.statut) list = list.filter(m => m.statut === filter.statut);
      if (filter.situation) list = list.filter(m => m.situation === filter.situation);
      if (filter.search) {
        const s = filter.search.toLowerCase();
        list = list.filter(m => (m.nom + ' ' + m.prenom).toLowerCase().includes(s));
      }
    }
    return list;
  },

  getMembre(id) {
    return this.data.membres.find(m => m.id === id);
  },

  upsertMembre(membre) {
    const idx = this.data.membres.findIndex(m => m.id === membre.id);
    if (idx >= 0) this.data.membres[idx] = membre;
    else this.data.membres.push(membre);
    this.save();
  },

  deleteMembre(id) {
    this.data.membres = this.data.membres.filter(m => m.id !== id);
    this.save();
  },

  nextMemberId(statut) {
    const prefix = statut === 'Bureau' ? 'B' : statut === 'Intégrant' ? 'I' : 'C';
    const existing = this.data.membres
      .filter(m => m.id.startsWith(prefix))
      .map(m => parseInt(m.id.slice(1), 10))
      .filter(n => !isNaN(n));
    const max = existing.length ? Math.max(...existing) : 0;
    return prefix + String(max + 1).padStart(3, '0');
  },

  // ── SÉANCES (présences) ──
  getSeances(type) {
    let list = this.data.seances;
    if (type) list = list.filter(s => s.type === type);
    return list.sort((a,b) => b.date.localeCompare(a.date));
  },

  getSeance(id) {
    return this.data.seances.find(s => s.id === id);
  },

  upsertSeance(seance) {
    const idx = this.data.seances.findIndex(s => s.id === seance.id);
    if (idx >= 0) this.data.seances[idx] = seance;
    else this.data.seances.push(seance);
    this.save();
  },

  deleteSeance(id) {
    this.data.seances = this.data.seances.filter(s => s.id !== id);
    this.save();
  },

  // Compute consecutive-absence alert per member (samedi only)
  // Rule: 2+ consecutive 'Absence justifiée' or 'Absence non justifiée' on samedi sessions
  getDisciplineStats(membreId) {
    const samedis = this.getSeances('samedi').sort((a,b) => a.date.localeCompare(b.date));
    const dimanches = this.getSeances('dimanche');

    let counts = { present:0, retardJ:0, retardNJ:0, absJ:0, absNJ:0, voyage:0, total:0 };
    let consecutive = 0, maxConsecutive = 0;

    samedis.forEach(s => {
      const st = s.presences[membreId];
      if (!st || st === '—') return;
      counts.total++;
      switch(st) {
        case 'Présent': counts.present++; consecutive = 0; break;
        case 'Retard justifié': counts.retardJ++; consecutive = 0; break;
        case 'Retard non justifié': counts.retardNJ++; consecutive = 0; break;
        case 'Absence justifiée': counts.absJ++; consecutive++; break;
        case 'Absence non justifiée': counts.absNJ++; consecutive++; break;
        case 'Voyage': counts.voyage++; consecutive = 0; break;
      }
      if (consecutive > maxConsecutive) maxConsecutive = consecutive;
    });

    const txSamedi = counts.total > 0 ? counts.present / counts.total : 0;

    // Dimanche stats
    let dimCounts = { present:0, total:0 };
    dimanches.forEach(s => {
      const st = s.presences[membreId];
      if (!st || st === '—') return;
      dimCounts.total++;
      if (st === 'Présent') dimCounts.present++;
    });
    const txDimanche = dimCounts.total > 0 ? dimCounts.present / dimCounts.total : 0;

    const interdit = maxConsecutive >= 2;
    // also check the LAST run (current streak) for live alert
    let currentStreak = 0;
    for (let i = samedis.length - 1; i >= 0; i--) {
      const st = samedis[i].presences[membreId];
      if (!st || st === '—') continue;
      if (st === 'Absence justifiée' || st === 'Absence non justifiée') currentStreak++;
      else break;
    }

    return {
      ...counts,
      txSamedi, txDimanche,
      maxConsecutive,
      currentStreak,
      interdit: currentStreak >= 2,
    };
  },

  // ── ÉVALUATIONS ──
  getEvaluation(membreId) {
    return this.data.evaluations[membreId] || null;
  },
  setEvaluation(membreId, evalData) {
    this.data.evaluations[membreId] = evalData;
    this.save();
  },

  // ── COTISATIONS ──
  getCotisation(membreId, monthKey) {
    return (this.data.cotisations[membreId] || {})[monthKey] || 0;
  },
  setCotisation(membreId, monthKey, montant) {
    if (!this.data.cotisations[membreId]) this.data.cotisations[membreId] = {};
    this.data.cotisations[membreId][monthKey] = montant;
    this.save();
  },
  getCotisationDue(membre) {
    if (membre.statut === 'Bureau') return 500;
    return 250;
  },

  // ── OFFRANDES ──
  getOffrandes() { return this.data.offrandes.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addOffrande(o) { this.data.offrandes.push(o); this.save(); },
  deleteOffrande(id) { this.data.offrandes = this.data.offrandes.filter(o=>o.id!==id); this.save(); },

  // ── MOUVEMENTS ──
  getMouvements() { return this.data.mouvements.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addMouvement(m) { this.data.mouvements.push(m); this.save(); },
  deleteMouvement(id) { this.data.mouvements = this.data.mouvements.filter(m=>m.id!==id); this.save(); },

  // ── SANCTIONS ──
  getSanctions() { return this.data.sanctions.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addSanction(s) { this.data.sanctions.push(s); this.save(); },
  updateSanction(id, patch) {
    const s = this.data.sanctions.find(x=>x.id===id);
    if (s) Object.assign(s, patch);
    this.save();
  },
  deleteSanction(id) { this.data.sanctions = this.data.sanctions.filter(s=>s.id!==id); this.save(); },

  // ── ACTIVITÉS ──
  getActivites() { return this.data.activites.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addActivite(a) { this.data.activites.push(a); this.save(); },
  updateActivite(id, patch) {
    const a = this.data.activites.find(x=>x.id===id);
    if (a) Object.assign(a, patch);
    this.save();
  },
  deleteActivite(id) { this.data.activites = this.data.activites.filter(a=>a.id!==id); this.save(); },

  // ── MODÉRATIONS ──
  getModerations() { return this.data.moderations.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addModeration(m) { this.data.moderations.push(m); this.save(); },
  deleteModeration(id) { this.data.moderations = this.data.moderations.filter(m=>m.id!==id); this.save(); },

  // ── JEUX D'ANGES ──
  getJeuxAnges() { return this.data.jeuxAnges.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addJeuAnge(j) { this.data.jeuxAnges.push(j); this.save(); },
  deleteJeuAnge(id) { this.data.jeuxAnges = this.data.jeuxAnges.filter(j=>j.id!==id); this.save(); },

  // ── RÉPERTOIRE ──
  getRepertoire() { return this.data.repertoire.slice(); },
  addChant(c) { this.data.repertoire.push(c); this.save(); },
  updateChant(id, patch) {
    const c = this.data.repertoire.find(x=>x.id===id);
    if (c) Object.assign(c, patch);
    this.save();
  },
  deleteChant(id) { this.data.repertoire = this.data.repertoire.filter(c=>c.id!==id); this.save(); },

  // ── RÉPÉTITIONS ──
  getRepetitions() { return this.data.repetitions.slice().sort((a,b)=>b.date.localeCompare(a.date)); },
  addRepetition(r) { this.data.repetitions.push(r); this.save(); },
  updateRepetition(id, patch) {
    const r = this.data.repetitions.find(x=>x.id===id);
    if (r) Object.assign(r, patch);
    this.save();
  },
  deleteRepetition(id) { this.data.repetitions = this.data.repetitions.filter(r=>r.id!==id); this.save(); },

  // ── TESTS INTÉGRATION ──
  getTestIntegration(membreId) { return this.data.testsIntegration[membreId] || null; },
  setTestIntegration(membreId, testData) {
    this.data.testsIntegration[membreId] = testData;
    this.save();
  },

  // ── IGI CALCULATION ──
  calcIGI(membreId) {
    const membre = this.getMembre(membreId);
    if (!membre) return null;

    // Discipline score /25
    const dis = this.getDisciplineStats(membreId);
    const scoreDiscipline = Math.round(dis.txSamedi * 25 * 10) / 10;

    // Trésorerie score /25
    const monthKeys = [];
    const year = this.data.meta.annee;
    for (let m=1;m<=12;m++) monthKeys.push(`${year}-${String(m).padStart(2,'0')}`);
    const due = this.getCotisationDue(membre) * 12;
    const paid = monthKeys.reduce((sum,k)=>sum + this.getCotisation(membreId,k), 0);
    const txCotis = due > 0 ? Math.min(paid/due, 1) : 0;
    const scoreTresorerie = Math.round(txCotis * 25 * 10) / 10;

    // Secrétariat score /25 — based on moderation count (simple heuristic)
    const modCount = this.data.moderations.filter(m => m.moderateur === membre.nom).length;
    const scoreSecretariat = Math.min(Math.round(modCount * 5 * 10)/10, 25);

    // Musical score /25
    const evalData = this.getEvaluation(membreId);
    let moyMusicale = 0;
    if (evalData && evalData.notes) {
      const vals = Object.values(evalData.notes);
      moyMusicale = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    }
    const scoreMusical = Math.round((moyMusicale/20)*25*10)/10;

    const igi = Math.round((scoreDiscipline + scoreTresorerie + scoreSecretariat + scoreMusical)*10)/10;

    let categorie;
    if (igi >= 90) categorie = '🌟 Exemplaire';
    else if (igi >= 75) categorie = '⭐ Très impliqué';
    else if (igi >= 55) categorie = '✔️ Impliqué';
    else if (igi >= 35) categorie = '⚠️ Peu impliqué';
    else categorie = '🆘 À accompagner';

    return {
      scoreDiscipline, scoreTresorerie, scoreSecretariat, scoreMusical,
      igi, categorie, txSamedi: dis.txSamedi, txDimanche: dis.txDimanche,
      txCotis, moyMusicale, alertePrestation: dis.interdit,
    };
  },

  // ── ANNIVERSAIRES ──
  getAnniversaireInfo(membre) {
    if (!membre.dateNaissance) return null;
    const dob = new Date(membre.dateNaissance);
    const today = new Date();
    today.setHours(0,0,0,0);

    const age = today.getFullYear() - dob.getFullYear() -
      ((today.getMonth() < dob.getMonth() || (today.getMonth()===dob.getMonth() && today.getDate()<dob.getDate())) ? 1 : 0);

    let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < today) next = new Date(today.getFullYear()+1, dob.getMonth(), dob.getDate());

    const daysRemaining = Math.round((next - today) / (1000*60*60*24));
    const isToday = dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    const isThisMonth = dob.getMonth() === today.getMonth();
    const isThisWeek = daysRemaining >= 0 && daysRemaining <= 7;

    return { age, nextDate: next, daysRemaining, isToday, isThisMonth, isThisWeek };
  },

  // ── EXPORT / IMPORT ──
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  },
  importJSON(json) {
    try {
      const parsed = JSON.parse(json);
      this.data = parsed;
      this.save();
      return true;
    } catch(e) {
      console.error('Import error', e);
      return false;
    }
  },
  resetAll() {
    this.data = structuredClone(SEED_DATA);
    this.save();
  },
};
