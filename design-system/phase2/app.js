// app.js (replace previous app.js with this version)
// Client-side router + job rendering using local JOBS array (data.js must be included before this)
(function(){
  const routes = {
    '/': pageLanding,
    '/dashboard': pageDashboard,
    '/settings': pageSettings,
    '/saved': pageSaved,
    '/digest': pageDigest,
    '/proof': pageProof
  };

  const root = document.getElementById('route-root');
  const navLinks = Array.from(document.querySelectorAll('[data-link]'));
  const hamburger = document.querySelector('.hamburger');
  const navPanel = document.getElementById('nav-panel');

  // Persistence key
  const STORAGE_KEY = 'jnt.savedJobs'; // array of job ids

  // Utilities
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>{
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k,v);
    });
    (Array.isArray(children)?children:[children]).flat().forEach(c => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveSaved(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function toggleSaved(jobId) {
    const list = loadSaved();
    const idx = list.indexOf(jobId);
    if (idx === -1) {
      list.push(jobId);
    } else {
      list.splice(idx,1);
    }
    saveSaved(list);
    return list;
  }
  function isSaved(jobId) {
    return loadSaved().includes(jobId);
  }

  // Basic filters state (local in-memory)
  const filterState = {
    q: '',
    location: 'All',
    mode: 'All',
    experience: 'All',
    source: 'All',
    sort: 'Latest'
  };

  // Job utilities
  function formatPosted(days) {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  // Job card renderer
  function jobCard(job) {
    const card = el('article',{class:'card job-card', role:'article', 'data-id':job.id});
    const header = el('div',{class:'job-head', style:'display:flex;align-items:center;justify-content:space-between;gap:12px'});
    const left = el('div',{class:'job-left'});
    left.append(el('h3',{class:'job-title', text:job.title}));
    left.append(el('div',{class:'job-meta', html:`<strong>${job.company}</strong> &middot; ${job.location} • ${job.mode}`}));
    header.append(left);
    const right = el('div',{class:'job-right'});
    right.append(el('div',{class:'salary', text:job.salaryRange}));
    header.append(right);
    card.append(header);

    const row2 = el('div',{class:'job-row2', style:'display:flex;align-items:center;justify-content:space-between;margin-top:16px'});
    row2.append(el('div',{class:'job-left-2', html:`<span class="pill">${job.experience}</span> <span class="badge">${job.source}</span> <span style="color:rgba(17,17,17,0.6);margin-left:8px">${formatPosted(job.postedDaysAgo)}</span>`}));
    const actions = el('div',{class:'job-actions', style:'display:flex;gap:8px'});
    actions.append(el('button',{class:'btn btn-secondary view-btn', text:'View', onClick: ()=> openModal(job)}));
    actions.append(el('button',{class:'btn btn-secondary save-btn', text:isSaved(job.id) ? 'Saved' : 'Save', onClick: (e)=> { e.preventDefault(); const list = toggleSaved(job.id); e.target.textContent = list.includes(job.id) ? 'Saved' : 'Save'; updateSavedBadge(); }}));
    actions.append(el('button',{class:'btn btn-primary', text:'Apply', onClick: ()=> { window.open(job.applyUrl, '_blank'); }}));
    row2.append(actions);
    card.append(row2);

    return card;
  }

  // Modal
  let modalEl = null;
  function openModal(job) {
    if (modalEl) closeModal();
    modalEl = el('div',{class:'modal-overlay', role:'dialog', 'aria-modal':'true'});
    const panel = el('div',{class:'modal-panel'});
    panel.append(el('h2',{text:job.title, class:'modal-title', style:'font-family:var(--font-heading)'}));
    panel.append(el('div',{class:'muted', text:`${job.company} • ${job.location} • ${job.mode}`}));
    panel.append(el('p',{text: `Experience: ${job.experience}  •  Salary: ${job.salaryRange}`}));
    panel.append(el('hr'));
    panel.append(el('p',{text:job.description}));
    panel.append(el('h4',{text:'Skills'}));
    const skillList = el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'});
    job.skills.forEach(s => skillList.append(el('span',{class:'pill', text:s})));
    panel.append(skillList);
    const foot = el('div',{style:'margin-top:20px;display:flex;gap:8px;justify-content:flex-end'});
    foot.append(el('button',{class:'btn btn-secondary', text:'Close', onClick: closeModal}));
    foot.append(el('button',{class:'btn btn-primary', text:'Apply', onClick: ()=> window.open(job.applyUrl, '_blank')}));
    panel.append(foot);
    modalEl.append(panel);
    document.body.appendChild(modalEl);
    // close on overlay click
    modalEl.addEventListener('click', (e)=> { if (e.target === modalEl) closeModal(); });
  }
  function closeModal() {
    if (!modalEl) return;
    modalEl.remove();
    modalEl = null;
  }

  // Pages
  function pageLanding(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Stop Missing The Right Jobs.'}));
    wrap.append(el('p',{text:'Precision-matched job discovery delivered daily at 9AM.'}));
    const btn = el('button',{class:'cta-btn', text:'Start Tracking', onClick: ()=> navigate('/settings')});
    wrap.append(el('div',{style:'margin-top:24px'}, btn));
    return wrap;
  }

  function pageDashboard(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Dashboard'}));
    wrap.append(el('p',{text:'This section will be built in the next step.'}));

    // Filter bar
    const filterBar = renderFilterBar();
    wrap.append(filterBar);

    // job list container
    const listWrap = el('div',{class:'jobs-list', style:'margin-top:16px'});
    wrap.append(listWrap);

    // render initially
    renderJobsList(listWrap, JOBS);

    return wrap;
  }

  function pageSettings(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Settings'}), el('p',{text:'This section will be built in the next step.'}));

    const form = el('form',{class:'form', onSubmit: (e)=> e.preventDefault()});
    form.append(field('Role keywords', el('input',{class:'input', placeholder:'e.g. Backend, Data Analyst', type:'text'})));
    form.append(field('Preferred locations', el('input',{class:'input', placeholder:'e.g. Remote, Bengaluru'})));
    const modeSelect = el('select',{class:'select'}, [el('option',{value:'Remote', text:'Remote'}), el('option',{value:'Hybrid', text:'Hybrid'}), el('option',{value:'Onsite', text:'Onsite'})]);
    form.append(field('Mode', modeSelect));
    const expSelect = el('select',{class:'select'}, [el('option',{value:'Fresher', text:'Fresher'}), el('option',{value:'0-1', text:'0-1'}), el('option',{value:'1-3', text:'1-3'}), el('option',{value:'3-5', text:'3-5'})]);
    form.append(field('Experience level', expSelect));
    wrap.append(form);
    return wrap;
  }

  function pageSaved(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Saved'}));
    wrap.append(el('p',{text:'This section will be built in the next step.'}));

    const listWrap = el('div',{class:'jobs-list', style:'margin-top:16px'});
    wrap.append(listWrap);

    const ids = loadSaved();
    if (!ids.length) {
      listWrap.append(el('div',{class:'empty-card', text:'No saved jobs yet. Your premium saved list will appear here.'}));
      return wrap;
    }
    const savedJobs = JOBS.filter(j => ids.includes(j.id));
    savedJobs.forEach(j => listWrap.append(jobCard(j)));
    return wrap;
  }

  function pageDigest(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Digest'}));
    wrap.append(el('p',{text:'This section will be built in the next step.'}));
    wrap.append(el('div',{class:'empty-card', style:'margin-top:16px', text:'Daily summary feature coming soon — a concise digest delivered each morning.'}));
    return wrap;
  }

  function pageProof(){
    const wrap = el('section',{class:'page'});
    wrap.append(el('h1',{text:'Proof'}));
    wrap.append(el('p',{text:'This section will be built in the next step.'}));
    return wrap;
  }

  function page404(){
    const wrap = el('section',{class:'page notfound'});
    wrap.append(el('h1',{text:'Page Not Found'}));
    wrap.append(el('p',{text:'The page you are looking for does not exist.'}));
    return wrap;
  }

  // Filter bar UI
  function renderFilterBar() {
    const bar = el('div',{class:'filter-bar', style:'display:flex;flex-direction:column;gap:12px'});
    const row1 = el('div',{style:'display:flex;gap:12px;flex-wrap:wrap;align-items:center'});
    const q = el('input',{class:'input', placeholder:'Search title or company', value:filterState.q, onInput: (e)=> { filterState.q = e.target.value; applyFilters(); }});
    const locs = ['All', ...uniqueValues('location')];
    const modes = ['All', ...uniqueValues('mode')];
    const exps = ['All', ...uniqueValues('experience')];
    const sources = ['All', ...uniqueValues('source')];

    const locSel = makeSelect(locs, filterState.location, (v)=> { filterState.location = v; applyFilters(); });
    const modeSel = makeSelect(modes, filterState.mode, (v)=> { filterState.mode = v; applyFilters(); });
    const expSel = makeSelect(exps, filterState.experience, (v)=> { filterState.experience = v; applyFilters(); });
    const srcSel = makeSelect(sources, filterState.source, (v)=> { filterState.source = v; applyFilters(); });
    const sortSel = makeSelect(['Latest','Oldest','Salary (low)','Salary (high)'], filterState.sort, (v)=> { filterState.sort = v; applyFilters(); });

    row1.append(q, locSel, modeSel, expSel);
    const row2 = el('div',{style:'display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap'});
    const left = el('div',{style:'display:flex;gap:12px;align-items:center'}, [srcSel, sortSel]);
    const right = el('div',{style:'display:flex;gap:8px;align-items:center'});
    const reset = el('button',{class:'btn btn-secondary', text:'Reset', onClick: ()=> { filterState.q=''; filterState.location='All'; filterState.mode='All'; filterState.experience='All'; filterState.source='All'; filterState.sort='Latest'; document.querySelectorAll('.filter-bar .input, .filter-bar select').forEach(i=> { if(i.tagName==='INPUT') i.value=''; if(i.tagName==='SELECT') i.selectedIndex=0; }); applyFilters(); }});
    left.append(reset);
    row2.append(left, right);
    bar.append(row1, row2);
    // attach a target container reference for renderJobsList to use
    bar.jobsContainer = el('div');
    bar.append(bar.jobsContainer);
    // apply filters initially
    function applyFilters() {
      const listContainer = bar.jobsContainer;
      const results = filterJobs(JOBS, filterState);
      renderJobsList(listContainer, results);
    }
    // initial populate
    applyFilters();
    return bar;
  }

  function makeSelect(options, current, onChange) {
    const select = el('select',{class:'select'});
    options.forEach(opt => select.append(el('option',{value:opt, text:opt})));
    select.value = current;
    select.addEventListener('change', ()=> onChange(select.value));
    return select;
  }

  function uniqueValues(field) {
    const set = new Set();
    JOBS.forEach(j => set.add(j[field]));
    return Array.from(set).sort();
  }

  function parseSalary(s) {
    // crude parse to allow sort: map strings to min numeric value when possible
    if (!s) return 0;
    if (s.includes('LPA')) {
      const m = s.match(/(\d+)[^\d]*(\d*)\s*LPA/);
      if (m) {
        const min = parseInt(m[1],10);
        return min;
      }
      const mm = s.match(/(\d+)\s*–\s*(\d+)\s*LPA/);
      if (mm) return parseInt(mm[1],10);
    }
    if (s.includes('₹')) {
      // treat internships as low
      return 0;
    }
    return 0;
  }

  function filterJobs(list, f) {
    let out = list.filter(job => {
      if (f.q) {
        const q = f.q.toLowerCase();
        if (!(job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q))) return false;
      }
      if (f.location !== 'All' && job.location !== f.location) return false;
      if (f.mode !== 'All' && job.mode !== f.mode) return false;
      if (f.experience !== 'All' && job.experience !== f.experience) return false;
      if (f.source !== 'All' && job.source !== f.source) return false;
      return true;
    });

    // sort
    if (f.sort === 'Latest') out.sort((a,b)=> a.postedDaysAgo - b.postedDaysAgo);
    else if (f.sort === 'Oldest') out.sort((a,b)=> b.postedDaysAgo - a.postedDaysAgo);
    else if (f.sort === 'Salary (low)') out.sort((a,b)=> parseSalary(a.salaryRange) - parseSalary(b.salaryRange));
    else if (f.sort === 'Salary (high)') out.sort((a,b)=> parseSalary(b.salaryRange) - parseSalary(a.salaryRange));
    return out;
  }

  function renderJobsList(container, jobs) {
    container.innerHTML = '';
    if (!jobs.length) {
      container.append(el('div',{class:'empty-card', text:'No jobs match your search.'}));
      return;
    }
    jobs.forEach(j => container.append(jobCard(j)));
  }

  function field(labelText, inputEl){
    const f = el('div',{class:'field'});
    f.append(el('label',{class:'label', text:labelText}), inputEl);
    return f;
  }

  // Update saved badge text if present (notified in nav if you build one)
  function updateSavedBadge() {
    // placeholder: could update a badge in topbar; keep simple and light
  }

  // Router mechanics
  function navigate(path, replace=false){
    if (path === location.pathname && !replace) return; // active link clicked — do nothing
    const renderer = routes[path] || page404;
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
    renderRoute(renderer);
    closeMobileNav();
  }

  function renderRoute(renderer){
    root.innerHTML = '';
    root.appendChild(renderer());
    root.focus();
    updateActiveLinks(location.pathname);
  }

  function updateActiveLinks(path){
    navLinks.forEach(link=>{
      const url = new URL(link.href, location.origin);
      if (url.pathname === path) link.classList.add('active'); else link.classList.remove('active');
    });
    // panel links
    navPanel.querySelectorAll('a').forEach(a=>{
      const p = new URL(a.href, location.origin).pathname;
      if (p === path) a.classList.add('active'); else a.classList.remove('active');
    });
  }

  // Intercept clicks
  document.addEventListener('click', (e)=>{
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    const url = new URL(link.href, location.origin);
    if (url.origin === location.origin){
      e.preventDefault();
      navigate(url.pathname);
    }
  });

  // Handle back/forward
  window.addEventListener('popstate', ()=> {
    const renderer = routes[location.pathname] || page404;
    renderRoute(renderer);
  });

  // Mobile nav
  function toggleMobileNav(){
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    if (!expanded){ navPanel.hidden = false; navPanel.querySelector('a')?.focus(); } else navPanel.hidden = true;
  }
  function closeMobileNav(){ hamburger.setAttribute('aria-expanded','false'); navPanel.hidden = true; }
  hamburger.addEventListener('click', toggleMobileNav);
  document.addEventListener('click', (e)=>{
    if (!navPanel.contains(e.target) && !hamburger.contains(e.target)) closeMobileNav();
  });

  // Init render
  // ensure JOBS present
  if (!window.JOBS || !Array.isArray(window.JOBS)) {
    console.error('JOBS dataset not found. Ensure data.js is loaded before app.js');
    root.append(el('div',{class:'empty-card', text:'Dataset missing. Place data.js in same folder and include before app.js'}));
  } else {
    renderRoute(routes[location.pathname] || page404);
  }
})();
/* Preferences persistence */
const PREF_KEY = 'jobTrackerPreferences';

