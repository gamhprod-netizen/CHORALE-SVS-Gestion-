// Données initiales — extraites du système Excel
const SEED_DATA = {
  meta: {
    annee: 2026,
    version: '2.0',
    lastUpdate: null,
  },

  // ── BUREAU ──
  membres: [
    // Bureau
    { id: 'B001', nom: 'Gédéon',     prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Directeur de Chœur Principal', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B002', nom: 'Bénédicte',  prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Directrice de Chœur Adjointe', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B003', nom: 'Joseph',     prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Président', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B004', nom: 'Ozias',      prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Secrétaire Général', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B005', nom: 'Roséline',   prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Trésorière Principale', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B006', nom: 'Christiane', prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Trésorière Adjointe', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B007', nom: 'Mme Traoré', prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Chargée de Discipline Principale', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'B008', nom: 'Evodie',     prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Chargée de Discipline Adjointe', statut: 'Bureau', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },

    // Choristes
    { id: 'C001', nom: 'Alliisa',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C002', nom: 'Bénédiv',      prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Ténor', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C003', nom: 'Claudia',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C004', nom: 'Aurore',       prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C005', nom: 'Djamila',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C006', nom: 'Elysée',       prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Ténor', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C007', nom: 'Emilie',       prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C008', nom: 'Emma',         prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C009', nom: 'Fadila',       prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C010', nom: 'Kader',        prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Basse', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C011', nom: 'Suzanne',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C012', nom: 'Grâce',        prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C013', nom: 'Jonas',        prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Ténor', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C014', nom: 'Joël',         prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Basse', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C015', nom: 'Céleste',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Mezzo-Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C016', nom: 'Lucien',       prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Baryton', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C017', nom: 'Meg',          prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C018', nom: 'Océane',       prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C019', nom: 'Jean Baptiste',prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Ténor', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C020', nom: 'Rachelle',     prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C021', nom: 'Mme Mambo',    prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Mezzo-Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C022', nom: 'Wilfried',     prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Baryton', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C023', nom: 'Vanessa',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C024', nom: 'Exaucée',      prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Alto', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'C025', nom: 'Carmelle',     prenom: '', sexe: 'F', dateNaissance: '', telephone: '', adresse: '', pupitre: 'Soprano', fonction: 'Choriste', statut: 'Choriste', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },

    // Intégrants
    { id: 'I001', nom: 'Arthur',    prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Intégrant', statut: 'Intégrant', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'I002', nom: 'Christian', prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Intégrant', statut: 'Intégrant', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'I003', nom: 'Franco',    prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Intégrant', statut: 'Intégrant', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'I004', nom: 'Kévin',     prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Intégrant', statut: 'Intégrant', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
    { id: 'I005', nom: 'Gamaliel',  prenom: '', sexe: 'M', dateNaissance: '', telephone: '', adresse: '', pupitre: '', fonction: 'Intégrant', statut: 'Intégrant', dateEntree: '2026-01-01', situation: 'Actif', email: '', observations: '' },
  ],

  // ── PRÉSENCES (séances) ──
  // structure: { id, date, type: 'samedi'|'dimanche', presences: { membreId: statut } }
  seances: [],

  // ── ÉVALUATIONS MUSICALES ──
  // { membreId: { critères..., date } }
  evaluations: {},

  // ── COTISATIONS ──
  // { membreId: { '2026-01': montant, ... } }
  cotisations: {},

  // ── OFFRANDES ──
  offrandes: [],

  // ── MOUVEMENTS FINANCIERS ──
  mouvements: [],

  // ── SANCTIONS ──
  sanctions: [],

  // ── ACTIVITÉS ──
  activites: [],

  // ── MODÉRATEURS ──
  moderations: [],

  // ── JEUX D'ANGES ──
  jeuxAnges: [],

  // ── RÉPERTOIRE ──
  repertoire: [],

  // ── RÉPÉTITIONS ──
  repetitions: [],

  // ── TESTS INTÉGRATION ──
  testsIntegration: {},
};

if (typeof module !== 'undefined') module.exports = SEED_DATA;
