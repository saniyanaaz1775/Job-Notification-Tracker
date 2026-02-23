// Simple client-side router (no frameworks). Keeps navigation client-only (no full reload).
(function () {
    const routes = {
      '/': pageHome,
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
  
    // Renderers: each returns simple placeholder DOM
    function makePage(title, sub) {
      const wrap = document.createElement('section');
      wrap.className = 'page';
      const h1 = document.createElement('h1');
      h1.textContent = title;
      const p = document.createElement('p');
      p.textContent = sub;
      wrap.appendChild(h1);
      wrap.appendChild(p);
      return wrap;
    }
    function pageHome() { return makePage('Dashboard', 'This section will be built in the next step.'); }
    function pageDashboard() { return makePage('Dashboard', 'This section will be built in the next step.'); }
    function pageSettings() { return makePage('Settings', 'This section will be built in the next step.'); }
    function pageSaved() { return makePage('Saved', 'This section will be built in the next step.'); }
    function pageDigest() { return makePage('Digest', 'This section will be built in the next step.'); }
    function pageProof() { return makePage('Proof', 'This section will be built in the next step.'); }
    function page404() { return makePage('Page Not Found', 'The page you are looking for does not exist.'); }
  
    // Router
    function navigate(path, replace = false) {
      if (path === location.pathname && !replace) {
        // clicking the active link: do nothing (no reload, no flicker)
        return;
      }
      const render = routes[path] || page404;
      if (replace) {
        history.replaceState({}, '', path);
      } else {
        history.pushState({}, '', path);
      }
      renderRoute(render);
      closeMobileNav();
    }
  
    function renderRoute(renderFn) {
      // replace content without page reload
      root.innerHTML = '';
      const page = renderFn();
      root.appendChild(page);
      // focus main for accessibility
      root.focus();
      updateActiveLinks(location.pathname);
    }
  
    // Update active underline on nav links
    function updateActiveLinks(path) {
      navLinks.forEach(link => {
        const url = new URL(link.href, location.origin);
        if (url.pathname === path) link.classList.add('active');
        else link.classList.remove('active');
      });
      // also in mobile panel links
      const panelLinks = navPanel.querySelectorAll('a');
      panelLinks.forEach(l => {
        const p = new URL(l.href, location.origin).pathname;
        if (p === path) l.classList.add('active');
        else l.classList.remove('active');
      });
    }
  
    // Link click interception
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (!link) return;
      const url = new URL(link.href, location.origin);
      if (url.origin === location.origin) {
        e.preventDefault();
        navigate(url.pathname);
      }
    });
  
    // Handle back/forward
    window.addEventListener('popstate', () => {
      const render = routes[location.pathname] || page404;
      renderRoute(render);
    });
  
    // Mobile nav handlers
    function toggleMobileNav() {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        navPanel.hidden = false;
        navPanel.querySelector('a')?.focus();
      } else {
        navPanel.hidden = true;
      }
    }
    function closeMobileNav() {
      hamburger.setAttribute('aria-expanded', 'false');
      navPanel.hidden = true;
    }
    hamburger.addEventListener('click', toggleMobileNav);
  
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navPanel.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileNav();
      }
    });
  
    // Initialize: render current path
    renderRoute(routes[location.pathname] || page404);
  })();