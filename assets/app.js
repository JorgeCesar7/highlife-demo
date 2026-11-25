/* High Life Smoke Shop, maqueta de Lampstand */
const STORES = [
  { id: "BV", ship: true, cid: "11975982351226600082", name: "Bella Vista", city: "Santo Domingo", addr: "Av. Rómulo Betancourt, Santo Domingo", wa: "18099696363",
    maps: "High Life Smoke Shop, Av. Rómulo Betancourt, Santo Domingo",
    hours: [["10:00", "19:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"]] },
  { id: "OZ", ship: false, cid: "7839505212516953428", name: "Ensanche Ozama", city: "Santo Domingo Este", addr: "Dr. Octavio Mejía Ricart 42, Santo Domingo Este", wa: "18494439786",
    maps: "High Life Smoke Shop Ensanche Ozama, Dr. Octavio Mejía Ricart 42, Santo Domingo Este",
    hours: [null, ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"]] },
  { id: "STI", ship: true, cid: "18119743240042916362", name: "Santiago", city: "Santiago de los Caballeros", addr: "C. Benito Monción 56, Santiago de los Caballeros", wa: "18299697244",
    maps: "High Life Smoke Shop Santiago, C. Benito Monción 56, Santiago de los Caballeros",
    hours: [["10:00", "18:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "21:00"], ["10:00", "19:00"]] },
  { id: "PC", ship: true, cid: "12903321818616243635", name: "Punta Cana", city: "Punta Cana", addr: "Plaza Artística, Av. Alemania, Punta Cana", wa: "18299693991",
    maps: "High Life Smoke Shop Punta Cana, Plaza Artística, Av. Alemania, Punta Cana",
    hours: [["10:00", "15:00"], ["10:00", "20:00"], ["10:00", "20:00"], ["10:00", "20:00"], ["10:00", "20:00"], ["10:00", "20:00"], ["10:00", "18:00"]] },
];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WA_SVG = '<svg class="wa-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';
const fmt = n => "RD$" + n.toLocaleString("es-DO");
const t12 = s => { let [h, m] = s.split(":").map(Number); const ap = h >= 12 ? "p. m." : "a. m."; h = h % 12 || 12; return `${h}${m ? ":" + String(m).padStart(2, "0") : ""} ${ap}`; };
const store = id => STORES.find(s => s.id === id);
const waUrl = (s, text) => s.wa ? `https://wa.me/${s.wa}?text=${encodeURIComponent(text)}` : s.waLink;
const mapsUrl = s => "https://maps.google.com/?cid=" + s.cid;
const safe = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

/* Verificación de edad: la ley 48-00 prohíbe vender tabaco a menores de 18 años */
function ageGate() {
  const g = document.getElementById("gate");
  if (!g) return;
  if (safe.get("hl-18") === "si") return;
  g.hidden = false;
  document.body.style.overflow = "hidden";
  g.querySelector("[data-yes]").focus();
  g.querySelector("[data-yes]").addEventListener("click", () => { safe.set("hl-18", "si"); g.hidden = true; document.body.style.overflow = ""; });
  g.querySelector("[data-no]").addEventListener("click", () => { g.querySelector(".no-msg").hidden = false; });
}

/* Día de hoy según la hora de República Dominicana (no la del visitante), se recalcula en cada visita */
function drDay() {
  try { return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Santo_Domingo" }).format(new Date())); }
  catch (e) { return new Date().getDay(); }
}
/* Horario especial (feriados): solo aquí se escribe, y solo ese día sale una línea arriba del horario.
   Formato: "2026-12-25": { BV: null, OZ: ["10:00", "14:00"] }  (null = cerrado) */
const SPECIAL = {};
function drDate() {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date()); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
const hrs = h => h ? `${t12(h[0])} a ${t12(h[1])}` : "cerrado";
function todayLine(s) {
  const d = drDay(), sp = SPECIAL[drDate()];
  if (sp && s.id in sp) return `Hoy, horario especial: <b>${hrs(sp[s.id])}</b>`;
  return `Hoy, ${DAYS[d].toLowerCase()}: <b>${hrs(s.hours[d])}</b>`;
}

/* Las tiendas vienen en el HTML (lo leen Google y los rastreadores de IA sin JavaScript); aquí solo se marca el día de hoy */
function renderStores() {
  const d = drDay();
  document.querySelectorAll(".store[data-store], .tile[data-store]").forEach(card => {
    const s = store(card.dataset.store);
    const today = card.querySelector(".today"); if (today) today.innerHTML = todayLine(s);
    const sp = SPECIAL[drDate()], spEl = card.querySelector(".special");
    if (spEl && sp && s.id in sp) { spEl.innerHTML = `Hoy, horario especial: <b>${hrs(sp[s.id])}</b>`; spEl.hidden = false; }
    card.querySelectorAll("tr[data-day]").forEach(tr => tr.classList.toggle("is-today", Number(tr.dataset.day) === d));
  });
}

/* ---------- Catálogo conectado al inventario ---------- */
let INV = null, branch = "ALL", query = "", bag = {};
const state = (n) => n === 0 ? "out" : n <= 3 ? "low" : "ok";
const stateTxt = (n) => n === 0 ? "agotado" : n <= 3 ? `quedan ${n}` : "disponible";

async function loadInventory() {
  const res = await fetch("data/inventario-claro.json", { cache: "no-store" });
  INV = await res.json();
  const when = new Date(INV.actualizado);
  document.querySelectorAll("[data-sync]").forEach(el => el.textContent = "Disponibilidad actualizada, " + when.toLocaleDateString("es-DO", { day: "numeric", month: "short" }) + " " + when.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" }));
}

function renderMenu() {
  const out = document.getElementById("menu");
  const nav = document.getElementById("catnav");
  const q = query.trim().toLowerCase();
  const cats = [...new Set(INV.productos.map(p => p.categoria))];
  let html = "", navHtml = "";
  cats.forEach(c => {
    const list = INV.productos.filter(p => p.categoria === c && (!q || p.descripcion.toLowerCase().includes(q)));
    if (!list.length) return;
    const slug = c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");
    navHtml += `<a href="#${slug}">${c} <small>${list.length}</small></a>`;
    html += `<section class="group" id="${slug}" aria-labelledby="h-${slug}"><h2 id="h-${slug}">${c}</h2><div class="items">${list.map(itemHtml).join("")}</div></section>`;
  });
  out.innerHTML = html || `<p class="empty">No hay productos que coincidan con “${query}”. Prueba con otra palabra o escríbenos por WhatsApp.</p>`;
  nav.innerHTML = navHtml;
}

/* Cantidad en la tarjeta: + agrega; luego − n + hasta lo que hay en existencia */
const maxFor = p => branch === "ALL" ? Math.max(...STORES.map(s => p.existencias[s.id])) : p.existencias[branch];
function addCtl(p) {
  const q = bag[p.codigo] || 0, max = maxFor(p);
  if (!q) return `<button class="add" data-act="inc" aria-label="Añadir a mi pedido: ${p.descripcion}" ${max === 0 ? "disabled" : ""}>+</button>`;
  return `<span class="qty qty-card" role="group" aria-label="Cantidad de ${p.descripcion} en mi pedido"><button data-act="dec" aria-label="Quitar uno">−</button><output aria-live="polite">${q}</output><button data-act="inc" aria-label="Añadir uno" ${q >= max ? `disabled title="No hay más en existencia"` : ""}>+</button></span>`;
}

function itemHtml(p) {
  const shown = branch === "ALL" ? STORES : [store(branch)];
  const total = shown.reduce((a, s) => a + p.existencias[s.id], 0);
  const avail = shown.map(s => { const n = p.existencias[s.id], k = state(n); return `<span class="${k}"><i class="dot ${k}"></i>${s.name}${branch === "ALL" ? "" : ": " + stateTxt(n)}</span>`; }).join("");
  return `<article class="item" data-code="${p.codigo}"><img class="pimg" src="assets/fotos/${(window.FOTOS || {})[p.codigo] || "papeles-a"}-sm.webp" alt="${p.descripcion}" width="400" height="400" loading="lazy">
    <div class="pbody"><h3>${p.descripcion}</h3>
    <div class="avail" aria-label="Disponibilidad por tienda">${avail}</div>
    <div class="pfoot"><span class="price">${fmt(p.precio)}</span>
    <span class="ctl">${addCtl(p)}</span></div></div>
  </article>`;
}

function bagCount() { return Object.values(bag).reduce((a, b) => a + b, 0); }
function updateBagBtn() {
  const b = document.getElementById("bagBtn");
  b.querySelector(".n").textContent = bagCount();
  b.hidden = bagCount() === 0;
}

const bagTotal = () => Object.entries(bag).reduce((a, [code, qty]) => a + INV.productos.find(x => x.codigo === code).precio * qty, 0);
const radio = n => document.querySelector(`input[name="${n}"]:checked`).value;

function renderDrawer() {
  const sel = document.getElementById("pickStore");
  const s = store(sel.value);
  const body = document.getElementById("bagLines");
  let short = false;
  body.innerHTML = Object.entries(bag).map(([code, qty]) => {
    const p = INV.productos.find(x => x.codigo === code);
    const n = p.existencias[s.id]; if (n < qty) short = true;
    return `<div class="line"><span>${p.descripcion}<br><small>${fmt(p.precio)} c/u</small></span>
      <span class="qty"><button data-q="-1" data-c="${code}" aria-label="Quitar uno">−</button><output>${qty}</output><button data-q="1" data-c="${code}" aria-label="Añadir uno">+</button></span>
      ${n < qty ? `<span class="warn">${n === 0 ? "Agotado" : "Solo quedan " + n} en ${s.name}. Prueba otra tienda.</span>` : ""}</div>`;
  }).join("") || `<p class="empty">Tu pedido está vacío. Toca + en cualquier producto para añadirlo.</p>`;
  document.getElementById("bagTotal").textContent = fmt(bagTotal());
  const ship = document.querySelector('input[name="how"][value="ship"]');
  ship.disabled = !s.ship;
  ship.nextElementSibling.textContent = s.ship ? "Entrega a domicilio" : `Entrega a domicilio (no disponible en ${s.name})`;
  if (!s.ship && ship.checked) document.querySelector('input[name="how"][value="pick"]').checked = true;
  document.getElementById("payCaja").textContent = radio("how") === "ship" ? "En efectivo al recibir" : "En caja al retirar";
  const send = document.getElementById("sendOrder");
  send.disabled = bagCount() === 0 || short;
  send.textContent = radio("pay") === "card" ? `Pagar ${fmt(bagTotal())} y confirmar` : "Confirmar pedido";
}

/* Simulación de fase 2: el pedido entra a Claro, descuenta existencias y la tienda lo prepara */
function confirmOrder() {
  const s = store(document.getElementById("pickStore").value), how = radio("how"), pay = radio("pay");
  const total = bagTotal(), items = Object.entries(bag);
  items.forEach(([code, qty]) => { INV.productos.find(x => x.codigo === code).existencias[s.id] -= qty; });
  const num = `HL-${s.id}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const now = new Date().toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" });
  bag = {}; updateBagBtn(); renderMenu();
  document.querySelectorAll("[data-sync]").forEach(el => el.textContent = "Disponibilidad actualizada, " + now);
  document.getElementById("bagLines").innerHTML = `<div class="done">
    <p class="done-t">Pedido recibido</p>
    <p class="done-n">${num}</p>
    <p>${how === "ship" ? `High Life ${s.name} te lo lleva a domicilio. Te avisamos cuando salga.` : `Te avisamos cuando esté listo para retirar en High Life ${s.name}.`}
    ${pay === "card" ? `Pagaste ${fmt(total)} con tarjeta.` : `Pagas ${fmt(total)} ${how === "ship" ? "al recibir" : "en caja al retirar"}.`}</p>
    <p class="fine">Lleva tu cédula: vendemos solo a mayores de 18 años.</p>
    <p class="note-tag sm">Nota para High Life: así entra en Claro: pedido ${num} en el almacén ${s.name}, ${items.length} producto${items.length > 1 ? "s" : ""}, existencias descontadas. ${pay === "card" ? "Cobro con Cardnet Web." : "Se factura al entregar."}</p>
  </div>`;
  document.querySelector("#drawer .drawer-foot").hidden = true;
}

function openDrawer() { const d = document.getElementById("drawer"); document.querySelector("#drawer .drawer-foot").hidden = false; renderDrawer(); d.hidden = false; d.querySelector(".x").focus(); }
function closeDrawer() { document.getElementById("drawer").hidden = true; document.getElementById("bagBtn").focus(); }

/* Simulación: una venta facturada en Claro descuenta la existencia y el catálogo se actualiza */
function setupSim() {
  const ps = document.getElementById("simProduct"), ss = document.getElementById("simStore"), log = document.getElementById("simLog");
  ps.innerHTML = INV.productos.map(p => `<option value="${p.codigo}">${p.descripcion}</option>`).join("");
  ss.innerHTML = STORES.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const pick = INV.productos.find(p => p.existencias.BV >= 2 && p.existencias.BV <= 3) || INV.productos[0];
  ps.value = pick.codigo; ss.value = "BV";
  document.getElementById("simSell").addEventListener("click", () => {
    const p = INV.productos.find(x => x.codigo === ps.value), s = store(ss.value);
    if (p.existencias[s.id] === 0) { log.insertAdjacentHTML("afterbegin", `<div>${p.descripcion} ya está agotado en ${s.name}. Elige otro producto o tienda.</div>`); return; }
    p.existencias[s.id] -= 1;
    const now = new Date().toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", second: "2-digit" });
    log.insertAdjacentHTML("afterbegin", `<div>${now}: factura en ${s.name}, 1 x ${p.descripcion}. Quedan ${p.existencias[s.id]}.</div>`);
    document.querySelectorAll("[data-sync]").forEach(el => el.textContent = "Disponibilidad actualizada, " + now);
    renderMenu();
    const row = document.querySelector(`.item[data-code="${p.codigo}"]`);
    if (row) { row.classList.add("flash"); }
  });
  document.getElementById("simView").addEventListener("click", () => {
    const row = document.querySelector(`.item[data-code="${ps.value}"]`);
    if (row) { row.scrollIntoView({ behavior: "smooth", block: "center" }); row.classList.remove("flash"); void row.offsetWidth; row.classList.add("flash"); }
  });
}

async function catalog() {
  if (!document.getElementById("menu")) return;
  await loadInventory();
  const qp = new URLSearchParams(location.search).get("tienda"); if (qp && store(qp)) branch = qp;
  const chips = document.getElementById("branchChips");
  chips.insertAdjacentHTML("beforeend", [{ id: "ALL", name: "Todas" }, ...STORES].map(s => `<button class="chip" data-b="${s.id}" aria-pressed="${s.id === branch}">${s.name}</button>`).join(""));
  chips.addEventListener("click", e => { const b = e.target.closest("[data-b]"); if (!b) return; branch = b.dataset.b; chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.b === branch)); if (branch !== "ALL") document.getElementById("pickStore").value = branch; renderMenu(); });
  document.getElementById("q").addEventListener("input", e => { query = e.target.value; renderMenu(); });
  document.getElementById("menu").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const item = b.closest(".item"), code = item.dataset.code, act = b.dataset.act;
    const p = INV.productos.find(x => x.codigo === code);
    bag[code] = (bag[code] || 0) + (act === "inc" ? 1 : -1); if (bag[code] <= 0) delete bag[code];
    const ctl = item.querySelector(".ctl"); ctl.innerHTML = addCtl(p);
    (ctl.querySelector(`[data-act="${act}"]:not(:disabled)`) || ctl.querySelector("button:not(:disabled)"))?.focus();
    updateBagBtn();
    const bb = document.getElementById("bagBtn"); bb.classList.remove("bump"); void bb.offsetWidth; bb.classList.add("bump");
  });
  const sel = document.getElementById("pickStore");
  sel.innerHTML = STORES.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (branch !== "ALL") sel.value = branch;
  sel.addEventListener("change", renderDrawer);
  document.getElementById("bagBtn").addEventListener("click", openDrawer);
  document.querySelector("#drawer .x").addEventListener("click", closeDrawer);
  document.getElementById("drawer").addEventListener("click", e => { if (e.target.id === "drawer") closeDrawer(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !document.getElementById("drawer").hidden) closeDrawer(); });
  document.getElementById("bagLines").addEventListener("click", e => {
    const b = e.target.closest("[data-q]"); if (!b) return;
    const c = b.dataset.c; bag[c] = (bag[c] || 0) + Number(b.dataset.q); if (bag[c] <= 0) delete bag[c];
    renderDrawer(); renderMenu(); updateBagBtn();
  });
  document.getElementById("sendOrder").addEventListener("click", confirmOrder);
  document.querySelectorAll('#drawer input[type="radio"]').forEach(r => r.addEventListener("change", renderDrawer));
  const fromHash = decodeURIComponent(location.hash.slice(1));
  renderMenu(); updateBagBtn(); setupSim();
  if (fromHash) { const el = document.getElementById(fromHash); if (el) el.scrollIntoView(); }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) document.querySelectorAll("#catnav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  new MutationObserver(() => document.querySelectorAll(".group").forEach(g => io.observe(g))).observe(document.getElementById("menu"), { childList: true });
  document.querySelectorAll(".group").forEach(g => io.observe(g));
}

function mapTabs() {
  const tabs = document.querySelectorAll(".map-tab"); if (!tabs.length) return;
  const frame = document.getElementById("map-frame"), go = document.getElementById("map-go");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.setAttribute("aria-pressed", x === t));
    frame.src = t.dataset.src; frame.title = "Mapa de High Life Smoke Shop " + t.dataset.name;
    go.href = t.dataset.go; go.textContent = "Abrir " + t.dataset.name + " en Google Maps";
  }));
}
function waMenu() {
  const b = document.getElementById("waBtn"), l = document.getElementById("waList"); if (!b) return;
  const set = open => { l.hidden = !open; b.setAttribute("aria-expanded", open); };
  b.addEventListener("click", e => { e.stopPropagation(); set(l.hidden); if (!l.hidden) l.querySelector("a").focus(); });
  document.addEventListener("click", e => { if (!l.hidden && !l.contains(e.target)) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !l.hidden) { set(false); b.focus(); } });
}
function coinTilt() {
  const b = document.getElementById("badge"); if (!b) return;
  const coin = b.querySelector(".coin");
  if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
  b.addEventListener("pointermove", e => {
    const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    coin.style.setProperty("--ry", ((x - .5) * 22).toFixed(1) + "deg");
    coin.style.setProperty("--rx", ((.5 - y) * 22).toFixed(1) + "deg");
    coin.style.setProperty("--gx", (15 + x * 50).toFixed(0) + "%");
    coin.style.setProperty("--gy", (10 + y * 40).toFixed(0) + "%");
  });
  b.addEventListener("pointerleave", () => { ["--rx", "--ry", "--gx", "--gy"].forEach(v => coin.style.removeProperty(v)); });
}
document.addEventListener("DOMContentLoaded", () => { coinTilt(); ageGate(); waMenu(); renderStores(); mapTabs(); catalog(); });
