// ════════════════════════════════════════════════════════════════
// PARAMÈTRES — Règles, tarifs, infos système
// ════════════════════════════════════════════════════════════════

const ParametresModule = {
  render(main) {
    const d = Store.data;
    const storageSize = JSON.stringify(d).length;
    const storageKB = (storageSize/1024).toFixed(1);

    main.innerHTML = `
      <div class="section-title"><span class="ornament">⚙️</span> Configuration</div>
      <div class="card">
        <div class="field">
          <label>Année de gestion</label>
          <input type="number" id="p-annee" value="${d.meta.annee}" min="2020" max="2100">
        </div>
        <button class="btn primary block" id="save-annee">💾 Enregistrer</button>
      </div>

      <div class="section-title"><span class="ornament">💰</span> Tarifs de cotisation</div>
      <div class="card">
        <div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--line);">
          <span class="text-sm text-muted">Choriste / mois</span>
          <span style="font-weight:700;">250 FCFA</span>
        </div>
        <div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--line);">
          <span class="text-sm text-muted">Bureau / mois</span>
          <span style="font-weight:700;">500 FCFA</span>
        </div>
        <div class="flex-between" style="padding:6px 0;">
          <span class="text-sm text-muted">Intégrant / mois</span>
          <span style="font-weight:700;">250 FCFA</span>
        </div>
      </div>

      <div class="section-title"><span class="ornament">📐</span> Règles disciplinaires</div>
      <div class="card">
        <div class="alert-banner info">
          <div class="alert-banner__icon">ℹ️</div>
          <div>
            <b>Règle d'alerte de prestation :</b><br>
            Un membre devient <b>non autorisé à prester</b> dès qu'il cumule <b>2 absences consécutives</b> (justifiées ou non) aux répétitions du samedi.<br><br>
            Une présence enregistrée réinitialise le compteur. Les absences non consécutives ne déclenchent pas l'alerte.
          </div>
        </div>
        <div class="alert-banner success">
          <div class="alert-banner__icon">🎯</div>
          <div><b>Seuils IGI :</b><br>
            🌟 Exemplaire ≥ 90 · ⭐ Très impliqué ≥ 75 · ✔️ Impliqué ≥ 55 · ⚠️ Peu impliqué ≥ 35 · 🆘 À accompagner &lt; 35
          </div>
        </div>
        <div class="alert-banner gold">
          <div class="alert-banner__icon">📝</div>
          <div><b>Admission test d'intégration :</b><br>
            Moyenne ≥ 10/20 requise. Durée minimale d'observation : 2 mois avec assiduité ≥ 70%.
          </div>
        </div>
      </div>

      <div class="section-title"><span class="ornament">💾</span> Stockage</div>
      <div class="card">
        <div class="flex-between">
          <span class="text-sm text-muted">Taille des données</span>
          <span style="font-weight:700;">${storageKB} Ko</span>
        </div>
        <div class="flex-between mt-8">
          <span class="text-sm text-muted">Dernière mise à jour</span>
          <span style="font-weight:700;">${d.meta.lastUpdate ? Utils.fmtDate(d.meta.lastUpdate) : '—'}</span>
        </div>
        <div class="flex-between mt-8">
          <span class="text-sm text-muted">Stockage</span>
          <span style="font-weight:700;">Local (hors-ligne)</span>
        </div>
      </div>

      <div class="section-title"><span class="ornament">ℹ️</span> À propos</div>
      <div class="card center">
        <div class="font-display" style="font-size:1.1rem;font-weight:700;color:var(--maroon);">🎵 Carnet de Chorale</div>
        <div class="text-sm text-muted mt-8">Version 2.0 — Application Web Progressive</div>
        <div class="text-sm text-muted mt-8">Toutes les données sont stockées localement sur votre appareil. Aucune connexion internet requise après installation.</div>
      </div>
    `;

    main.querySelector('#save-annee').addEventListener('click', () => {
      const val = Number(main.querySelector('#p-annee').value);
      if (val) {
        d.meta.annee = val;
        Store.save();
        Utils.toast('Année mise à jour');
      }
    });
  },
};