function loadPreferences() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || null; }
  catch (e) { return null; }
}
function savePreferences(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

/* Utility: normalize lists */
function splitList(s) {
  if (!s) return [];
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

/* Exact MatchScore engine (per spec) */
function computeMatchScore(job, prefs) {
  if (!prefs) return 0;
  let score = 0;
  const roleKeywords = (prefs.roleKeywords || '').split(',').map(k=>k.trim().toLowerCase()).filter(Boolean);
  const userSkills = splitList(prefs.skills).map(s=>s.toLowerCase());
  const locs = (prefs.preferredLocations || []).map(s=>s.toLowerCase());
  const modes = (prefs.preferredMode || []).map(s=>s.toLowerCase());
  const exp = (prefs.experienceLevel || '').toLowerCase();

  const title = (job.title||'').toLowerCase();
  const desc = (job.description||'').toLowerCase();

  // +25 if any roleKeyword appears in job.title
  if (roleKeywords.some(k => title.includes(k))) score += 25;

  // +15 if any roleKeyword appears in job.description
  if (roleKeywords.some(k => desc.includes(k))) score += 15;

  // +15 if job.location matches preferredLocations
  if (locs.length && locs.includes((job.location||'').toLowerCase())) score += 15;

  // +10 if job.mode matches preferredMode
  if (modes.length && modes.includes((job.mode||'').toLowerCase())) score += 10;

  // +10 if job.experience matches experienceLevel
  if (exp && exp === (job.experience||'').toLowerCase()) score += 10;

  // +15 if overlap between job.skills and user.skills (any match)
  if (userSkills.length && (job.skills || []).some(s => userSkills.includes(s.toLowerCase()))) score += 15;

  // +5 if postedDaysAgo <= 2
  if (typeof job.postedDaysAgo === 'number' && job.postedDaysAgo <= 2) score += 5;

  // +5 if source is LinkedIn
  if ((job.source || '').toLowerCase() === 'linkedin') score += 5;

  return Math.min(100, score);
}

/* Badge color helper */
function badgeClassForScore(score) {
  if (score >= 80) return 'badge-green';
  if (score >= 60) return 'badge-amber';
  if (score >= 40) return 'badge-neutral';
  return 'badge-subtle';
}

/* Update single card's score UI without re-rendering list */
function updateCardScoreDOM(jobId, score) {
  const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
  if (!card) return;
  let badge = card.querySelector('.match-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'match-badge';
    // place it top-right of card header (adjust as your card DOM)
    const head = card.querySelector('.job-head') || card;
    head.appendChild(badge);
  }
  badge.textContent = `${score}%`;
  badge.className = `match-badge ${badgeClassForScore(score)}`;
}
/* --- Digest engine & UI (drop into app.js) --- */

/* Helper: safe preferences loader (uses existing PREF_KEY or jobTrackerPreferences) */
function getPreferences() {
  try {
    return JSON.parse(localStorage.getItem('jobTrackerPreferences')) || null;
  } catch {
    return null;
  }
}

/* Safe computeMatchScore fallback: if you already have one, this no-ops */
if (typeof computeMatchScore !== 'function') {
  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;
    let score = 0;
    const roleKeywords = (prefs.roleKeywords || '').split(',').map(k=>k.trim().toLowerCase()).filter(Boolean);
    const userSkills = (prefs.skills || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const locs = (prefs.preferredLocations || []).map(s => s.toLowerCase());
    const modes = (prefs.preferredMode || []).map(s => s.toLowerCase());
    const exp = (prefs.experienceLevel || '').toLowerCase();
    const title = (job.title||'').toLowerCase();
    const desc = (job.description||'').toLowerCase();

    if (roleKeywords.some(k => title.includes(k))) score += 25;
    if (roleKeywords.some(k => desc.includes(k))) score += 15;
    if (locs.length && locs.includes((job.location||'').toLowerCase())) score += 15;
    if (modes.length && modes.includes((job.mode||'').toLowerCase())) score += 10;
    if (exp && exp === (job.experience||'').toLowerCase()) score += 10;
    if (userSkills.length && (job.skills||[]).some(s => userSkills.includes(s.toLowerCase()))) score += 15;
    if (typeof job.postedDaysAgo === 'number' && job.postedDaysAgo <= 2) score += 5;
    if ((job.source || '').toLowerCase() === 'linkedin') score += 5;
    return Math.min(100, score);
  }
}

/* Digest storage key helper */
function digestKeyForDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth()+1).padStart(2,'0');
  const d = String(dateObj.getDate()).padStart(2,'0');
  return `jobTrackerDigest_${y}-${m}-${d}`;
}

