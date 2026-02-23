:root {
  /* Core colors (max 4) */
  --color-bg: #F7F6F3;        /* Background (off-white) */
  --color-text: #111111;      /* Primary text */
  --color-accent: #8B0000;    /* Deep red (primary accent) */

  /* Semantic family (one muted hue-family; derived tones for success & warning) */
  --color-semantic-base: #8A7F52; /* muted earth base (not a new bright color) */
  --color-success: #75A46B;  /* muted green (derived from semantic family) */
  --color-warning: #B5833F;  /* muted amber (derived from same family) */

  /* Typography */
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-size-base: 18px;            /* body size */
  --line-height: 1.7;               /* 1.6–1.8 range */
  --max-text-width: 720px;

  /* Heading sizes (consistent scale, no random sizes) */
  --h1-size: 40px;
  --h2-size: 28px;
  --h3-size: 20px;

  /* Spacing scale (only these) */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 64px;

  /* Borders & radius */
  --radius: 8px; /* same border-radius everywhere */

  /* Borders derived from text using opacity (not "new" color) */
  --border-subtle: rgba(17,17,17,0.06);
  --border-strong: rgba(17,17,17,0.12);

  /* Interaction */
  --transition-fast: 160ms;
  --transition-medium: 180ms;
  --easing: ease-in-out;
}
/* Base reset / page */
html,body {
  height: 100%;
}
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* Max width for readable text blocks */
.container {
  max-width: var(--max-text-width);
  margin-left: auto;
  margin-right: auto;
  padding: var(--space-lg);
}

/* Consistent radii and transitions */
* { box-sizing: border-box; }
button,input,textarea { border-radius: var(--radius); transition: all var(--transition-medium) var(--easing); }

/* Top-level page structure:
   [Top Bar] → [Context Header] → [Primary Workspace + Secondary Panel] → [Proof Footer]
*/
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  gap: var(--space-lg);
}
/* Top Bar */
.topbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
  background: transparent; /* keep calm, no heavy surfaces */
  font-size: 14px;
}
.topbar .brand { font-weight: 700; letter-spacing: 0.2px; }
.topbar .progress { text-align:center; flex: 1; }
.topbar .status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: rgba(17,17,17,0.02);
  color: var(--color-text);
  font-size: 13px;
}

/* Context Header (Large serif headline + one-line subtext) */
.context-header {
  padding: 0 var(--space-lg);
}
.context-header h1 {
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-heading);
  font-size: var(--h1-size);
  line-height: 1.1;
  color: var(--color-text);
  max-width: var(--max-text-width);
}
.context-header p {
  margin: 0;
  color: rgba(17,17,17,0.8);
  max-width: var(--max-text-width);
}
.main {
  display: flex;
  gap: var(--space-lg);
  padding: 0 var(--space-lg) var(--space-xl) var(--space-lg);
}
.primary {
  flex: 0 0 70%;
  min-width: 0; /* allow shrink */
}
.secondary {
  flex: 0 0 30%;
  min-width: 0;
}

/* Cards */
.card {
  background: transparent; /* keep to page bg; separation via border only */
  border: 1px solid var(--border-subtle);
  padding: var(--space-md);
  border-radius: var(--radius);
  margin-bottom: var(--space-md);
  color: var(--color-text);
}
/* Buttons - consistent rules */
/* Primary: solid deep red */
.btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap: 8px;
  padding: 10px 16px; /* chosen from spacing scale's rhythm (between 8 & 16) */
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background var(--transition-fast) var(--easing), transform var(--transition-fast) var(--easing);
}
.btn:active { transform: translateY(0.5px); } /* tiny tactile response, no bounce */

.btn-primary {
  background: var(--color-accent);
  color: var(--color-bg); /* use background color for button text to stay within palette */
}
.btn-primary:focus { outline: 3px solid rgba(139,0,0,0.12); outline-offset: 2px; }

.btn-secondary {
  background: transparent;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}
.btn-secondary:focus { box-shadow: 0 0 0 4px rgba(139,0,0,0.06); }

/* Inputs */
.input {
  display:block;
  width:100%;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius);
}
.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(139,0,0,0.08);
  outline: none;
}

/* Small status badge (e.g., Not Started / In Progress / Shipped) */
.badge {
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:6px 10px;
  border-radius: 999px;
  font-size: 13px;
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
}

/* Progress text center in topbar uses neutral text */
.progress-text { color: rgba(17,17,17,0.8); }

/* Proof footer (checklist) */
.proof {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-subtle);
  display:flex;
  gap: var(--space-md);
  align-items:flex-start;
  flex-wrap:wrap;
}
.proof .check {
  display:flex;
  gap: 12px;
  align-items:center;
  color: rgba(17,17,17,0.9);
  font-size: 14px;
}
.checkbox {
  width:18px;
  height:18px;
  border:1px solid var(--border-strong);
  display:inline-block;
  border-radius:4px;
  background: transparent;
}
/* Error message */
.error {
  color: var(--color-accent); /* accent used for critical error messaging */
  background: rgba(139,0,0,0.04);
  border: 1px solid rgba(139,0,0,0.08);
  padding: var(--space-sm);
  border-radius: var(--radius);
}

/* Success / Warning use semantic family (derived tones) */
.success { color: var(--color-success); background: rgba(117,164,107,0.06); border: 1px solid rgba(117,164,107,0.08); padding: 10px; border-radius: var(--radius); }
.warning { color: var(--color-warning); background: rgba(181,131,63,0.06); border: 1px solid rgba(181,131,63,0.08); padding: 10px; border-radius: var(--radius); }

/* Empty state (guides next action) */
.empty {
  border: 1px dashed var(--border-strong);
  padding: var(--space-md);
  text-align:center;
  color: rgba(17,17,17,0.7);
  border-radius: var(--radius);
}
.empty .cta { margin-top: var(--space-sm); }