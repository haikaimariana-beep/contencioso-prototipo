/* Casca do protótipo: menu, topo, tema, busca Ctrl+K, painel lateral, diálogos. */
(function () {
  const D = window.DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (v) => v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const proc = (id) => D.procs.find((p) => p.id === Number(id));
  const badge = (estado) => { const s = D.STATES[estado]; return `<span class="badge ${s.outline ? "outline" : ""}" style="--c:${s.c}">${s.label}</span>`; };
  const person = (key, sm = true) => { const t = D.TEAM[key]; return key === "sistema"
      ? `<span class="avatar ${sm ? "sm" : ""} sys" aria-hidden="true"><i data-lucide="cpu"></i></span>`
      : `<span class="avatar ${sm ? "sm" : ""}" aria-hidden="true">${t.ini}</span>`; };
  const valueTag = (p) => p.tipo === "prov" ? `<span class="tag">Provisão</span>` : p.tipo === "cond" ? `<span class="tag client">Condenação</span>` : `<span class="tag">Sem valor ainda</span>`;
  const clientTag = (p) => p.cliente ? `<span class="tag client"><i data-lucide="briefcase"></i>${esc(p.cliente)}</span>` : `<span class="tag" style="color:var(--state-needs_review)"><i data-lucide="circle-help"></i>Cliente a indicar</span>`;
  const icons = () => window.lucide && window.lucide.createIcons();

  const myQueue = () => D.procs.filter((p) => ["needs_review", "needs_documents", "calculated"].includes(p.estado));

  function shell(active) {
    const pend = D.UPLOADS_PENDENTES.length;
    const fila = myQueue().length + pend;
    const nav = [
      ["index.html", "gauge", "Painel", fila],
      ["processos.html", "folder", "Processos"],
      ["uploads.html", "inbox", "Uploads", pend],
      ["#", "percent", "Índices"],
      ["#", "shield", "Administração"],
      ["#", "scroll-text", "Auditoria"],
    ];
    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = `
      <a class="skip" href="#conteudo">Ir para o conteúdo</a>
      <aside class="sidebar" id="sidebar" aria-label="Menu principal">
        <div class="brand"><span class="logo">C</span>Contencioso</div>
        <nav class="nav">${nav.map(([h, ic, t, n]) => `<a href="${h}" class="${t === active ? "active" : ""}" ${t === active ? 'aria-current="page"' : ""}><i data-lucide="${ic}"></i>${t}${n ? `<span class="count" aria-label="${n} pendentes">${n}</span>` : ""}</a>`).join("")}</nav>
        <div style="padding:0 8px">${chg("menu-contador", "Mudou: contadores")}</div>
        <div class="foot"></div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn menu-btn" aria-label="Abrir menu" onclick="document.getElementById('sidebar').classList.toggle('open')"><i data-lucide="menu"></i></button>
          <button class="search-btn" id="openSearch" aria-label="Buscar processo, cliente ou tela (Ctrl+K)"><i data-lucide="search"></i><span>Buscar processo, cliente ou tela…</span><kbd>Ctrl K</kbd></button>${chg("busca-rapida")}
          <span class="spacer"></span>
          <button class="chg-toggle" id="chgToggle" aria-pressed="true" title="Mostrar ou esconder as etiquetas do que mudou"><i data-lucide="sparkles"></i><span>O que mudou</span></button>
          <button class="icon-btn" id="chgList" aria-label="Ver a lista de mudanças desta tela"><i data-lucide="list-checks"></i></button>
          <button class="icon-btn" id="themeBtn" aria-label="Alternar tema"><i data-lucide="monitor"></i></button>
          <button class="user" aria-label="Menu de Mariana"><span class="avatar">M</span><span class="nm">Mariana</span></button>
        </header>
        <main class="content" id="conteudo" tabindex="-1"><div class="chg-banner" id="chgBanner"><i data-lucide="sparkles" style="color:var(--note)"></i><span><b>Protótipo do redesenho.</b> As etiquetas <span class="chg" style="display:inline-flex;cursor:default"><i data-lucide="sparkles"></i>Mudou</span> marcam o que mudou na experiência: clique para ver o antes, o agora e o porquê. Use <b>O que mudou</b>, no topo, para esconder.</span></div></main>
      </div>
      <aside class="side" id="side" hidden role="region" aria-label="Painel lateral"></aside>
      <div class="term-pop" id="termPop" role="tooltip" hidden></div>
      <div class="overlay" id="pal" hidden><div class="palette" role="dialog" aria-label="Busca rápida">
        <div class="in-wrap"><i data-lucide="search"></i><input id="palIn" placeholder="Número, parte, cliente ou tela" aria-label="Buscar"></div>
        <div class="res" id="palRes" role="listbox"></div></div></div>
      <div class="overlay" id="dlg" hidden></div>
      <div class="toast" id="toast" role="status" hidden></div>`;
    document.body.prepend(app);
    const main = $("#conteudo");
    $$("body > template, body > .page-content").forEach((n) => main.append(n.content ? n.content.cloneNode(true) : n));
    $$("[data-c]", main).forEach((el) => (el.outerHTML = chg(el.dataset.c, el.dataset.l || "Mudou")));
    bindTheme(); bindPalette(); bindChanges(); bindTerms();
    return main;
  }

  /* Etiquetas "O que mudou" */
  const chg = (key, label = "Mudou") => window.CHANGES && window.CHANGES[key]
    ? `<button type="button" class="chg" data-chg="${key}" aria-label="O que mudou: ${esc(window.CHANGES[key][0])}"><i data-lucide="sparkles"></i>${esc(label)}</button>` : "";
  function bindChanges() {
    let on = localStorageGet("chg") !== "off";
    const apply = () => { document.body.classList.toggle("show-chg", on); $("#chgToggle").setAttribute("aria-pressed", on); $("#chgBanner").hidden = !on; };
    $("#chgToggle").onclick = () => { on = !on; localStorageSet("chg", on ? "on" : "off"); apply(); };
    apply();
    const pop = document.createElement("div"); pop.className = "chg-pop"; pop.hidden = true; pop.setAttribute("role", "dialog"); document.body.append(pop);
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-chg]");
      if (!b) { if (!e.target.closest(".chg-pop")) pop.hidden = true; return; }
      e.preventDefault(); e.stopPropagation();
      const [t, antes, agora, pq] = window.CHANGES[b.dataset.chg];
      pop.innerHTML = `<h3><i data-lucide="sparkles"></i>${esc(t)}</h3><dl><div><dt>Antes</dt><dd class="antes">${esc(antes)}</dd></div><div><dt>Agora</dt><dd>${esc(agora)}</dd></div><div><dt>Por quê</dt><dd class="muted">${esc(pq)}</dd></div></dl>`;
      pop.hidden = false; icons();
      const r = b.getBoundingClientRect(); const w = pop.offsetWidth;
      pop.style.top = (r.bottom + scrollY + 6) + "px";
      pop.style.left = Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - w - 8)) + "px";
    }, true);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") pop.hidden = true; });
    $("#chgList").onclick = () => {
      const keys = [...new Set($$("[data-chg]").map((b) => b.dataset.chg))];
      openSide(`<div class="side-h"><i data-lucide="list-checks" style="color:var(--note)"></i><h2 style="flex:1">O que mudou nesta tela · ${keys.length}</h2><button class="icon-btn" data-close aria-label="Fechar"><i data-lucide="x"></i></button></div>
        <div class="side-b chg-list">${keys.map((k) => { const [t, antes, agora, pq] = window.CHANGES[k]; return `<a href="#" data-goto="${k}"><b>${esc(t)}</b><div class="help" style="margin-top:4px"><span class="antes">Antes: ${esc(antes)}</span></div><div style="margin-top:4px;font-size:13px">Agora: ${esc(agora)}</div><div class="help" style="margin-top:4px">${esc(pq)}</div></a>`; }).join("")}</div>`);
      $$("[data-goto]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); const t = $(`.main [data-chg="${a.dataset.goto}"]`) || $(`[data-chg="${a.dataset.goto}"]`); if (!t) return; t.scrollIntoView({ block: "center" }); const host = t.parentElement; host.classList.add("chg-target"); setTimeout(() => host.classList.remove("chg-target"), 1800); }));
    };
  }

  function bindTheme() {
    const order = ["system", "dark", "light"]; const ic = { system: "monitor", dark: "moon", light: "sun" };
    let cur = localStorageGet("theme") || "system";
    const apply = () => { if (cur === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.dataset.theme = cur;
      $("#themeBtn").innerHTML = `<i data-lucide="${ic[cur]}"></i>`; $("#themeBtn").setAttribute("aria-label", `Tema: ${({ system: "do sistema", dark: "escuro", light: "claro" })[cur]}. Alternar`); icons(); };
    $("#themeBtn").onclick = () => { cur = order[(order.indexOf(cur) + 1) % 3]; localStorageSet("theme", cur); apply(); };
    apply();
  }
  function localStorageGet(k) { try { return localStorage.getItem("ctv2-" + k); } catch (e) { return null; } }
  function localStorageSet(k, v) { try { localStorage.setItem("ctv2-" + k, v); } catch (e) {} }

  /* Busca rápida: agora encontra processo por número, parte ou cliente (antes só levava às telas). */
  function bindPalette() {
    const pal = $("#pal"), inp = $("#palIn"), res = $("#palRes");
    const screens = [["Painel", "index.html", "gauge"], ["Processos", "processos.html", "folder"], ["Uploads", "uploads.html", "inbox"], ["Índices", "#", "percent"], ["Minha conta", "#", "user"]];
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const render = () => {
      const q = norm(inp.value);
      let html = "";
      if (q) {
        const clients = D.CLIENT_NAMES.filter((c) => norm(c).includes(q) || D.procs.some((p) => p.sugestao === c && norm(p.reus).includes(q)));
        const ps = D.procs.filter((p) => norm(p.numero).includes(q) || norm(p.titulo).includes(q) || norm(p.cliente || "").includes(q)).slice(0, 8);
        if (clients.length) html += `<div class="grp">Clientes</div>` + clients.map((c) => `<a href="processos.html?cliente=${encodeURIComponent(c)}"><i data-lucide="briefcase"></i>${esc(c)}<span class="subtle" style="margin-left:auto">${D.procs.filter((p) => p.sugestao === c).length} processos</span></a>`).join("");
        if (ps.length) html += `<div class="grp">Processos</div>` + ps.map((p) => `<a href="processo.html?id=${p.id}"><span class="mono" style="font-size:12px">${p.numero}</span><span class="muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.autor)}</span><span style="margin-left:auto">${badge(p.estado)}</span></a>`).join("");
      }
      const sc = screens.filter(([t]) => !q || norm(t).includes(q));
      if (sc.length) html += `<div class="grp">Ir para</div>` + sc.map(([t, h, ic]) => `<a href="${h}"><i data-lucide="${ic}"></i>${t}</a>`).join("");
      res.innerHTML = html || `<div class="empty">Nada com "${esc(inp.value)}". Tente o número do processo (pode ser só um pedaço), o nome de uma parte ou da cliente.</div>`;
      const first = $("a", res); if (first) first.setAttribute("aria-selected", "true");
      icons();
    };
    const open = () => { pal.hidden = false; inp.value = ""; render(); inp.focus(); };
    $("#openSearch").onclick = open;
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
      if (e.key === "Escape") { if (!$("#dlg").hidden) closeDialog(); else if (!pal.hidden) pal.hidden = true; else if (!$("#side").hidden && !document.querySelector(".chg-pop:not([hidden])")) closeSide(); }
    });
    pal.addEventListener("click", (e) => { if (e.target === pal) pal.hidden = true; });
    inp.addEventListener("input", render);
    inp.addEventListener("keydown", (e) => {
      const items = $$("a", res); let i = items.findIndex((a) => a.getAttribute("aria-selected") === "true");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[i]?.removeAttribute("aria-selected"); i = (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[i].setAttribute("aria-selected", "true"); items[i].scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter" && items[i]) location.href = items[i].getAttribute("href");
    });
  }

  /* Painel lateral: empurra o conteúdo em vez de cobrir (os chats e a folha ficam ao lado da conta). */
  let sideOpener = null;
  /* R1: ao abrir, o foco vai para o painel; Esc fecha e devolve o foco a quem abriu. */
  function openSide(html) { const s = $("#side"); if (s.hidden) sideOpener = document.activeElement; s.innerHTML = html; s.hidden = false; $(".app").classList.add("with-panel"); icons();
    $("[data-close]", s)?.addEventListener("click", closeSide);
    const h = $("h2", s); if (h) { s.setAttribute("aria-label", h.textContent.trim()); h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function closeSide() { const s = $("#side"); s.hidden = true; s.innerHTML = ""; $(".app").classList.remove("with-panel"); if (sideOpener && document.contains(sideOpener)) sideOpener.focus({ preventScroll: true }); sideOpener = null; }

  /* R2: termos do sistema com explicação curta (glossário do guia do cliente). */
  const GLOSS = {
    memoria: ["Memória de cálculo", "A conta de quanto a cliente deve, item a item, com correção e juros mês a mês. Cada mudança gera uma versão nova."],
    provisao: ["Provisão", "Estimativa feita antes da sentença, a partir dos pedidos. Serve para planejar; não é aprovada e não gera guia."],
    dataref: ["Data de referência", "A data até a qual a conta é atualizada. O ideal é a data em que o valor será pago."],
    parte: ["Parte da cliente", "Quanto do total cabe à cliente quando há outras empresas condenadas junto."],
    verba: ["Verba", "Cada item da condenação, como danos morais, custas ou honorários."],
    guia: ["Guia", "O boleto judicial para pagar o valor aprovado."],
    total: ["Total devido", "A soma de todas as verbas, corrigidas e com juros até a data de referência."],
  };
  const term = (label, key) => GLOSS[key] ? `<span class="term" tabindex="0" data-term="${key}" aria-describedby="termPop">${esc(label)}</span>` : esc(label);
  function bindTerms() {
    const pop = $("#termPop");
    const show = (el) => { const [t, d] = GLOSS[el.dataset.term]; pop.innerHTML = `<b>${esc(t)}</b><br>${esc(d)}`; pop.hidden = false;
      const r = el.getBoundingClientRect(); pop.style.top = (r.bottom + scrollY + 6) + "px"; pop.style.left = Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - pop.offsetWidth - 8)) + "px"; };
    const hide = () => (pop.hidden = true);
    document.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-term]"); if (t) show(t); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest("[data-term]")) hide(); });
    document.addEventListener("focusin", (e) => { const t = e.target.closest("[data-term]"); t ? show(t) : hide(); });
    document.addEventListener("click", (e) => { const t = e.target.closest("[data-term]"); t ? show(t) : hide(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  }

  function confirmDialog({ title, body, ok = "Confirmar", danger = false, onOk }) {
    const d = $("#dlg");
    d.innerHTML = `<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">${title}</h2><div>${body}</div>
      <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-x>Cancelar</button><button class="btn ${danger ? "danger" : "primary"}" data-ok>${ok}</button></div></div>`;
    d.hidden = false; icons();
    $("[data-x]", d).onclick = closeDialog; $("[data-ok]", d).onclick = () => { closeDialog(); onOk && onOk(); };
    $("[data-ok]", d).focus();
  }
  function closeDialog() { const d = $("#dlg"); if (d) { d.hidden = true; d.innerHTML = ""; } }
  function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => (el.hidden = true), 3200); }

  window.UI = { chg, term, $, $$, esc, money, proc, badge, person, valueTag, clientTag, icons, shell, openSide, closeSide, confirmDialog, toast, myQueue, D };
})();