/* Generate or load today's digest (top 10 by matchScore desc, then postedDaysAgo asc) */
function getOrCreateTodayDigest() {
  const today = new Date();
  const key = digestKeyForDate(today);
  const existing = localStorage.getItem(key);
  if (existing) return JSON.parse(existing);

  const prefs = getPreferences();
  if (!prefs) return { error: 'no-preferences' };

  // Compute scores (deterministic)
  const scored = window.JOBS.map(job => {
    const score = computeMatchScore(job, prefs);
    return Object.assign({}, job, { matchScore: score });
  });

  // Sort by score desc, postedDaysAgo asc
  scored.sort((a,b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.postedDaysAgo - b.postedDaysAgo;
  });

  const top10 = scored.slice(0,10);
  const digest = {
    date: key.slice('jobTrackerDigest_'.length),
    items: top10
  };
  localStorage.setItem(key, JSON.stringify(digest));
  return digest;
}

/* Render digest UI on /digest page (call from your page renderer) */
function renderDigestSection(container) {
  const prefs = getPreferences();
  if (!prefs) {
    const block = document.createElement('div');
    block.className = 'empty-card';
    block.textContent = 'Set preferences to generate a personalized digest.';
    container.appendChild(block);
    return;
  }

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '12px';
  controls.style.alignItems = 'center';
  controls.style.marginBottom = '16px';

  const genBtn = document.createElement('button');
  genBtn.className = 'btn btn-primary';
  genBtn.textContent = "Generate Today's 9AM Digest (Simulated)";
  controls.appendChild(genBtn);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-secondary';
  copyBtn.textContent = 'Copy Digest to Clipboard';
  copyBtn.disabled = true;
  controls.appendChild(copyBtn);

  const emailBtn = document.createElement('button');
  emailBtn.className = 'btn btn-secondary';
  emailBtn.textContent = 'Create Email Draft';
  emailBtn.disabled = true;
  controls.appendChild(emailBtn);

  const note = document.createElement('div');
  note.style.marginTop = '8px';
  note.style.color = 'rgba(17,17,17,0.7)';
  note.style.fontSize = '13px';
  note.textContent = 'Demo Mode: Daily 9AM trigger simulated manually.';
  container.appendChild(controls);
  container.appendChild(note);

  const out = document.createElement('div');
  out.className = 'digest-output';
  out.style.marginTop = '20px';
  container.appendChild(out);

  function renderDigest(digest) {
    out.innerHTML = '';
    if (!digest || !digest.items || digest.items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-card';
      empty.textContent = "No matching roles today. Check again tomorrow.";
      out.appendChild(empty);
      copyBtn.disabled = true;
      emailBtn.disabled = true;
      return;
    }

    // email-style centered white card
    const card = document.createElement('div');
    card.style.background = '#ffffff';
    card.style.border = '1px solid rgba(17,17,17,0.06)';
    card.style.borderRadius = '8px';
    card.style.padding = '24px';
    card.style.maxWidth = '720px';
    card.style.margin = '0 auto';
    card.style.color = 'var(--color-text)';

    const h = document.createElement('h2');
    h.style.fontFamily = 'var(--font-heading)';
    h.textContent = "Top 10 Jobs For You — 9AM Digest";
    card.appendChild(h);

    const d = document.createElement('div');
    d.style.color = 'rgba(17,17,17,0.7)';
    d.style.marginBottom = '16px';
    const date = new Date(digest.date).toLocaleDateString();
    d.textContent = date;
    card.appendChild(d);

    digest.items.forEach(item => {
      const row = document.createElement('div');
      row.style.borderTop = '1px solid rgba(17,17,17,0.04)';
      row.style.padding = '12px 0';
      const title = document.createElement('div');
      title.style.fontFamily = 'var(--font-heading)';
      title.style.fontSize = '16px';
      title.textContent = item.title;
      row.appendChild(title);
      const meta = document.createElement('div');
      meta.style.color = 'rgba(17,17,17,0.7)';
      meta.style.fontSize = '14px';
      meta.textContent = `${item.company} • ${item.location} • ${item.experience} • Match ${item.matchScore}%`;
      row.appendChild(meta);
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.marginTop = '8px';
      btn.textContent = 'Apply';
      btn.addEventListener('click', ()=> window.open(item.applyUrl, '_blank'));
      row.appendChild(btn);
      card.appendChild(row);
    });

    const footer = document.createElement('div');
    footer.style.borderTop = '1px solid rgba(17,17,17,0.04)';
    footer.style.marginTop = '16px';
    footer.style.paddingTop = '12px';
    footer.style.color = 'rgba(17,17,17,0.7)';
    footer.textContent = 'This digest was generated based on your preferences.';
    card.appendChild(footer);

    out.appendChild(card);
    copyBtn.disabled = false;
    emailBtn.disabled = false;
  }

  // handle generate/load
  genBtn.addEventListener('click', () => {
    const digest = getOrCreateTodayDigest();
    if (digest && digest.error === 'no-preferences') {
      out.innerHTML = '';
      const block = document.createElement('div');
      block.className = 'empty-card';
      block.textContent = 'Set preferences to generate a personalized digest.';
      out.appendChild(block);
      copyBtn.disabled = true;
      emailBtn.disabled = true;
      return;
    }
    renderDigest(digest);
  });

  // copy plain-text
  copyBtn.addEventListener('click', async () => {
    const key = digestKeyForDate(new Date());
    const digest = JSON.parse(localStorage.getItem(key) || '{}');
    if (!digest || !digest.items || digest.items.length === 0) return;
    let body = `Top 10 Jobs — ${digest.date}\n\n`;
    digest.items.forEach((it, i) => {
      body += `${i+1}. ${it.title} — ${it.company} (${it.location})\n   Experience: ${it.experience} • Match ${it.matchScore}%\n   Apply: ${it.applyUrl}\n\n`;
    });
    await navigator.clipboard.writeText(body);
    copyBtn.textContent = 'Copied';
    setTimeout(()=> copyBtn.textContent = 'Copy Digest to Clipboard', 1500);
  });

  // create mailto draft
  emailBtn.addEventListener('click', () => {
    const key = digestKeyForDate(new Date());
    const digest = JSON.parse(localStorage.getItem(key) || '{}');
    if (!digest || !digest.items || digest.items.length === 0) return;
    let body = `Top 10 Jobs — ${digest.date}\n\n`;
    digest.items.forEach((it, i) => {
      body += `${i+1}. ${it.title} — ${it.company} (${it.location})\nExperience: ${it.experience} • Match ${it.matchScore}%\nApply: ${it.applyUrl}\n\n`;
    });
    const subject = encodeURIComponent('My 9AM Job Digest');
    const mail = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.location.href = mail;
  });

  // If a digest already exists on page load, render immediately
  const todayKey = digestKeyForDate(new Date());
  const existing = localStorage.getItem(todayKey);
  if (existing) {
    renderDigest(JSON.parse(existing));
  }
}

