// ════════════════════════════════════════════════════════════════
// APP — Point d'entrée, navigation, header dynamique
// ════════════════════════════════════════════════════════════════

const NAV_ITEMS = [
  { key: 'dashboard',     icon: '🏠', label: 'Accueil',   title: 'Tableau de Bord',      subtitle: 'Vue d\'ensemble de la chorale' },
  { key: 'membres',       icon: '👥', label: 'Membres',   title: 'Base de Données',      subtitle: 'Bureau · Choristes · Intégrants' },
  { key: 'discipline',    icon: '⚖️', label: 'Discipline', title: 'Discipline',           subtitle: 'Présences, alertes & sanctions' },
  { key: 'tresorerie',    icon: '💰', label: 'Trésorerie', title: 'Trésorerie',           subtitle: 'Cotisations, offrandes & bilans' },
  { key: 'secretariat',   icon: '📅', label: 'Activités', title: 'Secrétariat',          subtitle: 'Activités, modérateurs & Jeux d\'Anges' },
  { key: 'direction',     icon: '🎼', label: 'Musique',   title: 'Direction Technique',  subtitle: 'Répertoire, évaluations & intégration' },
  { key: 'repetitions',   icon: '🎹', label: 'Répét.',    title: 'Répétitions',          subtitle: 'Registre des séances' },
  { key: 'anniversaires', icon: '🎂', label: 'Anniv.',    title: 'Anniversaires',        subtitle: 'Alertes et calendrier' },
  { key: 'rapports',      icon: '📈', label: 'Rapports',  title: 'Rapports',             subtitle: 'Synthèse automatique' },
  { key: 'parametres',    icon: '⚙️', label: 'Réglages',  title: 'Paramètres',           subtitle: 'Configuration du système' },
];

function buildApp() {
  const app = document.getElementById('app');

  // Header
  const header = document.createElement('div');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header__top">
      <div class="app-header__title"><span class="ornament">🎵</span> <span id="header-title">Chorale</span></div>
      <div class="app-header__year">${Store.data.meta.annee}</div>
    </div>
    <div class="app-header__subtitle" id="header-subtitle">Carnet de gestion</div>
  `;
  app.appendChild(header);

  // Main
  const main = document.createElement('div');
  main.className = 'app-main';
  main.id = 'app-main';
  app.appendChild(main);

  // Bottom nav
  const nav = document.createElement('div');
  nav.className = 'app-nav';
  nav.innerHTML = NAV_ITEMS.map(item => `
    <button class="nav-item" data-route="${item.key}">
      <span class="nav-item__icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');
  app.appendChild(nav);

  nav.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.route));
  });

  // Register routes
  Router.register('dashboard', (m) => DashboardModule.render(m));
  Router.register('membres', (m) => MembresModule.render(m));
  Router.register('discipline', (m) => DisciplineModule.render(m));
  Router.register('tresorerie', (m) => TresorerieModule.render(m));
  Router.register('secretariat', (m) => SecretariatModule.render(m));
  Router.register('direction', (m) => DirectionModule.render(m));
  Router.register('repetitions', (m) => RepetitionsModule.render(m));
  Router.register('anniversaires', (m) => AnniversairesModule.render(m));
  Router.register('rapports', (m) => RapportsModule.render(m));
  Router.register('parametres', (m) => ParametresModule.render(m));

  // Update header on navigation
  const origRender = Router.render.bind(Router);
  Router.render = function(params) {
    origRender(params);
    const item = NAV_ITEMS.find(i => i.key === Router.current);
    if (item) {
      document.getElementById('header-title').textContent = item.title;
      document.getElementById('header-subtitle').textContent = item.subtitle;
    }
  };

  Router.init();
}

// ── PWA Install prompt ──
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  if (localStorage.getItem('install_dismissed')) return;
  if (document.querySelector('.install-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'install-banner';
  banner.innerHTML = `
    <span>📲 Installer l'app sur votre écran d'accueil ?</span>
    <button id="install-yes">Installer</button>
    <button class="dismiss" id="install-no">✕</button>
  `;
  document.body.appendChild(banner);
  banner.querySelector('#install-yes').addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    }
    banner.remove();
  });
  banner.querySelector('#install-no').addEventListener('click', () => {
    localStorage.setItem('install_dismissed', '1');
    banner.remove();
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  Store.load();
  buildApp();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  }
});
