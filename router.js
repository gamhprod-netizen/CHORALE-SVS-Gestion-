// ════════════════════════════════════════════════════════════════
// ROUTER — navigation entre modules (SPA simple)
// ════════════════════════════════════════════════════════════════

const Router = {
  routes: {},
  current: null,

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  navigate(name, params) {
    this.current = name;
    window.location.hash = '#' + name;
    this.render(params);
    this.updateNav();
    document.getElementById('app-main').scrollTop = 0;
  },

  render(params) {
    const main = document.getElementById('app-main');
    const fn = this.routes[this.current];
    if (fn) {
      main.innerHTML = '';
      fn(main, params);
    } else {
      main.innerHTML = '<div class="empty-state"><div class="empty-state__icon">??</div><div class="empty-state__text">Page introuvable</div></div>';
    }
  },

  updateNav() {
    document.querySelectorAll('.nav-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.route === Router.current);
    });
  },

  init() {
    const initial = (window.location.hash || '#dashboard').slice(1);
    this.current = this.routes[initial] ? initial : 'dashboard';
    this.render();
    this.updateNav();

    window.addEventListener('hashchange', () => {
      const r = window.location.hash.slice(1);
      if (this.routes[r]) {
        this.current = r;
        this.render();
        this.updateNav();
      }
    });
  },
};