/* To integrate: call renderDigestSection(container) from your /digest page renderer,
   for example inside pageDigest() after the basic header/subtext have been appended.
*/
/* Persisted Job Status & Notification Templates
   Keys:
   - jobTrackerStatus => object map { jobId: statusString }
   - jobTrackerStatusLog => array [{ jobId, status, dateISO }]
*/

const STATUS_KEY = 'jobTrackerStatus';
const STATUS_LOG_KEY = 'jobTrackerStatusLog';
const ALL_STATUSES = ['Not Applied','Applied','Rejected','Selected'];

function loadAllStatuses() {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY)) || {}; } catch { return {}; }
}
function saveAllStatuses(map) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(map));
}
function getStatus(jobId) {
  const map = loadAllStatuses();
  return map[jobId] || 'Not Applied';
}
function recordStatusChange(jobId, status) {
  // update map
  const map = loadAllStatuses();
  map[jobId] = status;
  saveAllStatuses(map);

  // append log
  try {
    const log = JSON.parse(localStorage.getItem(STATUS_LOG_KEY)) || [];
    log.unshift({ jobId, status, date: new Date().toISOString() });
    // keep last 200 entries to avoid growth
    localStorage.setItem(STATUS_LOG_KEY, JSON.stringify(log.slice(0,200)));
  } catch (e) { /* noop safe */ }

  // toast
  showToast(`Status updated: ${status}`);
}

