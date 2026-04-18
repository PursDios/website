// ------------------- Tweaks system -------------------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "lime",
  "font": "grotesk",
  "heroStyle": "dice"
}/*EDITMODE-END*/;

const ACCENTS = {
  lime:    { name: "Lime",    css: "oklch(0.88 0.18 130)", soft: "oklch(0.88 0.18 130 / 0.15)" },
  cyan:    { name: "Cyan",    css: "oklch(0.85 0.15 210)", soft: "oklch(0.85 0.15 210 / 0.15)" },
  amber:   { name: "Amber",   css: "oklch(0.82 0.16 75)",  soft: "oklch(0.82 0.16 75 / 0.15)"  },
  violet:  { name: "Violet",  css: "oklch(0.78 0.18 300)", soft: "oklch(0.78 0.18 300 / 0.15)" },
  coral:   { name: "Coral",   css: "oklch(0.75 0.17 30)",  soft: "oklch(0.75 0.17 30 / 0.15)"  },
  paper:   { name: "Paper",   css: "#e8e6e1",              soft: "rgba(232,230,225,0.15)"      },
};

const FONTS = {
  grotesk: {
    name: "Grotesk + Mono",
    display: '"Space Grotesk", sans-serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  serif: {
    name: "Serif + Mono",
    display: '"Instrument Serif", serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  allmono: {
    name: "All Mono",
    display: '"JetBrains Mono", monospace',
    body: '"JetBrains Mono", monospace',
    mono: '"JetBrains Mono", monospace',
  },
  geometric: {
    name: "Geometric",
    display: '"DM Sans", sans-serif',
    body: '"DM Sans", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
};

const HERO_STYLES = ["dice", "ascii", "orbit"];

let currentTweaks = { ...TWEAK_DEFAULTS };
// hydrate from localStorage to keep cross-page consistency
try {
  const saved = JSON.parse(localStorage.getItem("rc_tweaks") || "null");
  if (saved) currentTweaks = { ...currentTweaks, ...saved };
} catch(e) {}

function applyTweaks() {
  const root = document.documentElement;
  const a = ACCENTS[currentTweaks.accent] || ACCENTS.lime;
  root.style.setProperty("--accent", a.css);
  root.style.setProperty("--accent-soft", a.soft);
  root.style.setProperty("--accent-ink", a.name === "Paper" ? "#0b0b0d" : "#0b0b0d");

  const f = FONTS[currentTweaks.font] || FONTS.grotesk;
  root.style.setProperty("--font-display", f.display);
  root.style.setProperty("--font-body", f.body);
  root.style.setProperty("--font-mono", f.mono);

  // hero style attribute so hero JS can react
  document.body.setAttribute("data-hero", currentTweaks.heroStyle);
  document.dispatchEvent(new CustomEvent("tweakschanged", { detail: currentTweaks }));
}

function setTweak(key, value) {
  currentTweaks[key] = value;
  try { localStorage.setItem("rc_tweaks", JSON.stringify(currentTweaks)); } catch(e) {}
  applyTweaks();
  renderTweaksPanel();
  // Persist to source (no-op if not in edit host)
  try {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: value } }, "*");
  } catch(e) {}
}

function renderTweaksPanel() {
  const panel = document.getElementById("tweaks-panel");
  if (!panel) return;
  panel.innerHTML = `
    <h4>Tweaks</h4>
    <div class="tweak-row">
      <label>Accent</label>
      <div class="swatches">
        ${Object.entries(ACCENTS).map(([k, v]) => `
          <button class="swatch ${currentTweaks.accent === k ? "selected" : ""}"
                  title="${v.name}"
                  style="background: ${v.css};"
                  data-tweak="accent" data-value="${k}"></button>
        `).join("")}
      </div>
    </div>
    <div class="tweak-row">
      <label>Type</label>
      <div class="tweak-opts">
        ${Object.entries(FONTS).map(([k, v]) => `
          <button class="${currentTweaks.font === k ? "selected" : ""}"
                  data-tweak="font" data-value="${k}">${v.name}</button>
        `).join("")}
      </div>
    </div>
    <div class="tweak-row">
      <label>Hero</label>
      <div class="tweak-opts">
        ${HERO_STYLES.map(k => `
          <button class="${currentTweaks.heroStyle === k ? "selected" : ""}"
                  data-tweak="heroStyle" data-value="${k}">${k}</button>
        `).join("")}
      </div>
    </div>
  `;
  panel.querySelectorAll("[data-tweak]").forEach(btn => {
    btn.addEventListener("click", () => {
      setTweak(btn.dataset.tweak, btn.dataset.value);
    });
  });
}

// Edit-mode host protocol
window.addEventListener("message", (e) => {
  if (!e.data || typeof e.data !== "object") return;
  if (e.data.type === "__activate_edit_mode") {
    document.getElementById("tweaks-panel")?.classList.add("visible");
  } else if (e.data.type === "__deactivate_edit_mode") {
    document.getElementById("tweaks-panel")?.classList.remove("visible");
  }
});

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  applyTweaks();
  renderTweaksPanel();
  try {
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  } catch(e) {}
});

// ------------------- Nav helper -------------------
function buildNav(active) {
  return `
    <nav class="nav">
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <span class="brand-mark"></span>
          <span class="brand-name">ryan cooper</span>
          <span class="brand-domain">/ ryancooper.co.uk</span>
        </a>
        <div class="nav-links">
          <a href="index.html" class="${active === 'home' ? 'active' : ''}">Home</a>
          <a href="about.html" class="${active === 'about' ? 'active' : ''}">About</a>
          <a href="projects.html" class="${active === 'projects' ? 'active' : ''}">Projects</a>
          <a href="hobbies.html" class="${active === 'hobbies' ? 'active' : ''}">Hobbies</a>
          <a href="contact.html" class="${active === 'contact' ? 'active' : ''}">Contact</a>
        </div>
      </div>
    </nav>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <footer>
      <div class="footer-inner">
        <div>© ${year} Ryan Cooper · Cambridgeshire, UK</div>
        <div>Built with too much tea and questionable dice rolls.</div>
      </div>
    </footer>
  `;
}

function mountLayout(active) {
  const navSlot = document.getElementById("nav-slot");
  const footerSlot = document.getElementById("footer-slot");
  if (navSlot) navSlot.outerHTML = buildNav(active);
  if (footerSlot) footerSlot.outerHTML = buildFooter();
}
