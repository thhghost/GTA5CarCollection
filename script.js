/* ==========================================================
   GTA ONLINE – MY CAR COLLECTION  ·  script.js  (public, read-only)
   Garage → Floor → Car  ·  data from a JSON file  ·  no dependencies
   ----------------------------------------------------------
   To update the collection: upload the new backup .json next to
   index.html and change DATA_FILE below to its file name.
   ========================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------
     1. CONFIG & PLACEHOLDER ART
  ------------------------------------------------------ */
  const DATA_FILE = 'gta-collection-2026-11-14.json';

  const svgUri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  const CAR_PLACEHOLDER = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <defs><radialGradient id="g" cx="50%" cy="40%" r="75%">
    <stop offset="0" stop-color="#26262c"/><stop offset="1" stop-color="#0f0f12"/>
  </radialGradient></defs>
  <rect width="400" height="250" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M58 162 L66 146 Q72 134 96 130 L140 104 Q156 92 180 90 L246 90 Q270 90 288 106 L322 130 Q346 134 352 148 L358 162 Z"/>
    <path d="M150 106 L176 98 L236 98 L236 128 L128 128 Z" stroke-opacity=".1"/>
    <circle cx="120" cy="164" r="22"/><circle cx="120" cy="164" r="8" stroke-opacity=".1"/>
    <circle cx="296" cy="164" r="22"/><circle cx="296" cy="164" r="8" stroke-opacity=".1"/>
  </g>
  <line x1="40" y1="190" x2="360" y2="190" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>
  <text x="200" y="224" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="5" fill="#fff" fill-opacity=".2">NO IMAGE</text>
</svg>`);

  const GARAGE_PLACEHOLDER = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#202026"/><stop offset="1" stop-color="#0e0e11"/>
  </linearGradient></defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M110 150 L320 70 L530 150"/>
    <rect x="130" y="150" width="380" height="150"/>
    <rect x="190" y="180" width="260" height="120"/>
    <g stroke-opacity=".09" stroke-width="2">
      <line x1="190" y1="200" x2="450" y2="200"/><line x1="190" y1="220" x2="450" y2="220"/>
      <line x1="190" y1="240" x2="450" y2="240"/><line x1="190" y1="260" x2="450" y2="260"/>
      <line x1="190" y1="280" x2="450" y2="280"/>
    </g>
  </g>
  <line x1="80" y1="300" x2="560" y2="300" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
  <text x="320" y="335" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" letter-spacing="7" fill="#fff" fill-opacity=".2">GARAGE</text>
</svg>`);

  // A parking-deck cross-section: stacked slabs with pillars
  const FLOOR_PLACEHOLDER = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1e1e24"/><stop offset="1" stop-color="#0e0e11"/>
  </linearGradient></defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <rect x="110" y="70" width="420" height="200"/>
    <line x1="110" y1="137" x2="530" y2="137"/>
    <line x1="110" y1="204" x2="530" y2="204"/>
    <g stroke-opacity=".09" stroke-width="2">
      <line x1="215" y1="70" x2="215" y2="270"/><line x1="320" y1="70" x2="320" y2="270"/><line x1="425" y1="70" x2="425" y2="270"/>
    </g>
    <g stroke-opacity=".1" stroke-width="2">
      <path d="M150 124 l10 -14 h26 l10 14 z"/><path d="M360 191 l10 -14 h26 l10 14 z"/><path d="M240 258 l10 -14 h26 l10 14 z"/>
    </g>
  </g>
  <text x="320" y="318" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" letter-spacing="7" fill="#fff" fill-opacity=".2">FLOOR</text>