/* Toast (non-blocking, auto-dismiss) */
function showToast(text, ms = 3000) {
  const t = document.createElement('div');
  t.className = 'jnt-toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(()=> t.classList.add('visible'), 20);
  setTimeout(()=> { t.classList.remove('visible'); setTimeout(()=> t.remove(), 220); }, ms);
}

/* Update card UI for badge color and label */
function updateStatusBadgeOnCard(cardEl, jobId) {
  const status = getStatus(jobId);
  let badge = cardEl.querySelector('.status-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'status-badge';
    // place top-right if job-head exists
    const head = cardEl.querySelector('.job-head') || cardEl;
    head.appendChild(badge);
  }
  badge.textContent = status;
  badge.className = 'status-badge ' + statusBadgeClass(status);
}

/* Badge class mapping */
function statusBadgeClass(status) {
  switch (status) {
    case 'Applied': return 'status-applied';   // blue
    case 'Rejected': return 'status-rejected'; // red
    case 'Selected': return 'status-selected'; // green
    default: return 'status-neutral';          // neutral
  }
}

/* Render a compact button group for status on a job card.
   Call this after creating the card element; it wires events and updates localStorage.
*/
function renderStatusGroup(job, cardEl) {
  // container
  const container = document.createElement('div');
  container.className = 'status-group';
  // label
  const label = document.createElement('div');
  label.className = 'status-label';
  label.textContent = 'Status';
  container.appendChild(label);

  const btnRow = document.createElement('div');
  btnRow.className = 'status-buttons';
  ALL_STATUSES.forEach(st => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'status-btn';
    b.textContent = st;
    if (getStatus(job.id) === st) b.classList.add('active');
    b.addEventListener('click', () => {
      // idempotent: changing to same state still records timestamp per spec
      recordStatusChange(job.id, st);
      // refresh button active state
      btnRow.querySelectorAll('.status-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      // update badge on card
      updateStatusBadgeOnCard(cardEl, job.id);
    });
    btnRow.appendChild(b);
  });
  container.appendChild(btnRow);

  // append to card actions area if exists, otherwise bottom
  const actions = cardEl.querySelector('.job-actions');
  if (actions) actions.parentNode.insertBefore(container, actions.nextSibling);
  else cardEl.appendChild(container);

  // ensure badge exists
  updateStatusBadgeOnCard(cardEl, job.id);
}

