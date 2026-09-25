(() => {
  const source = [window.FACE_REVIEW_CHUNK_1,window.FACE_REVIEW_CHUNK_2,window.FACE_REVIEW_CHUNK_3,window.FACE_REVIEW_CHUNK_4,window.FACE_REVIEW_CHUNK_5].filter(Array.isArray).flat();
  let order = [...source];
  let mode = "grid";
  let activeType = "Everyone";
  let flashIndex = 0;
  let flashRevealed = false;
  const revealed = new Set();

  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid");
  const flash = $("#flash");
  const count = $("#count");
  const typeFilters = $("#typeFilters");

  function filtered() {
    return order.filter(p => activeType === "Everyone" || p.type === activeType);
  }

  function initials(name) {
    return (name || "?").split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase() || "?";
  }

  function imageMarkup(person, className="avatar") {
    if (!person.pic) return `<div class="${className} placeholder">${initials(person.name)}</div>`;
    return `<img class="${className}" src="${escapeAttr(person.pic)}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:this.className+' placeholder',textContent:'${initials(person.name)}'}))">`;
  }

  function escapeHtml(s="") {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  function escapeAttr(s="") { return escapeHtml(s); }

  function subtitle(p) {
    const bits = [];
    if (p.role && p.role !== "Unknown") bits.push(p.role);
    if (p.company && p.company !== "Unknown" && p.company !== "(duplicate RSVP)") bits.push(p.company);
    return bits.join(" · ");
  }

  function profileHref(p) { return p.linkedin || p.luma || ""; }

  function renderFilters() {
    const types = [...new Set(source.map(p => p.type).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    typeFilters.innerHTML = ["Everyone", ...types].map(t =>
      `<button class="chip ${t===activeType?"active":""}" data-type="${escapeAttr(t)}">${escapeHtml(t)}</button>`
    ).join("");
    typeFilters.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeType = btn.dataset.type;
        flashIndex = 0;
        flashRevealed = false;
        revealed.clear();
        render();
      });
    });
  }

  function renderGrid(quiz=false) {
    const list = filtered();
    count.textContent = `${list.length} people`;
    grid.hidden = false;
    flash.hidden = true;
    grid.innerHTML = list.map((p, i) => {
      const id = `${p.name}::${i}`;
      const isRevealed = !quiz || revealed.has(id);
      const href = profileHref(p);
      return `<article class="person-card ${quiz && !isRevealed ? "quiz-hidden" : ""}" data-card-id="${escapeAttr(id)}" data-name="${escapeAttr(p.name)}">
        <div class="photo-wrap">${imageMarkup(p)}</div>
        <div class="person-meta ${isRevealed ? "" : "concealed"}">
          <div class="name-row">
            <h2>${escapeHtml(p.name || "Unknown")}</h2>
            ${p.type ? `<span class="type-badge">${escapeHtml(p.type)}</span>` : ""}
          </div>
          <p>${escapeHtml(subtitle(p) || " ")}</p>
          ${href && isRevealed ? `<a class="profile-link" href="${escapeAttr(href)}" target="_blank" rel="noopener">Profile ↗</a>` : ""}
        </div>
        ${quiz && !isRevealed ? `<button class="reveal-overlay" aria-label="Reveal ${escapeAttr(p.name)}"><span>Tap to reveal</span></button>` : ""}
      </article>`;
    }).join("");
    if (quiz) {
      grid.querySelectorAll(".reveal-overlay").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const card = e.currentTarget.closest(".person-card");
          revealed.add(card.dataset.cardId);
          renderGrid(true);
        });
      });
    }
  }

  function renderFlash() {
    const list = filtered();
    grid.hidden = true;
    flash.hidden = false;
    count.textContent = `${list.length} people`;
    if (!list.length) {
      flash.innerHTML = `<div class="empty">No people in this filter.</div>`;
      return;
    }
    flashIndex = Math.min(Math.max(0, flashIndex), list.length - 1);
    const p = list[flashIndex];
    const href = profileHref(p);
    flash.innerHTML = `<div class="flash-shell">
      <div class="flash-count">${flashIndex + 1} / ${list.length}</div>
      <div class="flash-photo" data-name="${escapeAttr(p.name)}">${imageMarkup(p, "flash-avatar")}</div>
      <div class="flash-answer ${flashRevealed ? "" : "concealed"}">
        <h2>${escapeHtml(p.name || "Unknown")}</h2>
        <p>${escapeHtml(subtitle(p) || " ")}</p>
        ${p.type ? `<span class="type-badge">${escapeHtml(p.type)}</span>` : ""}
        ${href ? `<a class="profile-link" href="${escapeAttr(href)}" target="_blank" rel="noopener">Profile ↗</a>` : ""}
      </div>
      <div class="flash-actions">
        <button id="prevBtn">← Previous</button>
        <button id="revealBtn" class="primary">${flashRevealed ? "Hide" : "Reveal"}</button>
        <button id="nextBtn">Next →</button>
      </div>
    </div>`;
    $("#prevBtn").onclick = () => stepFlash(-1);
    $("#nextBtn").onclick = () => stepFlash(1);
    $("#revealBtn").onclick = () => { flashRevealed = !flashRevealed; renderFlash(); };
  }

  function stepFlash(delta) {
    const list = filtered();
    if (!list.length) return;
    flashIndex = (flashIndex + delta + list.length) % list.length;
    flashRevealed = false;
    renderFlash();
  }

  function setMode(next) {
    mode = next;
    document.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    revealed.clear();
    flashRevealed = false;
    render();
  }

  function shuffle() {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    flashIndex = 0;
    flashRevealed = false;
    revealed.clear();
    render();
  }

  function render() {
    renderFilters();
    if (mode === "grid") renderGrid(false);
    else if (mode === "quiz") renderGrid(true);
    else renderFlash();
  }

  document.querySelectorAll("[data-mode]").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  $("#shuffleBtn").addEventListener("click", shuffle);

  document.addEventListener("keydown", (e) => {
    if (mode !== "flash") return;
    if (e.code === "Space") { e.preventDefault(); flashRevealed = !flashRevealed; renderFlash(); }
    else if (e.code === "ArrowLeft") stepFlash(-1);
    else if (e.code === "ArrowRight") stepFlash(1);
  });

  render();
})();