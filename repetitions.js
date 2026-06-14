// ════════════════════════════════════════════════════════════════
// RÉPÉTITIONS — Registre des séances de répétition
// ════════════════════════════════════════════════════════════════

const RepetitionsModule = {
  render(main) {
    const reps = Store.getRepetitions();
    const tenues = reps.filter(function(r){return r.statut==='Tenue';}).length;
    const annulees = reps.filter(function(r){return r.statut==='Annulée';}).length;

    main.innerHTML =
      '<div class="grid-2">' +
        '<div class="card center"><div class="kpi-card__value" style="color:var(--green);">' + tenues + '</div><div class="kpi-card__label">Tenues</div></div>' +
        '<div class="card center"><div class="kpi-card__value" style="color:var(--red);">' + annulees + '</div><div class="kpi-card__label">Annulées</div></div>' +
      '</div>' +
      '<div id="rep-list"></div>';

    var listEl = main.querySelector('#rep-list');
    if (!reps.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🎹</div><div class="empty-state__text">Aucune répétition enregistrée</div></div>';
    } else {
      listEl.innerHTML = '<div class="list">' + reps.map(function(r) {
        var statusClass = r.statut==='Tenue'?'actif':r.statut==='Annulée'?'suspendu':'integrant';
        return '<div class="list-row" data-id="' + r.id + '">' +
          '<div class="list-row__avatar">🎹</div>' +
          '<div class="list-row__body">' +
            '<div class="list-row__title">' + Utils.escapeHtml(r.type) + '</div>' +
            '<div class="list-row__subtitle">' + Utils.fmtDate(r.date) + (r.responsable?' · '+Utils.escapeHtml(r.responsable):'') + '</div>' +
          '</div>' +
          '<span class="pill ' + statusClass + '">' + r.statut + '</span>' +
        '</div>';
      }).join('') + '</div>';

      listEl.querySelectorAll('.list-row').forEach(function(row) {
        row.addEventListener('click', function() { RepetitionsModule.openDetail(row.dataset.id); });
      });
    }

    var fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    main.appendChild(fab);
    fab.addEventListener('click', function() { RepetitionsModule.openForm(); });
  },

  openDetail(id) {
    var r = Store.data.repetitions.find(function(x){return x.id===id;});
    var html =
      '<div class="field"><label>Statut</label><select id="r-statut">' +
        ['Tenue','Reportée','Annulée'].map(function(s){return '<option value="'+s+'" '+(r.statut===s?'selected':'')+'>'+s+'</option>';}).join('') +
      '</select></div>' +
      '<div class="field"><label>Chants travaillés</label><input type="text" id="r-chants" value="' + Utils.escapeHtml(r.chants||'') + '"></div>' +
      '<div class="field"><label>Résultats</label><textarea id="r-resultats" rows="2">' + Utils.escapeHtml(r.resultats||'') + '</textarea></div>' +
      '<div class="field"><label>Difficultés notées</label><textarea id="r-diff" rows="2">' + Utils.escapeHtml(r.difficultes||'') + '</textarea></div>' +
      '<div class="grid-2 mt-16">' +
        '<button class="btn danger block" id="del-rep">🗑️ Supprimer</button>' +
        '<button class="btn primary block" id="save-rep">💾 Enregistrer</button>' +
      '</div>';

    var sheet = Utils.openSheet(r.type + ' — ' + Utils.fmtDate(r.date), html);
    sheet.querySelector('#save-rep').addEventListener('click', function() {
      Store.updateRepetition(id, {
        statut: sheet.querySelector('#r-statut').value,
        chants: sheet.querySelector('#r-chants').value,
        resultats: sheet.querySelector('#r-resultats').value,
        difficultes: sheet.querySelector('#r-diff').value,
      });
      Utils.closeSheet();
      Utils.toast('Répétition mise à jour');
      Router.render();
    });
    sheet.querySelector('#del-rep').addEventListener('click', function() {
      Utils.confirmAction('Supprimer cette répétition ?', function() {
        Store.deleteRepetition(id);
        Utils.closeSheet();
        Utils.toast('Répétition supprimée');
        Router.render();
      });
    });
  },

  openForm() {
    var membres = Store.data.membres.filter(function(m){return ['Bureau','Choriste'].indexOf(m.statut)>=0;}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
    var html =
      '<div class="field-row">' +
        '<div class="field"><label>Date</label><input type="date" id="rf-date" value="' + Utils.todayISO() + '"></div>' +
        '<div class="field"><label>Type</label><select id="rf-type">' +
          '<option>Répétition générale</option>' +
          '<option>Répétition technique</option>' +
          '<option>Répétition par pupitre</option>' +
          '<option>Répétition instrumentale</option>' +
          "<option>Répétition d'urgence</option>" +
        '</select></div>' +
      '</div>' +
      '<div class="field"><label>Responsable</label><select id="rf-resp"><option value="">—</option>' +
        membres.map(function(m){return '<option>'+Utils.escapeHtml(m.nom)+'</option>';}).join('') +
      '</select></div>' +
      '<div class="field"><label>Lieu</label><input type="text" id="rf-lieu"></div>' +
      '<div class="field"><label>Objectifs</label><input type="text" id="rf-obj"></div>' +
      '<div class="field"><label>Statut</label><select id="rf-statut">' +
        '<option>Tenue</option><option>Reportée</option><option>Annulée</option>' +
      '</select></div>' +
      '<button class="btn primary block" id="save-new-rep">💾 Enregistrer</button>';

    var sheet = Utils.openSheet('Nouvelle répétition', html);
    sheet.querySelector('#save-new-rep').addEventListener('click', function() {
      Store.addRepetition({
        id: Utils.genId('rep'),
        date: sheet.querySelector('#rf-date').value,
        type: sheet.querySelector('#rf-type').value,
        responsable: sheet.querySelector('#rf-resp').value,
        lieu: sheet.querySelector('#rf-lieu').value,
        objectifs: sheet.querySelector('#rf-obj').value,
        statut: sheet.querySelector('#rf-statut').value,
        chants: '', resultats: '', difficultes: '',
      });
      Utils.closeSheet();
      Utils.toast('Répétition ajoutée');
      Router.render();
    });
  },
};