/* Status filter integration
   In your filterState, add filterState.status = 'All'
   When building filterBar, include an additional select for status:
*/
function makeStatusFilterControl(currentValue, onChange) {
  const select = document.createElement('select');
  select.className = 'select';
  ['All', ...ALL_STATUSES].forEach(s => select.appendChild(new Option(s, s)));
  select.value = currentValue || 'All';
  select.addEventListener('change', ()=> onChange(select.value));
  return select;
}

/* Modify your filterJobs(list, filterState) to include status AND logic:
   (assuming you have existing checks) Add:

if (filterState.status && filterState.status !== 'All') {
  const st = filterState.status;
  if ((getStatus(job.id) || 'Not Applied') !== st) return false;
}

   This ensures status filter combines with all other filters using AND.
*/

/* Recent Status Updates for Digest page:
   Call renderRecentStatusUpdates(container) inside your /digest page renderer.
*/
function renderRecentStatusUpdates(container) {
  const raw = JSON.parse(localStorage.getItem(STATUS_LOG_KEY) || '[]');
  const prefs = JSON.parse(localStorage.getItem('jobTrackerPreferences') || 'null');
  const section = document.createElement('div');
  section.style.marginTop = '20px';
  const h = document.createElement('h3');
  h.style.fontFamily = 'var(--font-heading)';
  h.textContent = 'Recent Status Updates';
  section.appendChild(h);

  if (!raw.length) {
    const p = document.createElement('div');
    p.className = 'empty-card';
    p.textContent = 'No recent status updates.';
    section.appendChild(p);
    container.appendChild(section);
    return;
  }

  // show last 10 updates
  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '12px';
  raw.slice(0,10).forEach(u => {
    const job = (window.JOBS || []).find(j => j.id === u.jobId) || {title: u.jobId, company: ''};
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.border = '1px solid rgba(17,17,17,0.04)';
    row.style.padding = '12px';
    row.style.borderRadius = '8px';
    const left = document.createElement('div');
    left.innerHTML = `<div style="font-family:var(--font-heading)">${job.title}</div><div style="color:rgba(17,17,17,0.7)">${job.company}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="status-badge ${statusBadgeClass(u.status)}" style="margin-bottom:6px">${u.status}</div><div style="color:rgba(17,17,17,0.65);font-size:12px">${new Date(u.date).toLocaleString()}</div>`;
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  });
  section.appendChild(list);
  container.appendChild(section);
}
// --- JT Test Checklist & Ship Lock (add to app.js) ---
const JT_TEST_KEY = 'jobTrackerTestStatus';
const JT_TEST_ITEMS = [
  { id: 't1', label: 'Preferences persist after refresh', tip: 'Set prefs, refresh, confirm values remain' },
  { id: 't2', label: 'Match score calculates correctly', tip: 'Set prefs and verify known job score' },
  { id: 't3', label: '"Show only matches" toggle works', tip: 'Enable toggle and confirm filtered jobs' },
  { id: 't4', label: 'Save job persists after refresh', tip: 'Save job, refresh, confirm in /saved' },
  { id: 't5', label: 'Apply opens in new tab', tip: 'Click Apply on a job card' },
  { id: 't6', label: 'Status update persists after refresh', tip: 'Change status and refresh' },
  { id: 't7', label: 'Status filter works correctly', tip: 'Filter by status and verify results' },
  { id: 't8', label: 'Digest generates top 10 by score', tip: 'Generate digest and check ordering' },
  { id: 't9', label: 'Digest persists for the day', tip: 'Generate digest, refresh, verify it remains' },
  { id: 't10', label: 'No console errors on main pages', tip: 'Open DevTools and navigate app' }
];