</svg>`);

  const PLACEHOLDERS = { car: CAR_PLACEHOLDER, garage: GARAGE_PLACEHOLDER, floor: FLOOR_PLACEHOLDER };

  /* ------------------------------------------------------
     2. DATA
     The collection is read from DATA_FILE (a backup exported from
     the private editor and uploaded next to index.html).
       { garages: [ { id, name, image,
           floors: [ { id, name, image,
             cars: [ { id, name, image } ] } ] } ] }
     "image" is a web link (Google Drive share links are fine).
  ------------------------------------------------------ */
  const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
  const cleanImage = (v) => { v = str(v).trim(); return v.startsWith('idb:') ? '' : v; };   // editor-only refs can't work online

  const cleanCar = (c, i) => ({
    id: String(c.id || `c${i}`),
    name: str(c.name, 'Unnamed Car').trim() || 'Unnamed Car',
    image: cleanImage(c.image),
    createdAt: Number(c.createdAt) || 0,
  });

  const cleanFloor = (f, i) => ({
    id: String(f.id || `f${i}`),
    name: str(f.name, 'Untitled Floor').trim() || 'Untitled Floor',
    image: cleanImage(f.image),
    createdAt: Number(f.createdAt) || 0,
    cars: (Array.isArray(f.cars) ? f.cars : []).map(cleanCar),
  });

  function cleanGarage(g, i) {
    const floors = (Array.isArray(g.floors) ? g.floors : []).map(cleanFloor);
    // very old backups kept cars directly in the garage
    if (Array.isArray(g.cars) && g.cars.length) floors.unshift(cleanFloor({ name: 'Floor 1', cars: g.cars }, 'x'));
    return {
      id: String(g.id || `g${i}`),
      name: str(g.name, 'Untitled Garage').trim() || 'Untitled Garage',
      image: cleanImage(g.image),
      createdAt: Number(g.createdAt) || 0,
      floors,
    };
  }

  function sanitize(data) {
    const list = Array.isArray(data) ? data : data && data.garages;
    if (!Array.isArray(list)) throw new Error('The JSON file has no "garages" list.');
    return list.map(cleanGarage);
  }

  const state = { garages: [], status: 'loading', error: '' };

  const getGarage = (id) => state.garages.find((g) => g.id === id);
  const getFloor = (g, id) => (g ? g.floors.find((f) => f.id === id) : undefined);
  const garageCars = (g) => g.floors.reduce((n, f) => n + f.cars.length, 0);
  const totals = () => ({
    garages: state.garages.length,
    floors: state.garages.reduce((n, g) => n + g.floors.length, 0),
    cars: state.garages.reduce((n, g) => n + garageCars(g), 0),
  });

  /* ------------------------------------------------------
     3. SEARCH INDEX
     Cars are grouped by name, so a car that is parked in
     several garages shows up once with every location.
  ------------------------------------------------------ */
  // lower-case, no accents, punctuation → spaces ("Pegassi Zentorno" ≈ "pegassi-zentorno")
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

  let garageIndex = [];
  let carIndex = [];

  function buildIndex() {
    garageIndex = state.garages.map((g) => ({ g, n: norm(g.name) }));

    const byName = new Map();
    state.garages.forEach((g) => g.floors.forEach((f) => f.cars.forEach((c) => {
      const key = norm(c.name);
      let entry = byName.get(key);
      if (!entry) { entry = { name: c.name, n: key, image: '', locs: [] }; byName.set(key, entry); }
      if (!entry.image && c.image) entry.image = c.image;
      entry.locs.push({ g, f });
    })));
    carIndex = [...byName.values()];
  }

  /** Returns a test function for the query: every word must match, or the letters-only form ("gtr" ≈ "GT-R"). */
  function matcher(query) {
    const nq = norm(query);
    if (!nq) return null;
    const words = nq.split(' ');
    const compact = nq.replace(/ /g, '');
    return (n) => words.every((w) => n.includes(w)) || n.replace(/ /g, '').includes(compact);
  }

  /* ------------------------------------------------------
     4. HELPERS
  ------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);

  /** Tiny DOM builder – text is always inserted safely (no innerHTML). */
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => {
      if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
    });
    return n;
  }

  const DRIVE_FILE = /^https?:\/\/drive\.google\.com\/(?:file\/(?:u\/\d+\/)?d\/|open\?(?:[^#]*&)?id=|uc\?(?:[^#]*&)?id=|thumbnail\?(?:[^#]*&)?id=)([\w-]{10,})/i;

  /**
   * Turns share links into direct image links:
   *  - GitHub "blob" page links → raw.githubusercontent.com
   *  - Google Drive share links → direct image link
   * Everything else passes through unchanged.
   */
  function normalizeUrl(input) {
    const url = (input || '').trim();
    const gh = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
    if (gh) return `https://raw.githubusercontent.com/${gh[1]}/${gh[2]}/${gh[3].split('?')[0]}`;
    const drive = url.match(DRIVE_FILE);
    if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}`;
    return url;
  }

  /** Image with a loading shimmer and a graceful fallback. kind: 'car' | 'garage' | 'floor' */
  function buildImage(value, kind, alt) {
    const placeholder = PLACEHOLDERS[kind];
    const wrap = el('div', { class: `img-wrap ${kind}` });
    const img = el('img', { alt: alt || '', loading: 'lazy', decoding: 'async', draggable: 'false', referrerpolicy: 'no-referrer' });

    if (!value) {
      wrap.classList.add('is-placeholder');
      img.src = placeholder;
    } else {
      wrap.classList.add('is-loading');
      img.addEventListener('load', () => wrap.classList.remove('is-loading'));
      img.addEventListener('error', () => {
        wrap.classList.remove('is-loading');
        wrap.classList.add('is-placeholder');
        img.src = placeholder;
      }, { once: true });
      img.src = normalizeUrl(value);
    }
    wrap.append(img);
    return wrap;
  }

  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });

  /* Navigation. Every internal link goes through navigate(), which also closes the search. */
  const hashGarage = (gid) => `#/garage/${encodeURIComponent(gid)}`;
  const hashFloor = (gid, fid) => `${hashGarage(gid)}/floor/${encodeURIComponent(fid)}`;

  function navigate(hash) {
    ui.query = '';
    $('gSearch').value = '';
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /** A real link (middle-click / copy link work) that navigates without a page reload. */
  function link(hash, attrs, ...kids) {
    return el('a', { ...attrs, href: hash, onclick: (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      navigate(hash);
    } }, ...kids);
  }

  function renderCrumbs(container, items) {
    const parts = [];
    items.forEach((it, i) => {
      if (i) parts.push(el('span', { class: 'sep', text: '›' }));
      parts.push(i === items.length - 1
        ? el('span', { class: 'current', text: it.label })
        : el('button', { type: 'button', class: 'crumb', text: it.label, onclick: () => navigate(it.hash) }));
    });
    container.replaceChildren(...parts);
  }

  /* ------------------------------------------------------
     5. RENDERING
  ------------------------------------------------------ */
  const ui = { garageId: null, floorId: null, query: '', fQuery: '', cQuery: '', fSort: 'added', cSort: 'az' };

  function render() {
    const t = totals();
    $('totalGarages').textContent = t.garages;
    $('totalFloors').textContent = t.floors;
    $('totalCars').textContent = t.cars;

    const searching = state.status === 'ready' && ui.query.trim() !== '';
    const g = !searching && ui.garageId ? getGarage(ui.garageId) : null;
    const f = g && ui.floorId ? getFloor(g, ui.floorId) : null;

    $('searchView').hidden = !searching;
    $('dashboardView').hidden = searching || Boolean(g);
    $('garageView').hidden = !g || Boolean(f);
    $('floorView').hidden = !f;

    if (searching) renderSearch();
    else if (f) renderFloorView(g, f);
    else if (g) renderGarageView(g);
    else renderDashboard();
  }

  /** Garage / floor tile. `countLabel` swaps the hover hint for an always-visible label. */
  function tile({ hash, name, image, kind, badge, countLabel, label }) {
    return link(hash, { class: 'garage-card', 'aria-label': label || `Open ${name}` },
      buildImage(image, kind, name),
      el('div', { class: 'shade' }),
      badge && el('span', { class: 'badge', text: badge }),
      el('div', { class: 'body' },
        el('h3', { text: name, title: name }),
        el('span', { class: countLabel ? 'open count' : 'open', text: countLabel || 'OPEN →' }),
      ),
    );
  }

  const garageTile = (g, countLabel) => tile({
    hash: hashGarage(g.id), name: g.name, image: g.image, kind: 'garage',
    badge: `${plural(g.floors.length, 'floor')} · ${plural(garageCars(g), 'car')}`,
    countLabel,
  });

  /* ----- Dashboard ----- */
  function renderDashboard() {
    const list = state.status === 'ready' ? state.garages : [];
    $('garageGrid').replaceChildren(...list.map((g) => garageTile(g)));

    $('dashEmpty').hidden = list.length > 0;
    if (!list.length) {
      const msgs = {
        loading: ['Loading collection…', 'Fetching the garages, one moment.'],
        error: ['Could not load the collection', state.error],
        ready: ['No garages yet', 'The collection file does not contain any garages.'],
      }[state.status];
      $('dashEmptyTitle').textContent = msgs[0];
      $('dashEmptyText').textContent = msgs[1];
    }
  }

  /* ----- Search results ----- */
  const MAX_CAR_RESULTS = 120;

  function renderSearch() {
    const q = ui.query.trim();
    const test = matcher(q);
    const nq = norm(q);
    const rank = (n) => (n === nq ? 0 : n.startsWith(nq) ? 1 : 2);
    const sorter = (a, b) => rank(a.n) - rank(b.n) || a.n.localeCompare(b.n, undefined, { numeric: true });

    const garages = test ? garageIndex.filter((x) => test(x.n)).sort(sorter).map((x) => x.g) : [];
    const cars = test ? carIndex.filter((x) => test(x.n)).sort(sorter) : [];

    $('sTitle').textContent = `“${q}”`;
    $('sSummary').textContent = (garages.length || cars.length)
      ? `${plural(garages.length, 'garage')} · ${plural(cars.length, 'car')} found`
      : '';

    $('sGarages').hidden = !garages.length;
    $('sGarageGrid').replaceChildren(...garages.map((g) => garageTile(g, plural(garageCars(g), 'car').toUpperCase())));

    $('sCars').hidden = !cars.length;
    $('sCarGrid').replaceChildren(...cars.slice(0, MAX_CAR_RESULTS).map(resultCarCard));
    $('sMore').hidden = cars.length <= MAX_CAR_RESULTS;
    $('sMore').textContent = `Showing the first ${MAX_CAR_RESULTS} cars – type more of the name to narrow it down.`;

    $('sEmpty').hidden = Boolean(garages.length || cars.length);
  }

  function resultCarCard(entry) {
    const count = entry.locs.length;
    return el('article', { class: 'car-card result-card' },
      buildImage(entry.image, 'car', entry.name),
      el('div', { class: 'info' },
        el('h3', { text: entry.name, title: entry.name }),
        el('p', { class: 'where', text: count > 1 ? `Parked in ${count} places` : 'Parked in' }),
        el('ul', { class: 'locs' }, entry.locs.map(({ g, f }) =>
          el('li', {}, link(hashFloor(g.id, f.id), { class: 'loc', 'aria-label': `${entry.name} is in ${g.name}, ${f.name}` },
            el('strong', { text: g.name }),
            el('span', { text: f.name }),
          )),
        )),
      ),
    );
  }

  /* ----- Garage view: list of floors ----- */
  function renderGarageView(g) {
    renderCrumbs($('garageCrumbs'), [{ label: 'Dashboard', hash: '#/' }, { label: g.name }]);

    $('gvName').textContent = g.name;
    $('gvCount').textContent = `${plural(g.floors.length, 'floor')} · ${plural(garageCars(g), 'vehicle')}`;
    $('gvCover').replaceChildren(buildImage(g.image, 'garage', g.name));

    const q = norm(ui.fQuery);
    const floors = g.floors.filter((f) => norm(f.name).includes(q));
    if (ui.fSort === 'az') floors.sort(byName);
    if (ui.fSort === 'za') floors.sort((a, b) => byName(b, a));

    $('floorGrid').replaceChildren(...floors.map((f) => tile({
      hash: hashFloor(g.id, f.id), name: f.name, image: f.image, kind: 'floor', badge: plural(f.cars.length, 'car'),
    })));

    $('floorEmpty').hidden = floors.length > 0;
    if (!floors.length) {
      const searching = g.floors.length > 0;
      $('floorEmptyTitle').textContent = searching ? 'No floors match your search' : 'No floors';
      $('floorEmptyText').textContent = searching ? 'Try a different name.' : 'This garage has no floors yet.';
    }
  }

  /* ----- Floor view: list of cars ----- */
  function renderFloorView(g, f) {
    renderCrumbs($('floorCrumbs'), [
      { label: 'Dashboard', hash: '#/' },
      { label: g.name, hash: hashGarage(g.id) },
      { label: f.name },
    ]);

    $('fvGarageName').textContent = g.name;
    $('fvName').textContent = f.name;
    $('fvCount').textContent = `${plural(f.cars.length, 'vehicle')} parked`;
    $('fvCover').replaceChildren(buildImage(f.image, 'floor', f.name));

    const q = norm(ui.cQuery);
    const cars = f.cars.filter((c) => norm(c.name).includes(q));
    const sorters = {
      az: byName,
      za: (a, b) => byName(b, a),
      newest: (a, b) => b.createdAt - a.createdAt,
      oldest: (a, b) => a.createdAt - b.createdAt,
    };
    cars.sort(sorters[ui.cSort] || byName);

    $('carGrid').replaceChildren(...cars.map((c) => el('article', { class: 'car-card' },
      buildImage(c.image, 'car', c.name),
      el('div', { class: 'info' }, el('h3', { text: c.name, title: c.name })),
    )));

    $('carEmpty').hidden = cars.length > 0;
    if (!cars.length) {
      const searching = f.cars.length > 0;
      $('carEmptyTitle').textContent = searching ? 'No cars match your search' : 'This floor is empty';
      $('carEmptyText').textContent = searching ? 'Try a different name.' : 'No vehicles are parked here.';
    }
  }

  /* ------------------------------------------------------
     6. ROUTING & EVENT WIRING
     #/                          → dashboard
     #/garage/<id>               → floors of a garage
     #/garage/<id>/floor/<id>    → cars on a floor
  ------------------------------------------------------ */
  function route() {
    const m = location.hash.match(/^#\/garage\/([^/]+)(?:\/floor\/([^/]+))?$/);
    let gid = m ? decodeURIComponent(m[1]) : null;
    let fid = m && m[2] ? decodeURIComponent(m[2]) : null;

    const g = gid ? getGarage(gid) : null;
    if (!g) { gid = null; fid = null; }
    else if (fid && !getFloor(g, fid)) fid = null;

    if (gid !== ui.garageId) { ui.fQuery = ''; $('fSearch').value = ''; }
    if (fid !== ui.floorId) { ui.cQuery = ''; $('cSearch').value = ''; }
    if (gid !== ui.garageId || fid !== ui.floorId) window.scrollTo(0, 0);

    ui.garageId = gid;
    ui.floorId = fid;
    render();
  }

  function clearSearch() {
    ui.query = '';
    $('gSearch').value = '';
    render();
  }

  const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  async function loadData() {
    try {
      const res = await fetch(DATA_FILE, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`"${DATA_FILE}" returned HTTP ${res.status}. Check the file name and that it is in the same folder as index.html.`);
      state.garages = sanitize(await res.json());
      state.status = 'ready';
      buildIndex();
    } catch (err) {
      console.warn(err);
      state.status = 'error';
      state.error = location.protocol === 'file:'
        ? 'Browsers block loading the JSON file when index.html is opened directly from disk. Run a local server (e.g. “python -m http.server”) or open the GitHub Pages link.'
        : (err instanceof SyntaxError ? `"${DATA_FILE}" is not valid JSON.` : err.message);
    }
    route();
  }

  function init() {
    // Global search
    const input = $('gSearch');
    const onType = debounce(() => {
      const had = ui.query.trim() !== '';
      ui.query = input.value;
      if (!had && ui.query.trim()) window.scrollTo(0, 0);
      render();
    });
    input.addEventListener('input', onType);
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { clearSearch(); input.blur(); } });
    $('btnClearSearch').addEventListener('click', () => { clearSearch(); input.focus(); });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    $('brand').addEventListener('click', (e) => { e.preventDefault(); navigate('#/'); });

    // Garage view
    $('btnBackDash').addEventListener('click', () => navigate('#/'));
    $('fSearch').addEventListener('input', (e) => { ui.fQuery = e.target.value; render(); });
    $('fSort').addEventListener('change', (e) => { ui.fSort = e.target.value; render(); });

    // Floor view
    $('btnBackGarage').addEventListener('click', () => navigate(ui.garageId ? hashGarage(ui.garageId) : '#/'));
    $('cSearch').addEventListener('input', (e) => { ui.cQuery = e.target.value; render(); });
    $('cSort').addEventListener('change', (e) => { ui.cSort = e.target.value; render(); });

    window.addEventListener('hashchange', () => { ui.query = ''; $('gSearch').value = ''; route(); });
    render();      // "loading" state
    loadData();
  }

  init();
})();
