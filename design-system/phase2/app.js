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