function loadTestStatus() {
  try { return JSON.parse(localStorage.getItem(JT_TEST_KEY)) || {}; } catch { return {}; }
}
function saveTestStatus(map) {
  localStorage.setItem(JT_TEST_KEY, JSON.stringify(map));
}
function resetTestStatus() {
  localStorage.removeItem(JT_TEST_KEY);
  // Also update UI if on test page (re-render)
  if (location.pathname === '/jt/07-test') renderJtTestPage();
}

// count passed
function jtCountPassed() {
  const map = loadTestStatus();
  return JT_TEST_ITEMS.reduce((acc,i,idx) => acc + (map[i.id] ? 1 : 0), 0);
}
function jtAllPassed() {
  return jtCountPassed() === JT_TEST_ITEMS.length;
}

/* Navigation guard: prevent client-side navigation to /jt/08-ship if tests not complete.
   If your router uses navigate(path), insert this check before proceeding to pushState.
   Example integration (if you have a navigate function): */
const originalNavigate = window.navigate || null;
window.navigate = function(path, replace=false) {
  if (path === '/jt/08-ship' && !jtAllPassed()) {
    showToast('Complete all tests before shipping.');
    // Optionally render the test page or keep user on current page
    return;
  }
  if (typeof originalNavigate === 'function') return originalNavigate(path, replace);
  // Fallback: use location
  if (replace) history.replaceState({}, '', path);
  else history.pushState({}, '', path);
  const renderer = (routes && routes[path]) ? routes[path] : (window.render404 || (() => document.getElementById('route-root').innerHTML = ''));
  if (renderer) renderRoute(renderer);
};

