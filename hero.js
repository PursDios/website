(function() {
  const svg = document.getElementById("hero-svg");
  if (!svg) return;

  let rafId = null;
  let start = performance.now();
  let currentMode = null;

  function clear() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function setupDice() {
    const phi = (1 + Math.sqrt(5)) / 2;
    const verts = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1],
    ];
    const edges = [
      [0,1],[0,5],[0,7],[0,10],[0,11],
      [1,5],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,6],[2,10],[2,11],
      [3,4],[3,6],[3,8],[3,9],
      [4,5],[4,9],[4,11],
      [5,9],[5,11],
      [6,7],[6,8],[6,10],
      [7,8],[7,10],
      [8,9],
      [10,11],
    ];
    const faces = [
      [0,1,5],[0,5,11],[0,11,10],[0,10,7],[0,7,1],
      [1,7,8],[1,8,9],[1,9,5],[5,9,4],[5,4,11],
      [11,4,2],[11,2,10],[10,2,6],[10,6,7],[7,6,8],
      [3,8,6],[3,9,8],[3,4,9],[3,2,4],[3,6,2],
    ];

    const cx = 200, cy = 200, scale = 110;

    function project(p, ax, ay) {
      let [x, y, z] = p;
      let x1 = x * Math.cos(ay) + z * Math.sin(ay);
      let z1 = -x * Math.sin(ay) + z * Math.cos(ay);
      let y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
      let z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
      return [cx + x1 * scale, cy + y1 * scale, z2];
    }

    const edgeEls = edges.map(() => {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("stroke-width", "1");
      l.setAttribute("stroke-linecap", "round");
      svg.appendChild(l);
      return l;
    });
    const faceEls = faces.map(() => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      p.setAttribute("fill", "var(--accent-soft)");
      p.setAttribute("opacity", "0");
      svg.appendChild(p);
      return p;
    });
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", cx);
    label.setAttribute("y", cy + 8);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "var(--font-mono)");
    label.setAttribute("font-size", "18");
    label.setAttribute("fill", "var(--fg-mute)");
    label.textContent = "20";
    svg.appendChild(label);

    function frame(t) {
      const elapsed = (t - start) / 1000;
      const ay = elapsed * 0.35;
      const ax = Math.sin(elapsed * 0.22) * 0.45;
      const projected = verts.map(v => project(v, ax, ay));

      const faceDepth = faces.map((f, i) => {
        const avgZ = (projected[f[0]][2] + projected[f[1]][2] + projected[f[2]][2]) / 3;
        return { i, avgZ };
      }).sort((a, b) => a.avgZ - b.avgZ);
      const topFace = faceDepth[0].i;

      faces.forEach((f, i) => {
        const el = faceEls[i];
        const pts = f.map(vi => `${projected[vi][0].toFixed(1)},${projected[vi][1].toFixed(1)}`).join(" ");
        el.setAttribute("points", pts);
        el.setAttribute("opacity", i === topFace ? "1" : "0");
      });

      edges.forEach(([a, b], i) => {
        const pa = projected[a], pb = projected[b];
        const depth = (pa[2] + pb[2]) / 2;
        const el = edgeEls[i];
        el.setAttribute("x1", pa[0].toFixed(1));
        el.setAttribute("y1", pa[1].toFixed(1));
        el.setAttribute("x2", pb[0].toFixed(1));
        el.setAttribute("y2", pb[1].toFixed(1));
        const near = depth < 0;
        el.setAttribute("stroke", near ? "var(--accent)" : "var(--fg-dim)");
        el.setAttribute("opacity", near ? "1" : "0.35");
        el.setAttribute("stroke-width", near ? "1.4" : "0.8");
      });

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function setupAscii() {
    const cols = 20, rows = 20;
    const cellW = 400 / cols, cellH = 400 / rows;
    const glyphs = ["·", ".", "+", "*", "×", "◇", "◆", "·"];
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", c * cellW + cellW / 2);
        t.setAttribute("y", r * cellH + cellH / 2 + 4);
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-family", "var(--font-mono)");
        t.setAttribute("font-size", "11");
        t.setAttribute("fill", "var(--fg-dim)");
        t.textContent = ".";
        svg.appendChild(t);
        cells.push({ el: t, r, c });
      }
    }
    function frame(t) {
      const elapsed = (t - start) / 1000;
      cells.forEach(({ el, r, c }) => {
        const dx = c - cols / 2, dy = r - rows / 2;
        const d = Math.sqrt(dx*dx + dy*dy);
        const wave = Math.sin(d * 0.6 - elapsed * 2) * 0.5 + 0.5;
        const idx = Math.floor(wave * (glyphs.length - 1));
        el.textContent = glyphs[idx];
        const isAccent = wave > 0.75;
        el.setAttribute("fill", isAccent ? "var(--accent)" : "var(--fg-mute)");
        el.setAttribute("opacity", 0.3 + wave * 0.7);
      });
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function setupOrbit() {
    const cx = 200, cy = 200;
    const items = [
      { g: "◆", r: 60,  s: 1.6,  ph: 0,         sz: 22 },
      { g: "◇", r: 60,  s: 1.6,  ph: Math.PI,    sz: 22 },
      { g: "◦", r: 110, s: -0.9, ph: 0,          sz: 14 },
      { g: "+", r: 110, s: -0.9, ph: 2.1,         sz: 14 },
      { g: "×", r: 110, s: -0.9, ph: 4.2,         sz: 14 },
      { g: "·", r: 160, s: 0.5,  ph: 0,           sz: 10 },
      { g: "·", r: 160, s: 0.5,  ph: 1.2,         sz: 10 },
      { g: "·", r: 160, s: 0.5,  ph: 2.4,         sz: 10 },
      { g: "·", r: 160, s: 0.5,  ph: 3.6,         sz: 10 },
      { g: "·", r: 160, s: 0.5,  ph: 4.8,         sz: 10 },
    ];
    [60, 110, 160].forEach((r) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
      c.setAttribute("r", r);
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", "var(--line-soft)");
      c.setAttribute("stroke-dasharray", "2 4");
      svg.appendChild(c);
    });
    const center = document.createElementNS("http://www.w3.org/2000/svg", "text");
    center.setAttribute("x", cx);
    center.setAttribute("y", cy + 10);
    center.setAttribute("text-anchor", "middle");
    center.setAttribute("font-family", "var(--font-display)");
    center.setAttribute("font-size", "32");
    center.setAttribute("fill", "var(--accent)");
    center.textContent = "RC";
    svg.appendChild(center);

    const els = items.map(it => {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("font-family", "var(--font-mono)");
      t.setAttribute("font-size", it.sz);
      t.setAttribute("fill", it.g === "◆" || it.g === "◇" ? "var(--accent)" : "var(--fg-dim)");
      t.setAttribute("text-anchor", "middle");
      t.textContent = it.g;
      svg.appendChild(t);
      return t;
    });
    function frame(t) {
      const elapsed = (t - start) / 1000;
      items.forEach((it, i) => {
        const angle = it.ph + elapsed * it.s * 0.4;
        const x = cx + Math.cos(angle) * it.r;
        const y = cy + Math.sin(angle) * it.r + 4;
        els[i].setAttribute("x", x.toFixed(1));
        els[i].setAttribute("y", y.toFixed(1));
      });
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function swap(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    if (rafId) cancelAnimationFrame(rafId);
    clear();
    start = performance.now();
    if (mode === "ascii") setupAscii();
    else if (mode === "orbit") setupOrbit();
    else setupDice();
    const label = document.querySelector(".art-label");
    if (label) {
      if (mode === "ascii") label.innerHTML = "<em>01</em> &nbsp; signal — scanning";
      else if (mode === "orbit") label.innerHTML = "<em>01</em> &nbsp; orbit — cambridgeshire";
      else label.innerHTML = "<em>01</em> &nbsp; nat twenty — crit confirmed";
    }
  }

  function readMode() {
    return document.body.getAttribute("data-hero") || "dice";
  }
  swap(readMode());
  new MutationObserver(() => swap(readMode()))
    .observe(document.body, { attributes: true, attributeFilter: ["data-hero"] });

  const cursor = document.getElementById("cursor-dice");
  if (cursor) {
    cursor.innerHTML = `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <polygon points="16,3 28,10 16,17 4,10" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <line x1="16" y1="17" x2="16" y2="29" stroke="currentColor" stroke-width="1.2"/>
      </svg>
    `;
    cursor.style.color = "var(--accent)";
    let tx = 0, ty = 0, cxp = 0, cyp = 0;
    let rot = 0;
    document.addEventListener("mousemove", (e) => {
      tx = e.clientX - 16;
      ty = e.clientY - 16;
      cursor.classList.add("visible");
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("visible"));
    function loop() {
      cxp += (tx - cxp) * 0.12;
      cyp += (ty - cyp) * 0.12;
      rot += 1.4;
      cursor.style.transform = `translate(${cxp}px, ${cyp}px) rotate(${rot}deg)`;
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