/* Page renderers to add to your routes map: */
function renderJtTestPage() {
  const wrap = document.createElement('section');
  wrap.className = 'page';
  wrap.appendChild(Object.assign(document.createElement('h1'), { textContent: 'Built-In Test Checklist' }));
  const summary = document.createElement('div');
  summary.className = 'jt-summary';
  function updateSummary() {
    const passed = jtCountPassed();
    summary.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between">
      <div><strong>Tests Passed: ${passed} / ${JT_TEST_ITEMS.length}</strong></div>
      <div>${passed < JT_TEST_ITEMS.length ? '<span style="color:rgba(139,0,0,0.8)">Resolve all issues before shipping.</span>' : ''}</div>
    </div>`;
  }
  wrap.appendChild(summary);

  const list = document.createElement('ul');
  list.className = 'jt-checklist';
  const statusMap = loadTestStatus();
  JT_TEST_ITEMS.forEach(item => {
    const li = document.createElement('li');
    li.className = 'jt-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!statusMap[item.id];
    cb.id = item.id;
    cb.addEventListener('change', () => {
      const map = loadTestStatus();
      map[item.id] = cb.checked;
      saveTestStatus(map);
      updateSummary();
    });
    const label = document.createElement('label');
    label.htmlFor = item.id;
    label.textContent = item.label;
    label.title = item.tip;
    li.appendChild(cb);
    li.appendChild(label);
    list.appendChild(li);
  });
  wrap.appendChild(list);

  const controls = document.createElement('div');
  controls.style.marginTop = '16px';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-secondary';
  resetBtn.textContent = 'Reset Test Status';
  resetBtn.addEventListener('click', () => {
    resetTestStatus();
    renderJtTestPageReplace(wrap); // re-render inside same container
  });
  controls.appendChild(resetBtn);
  wrap.appendChild(controls);

  updateSummary();
  // replace content into route root
  const root = document.getElementById('route-root');
  root.innerHTML = '';
  root.appendChild(wrap);
  root.focus();

  function renderJtTestPageReplace(oldWrap) {
    // quick re-render: call this function to re-render current page
    const r = renderJtTestPage;
    if (r) r();
  }
}

function renderJtShipPage() {
  const root = document.getElementById('route-root');
  root.innerHTML = '';
  const wrap = document.createElement('section');
  wrap.className = 'page';
  wrap.appendChild(Object.assign(document.createElement('h1'), { textContent: 'Ship' }));
  if (!jtAllPassed()) {
    const box = document.createElement('div');
    box.className = 'empty-card';
    box.textContent = 'Complete all tests before shipping.';
    wrap.appendChild(box);
    // Optionally include a call-to-action
    const goto = document.createElement('button');
    goto.className = 'btn btn-primary';
    goto.textContent = 'Open Test Checklist';
    goto.addEventListener('click', ()=> navigate('/jt/07-test'));
    wrap.appendChild(goto);
  } else {
    const success = document.createElement('div');
    success.className = 'empty-card';
    success.textContent = 'All tests passed — ready to ship.';
    wrap.appendChild(success);
  }
  root.appendChild(wrap);
  root.focus();
}

/* Register routes (add these keys to your router routes map) */
// routes['/jt/07-test'] = renderJtTestPage;
// routes['/jt/08-ship'] = renderJtShipPage;