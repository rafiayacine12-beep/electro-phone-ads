/* Electro Phone — creatives animation trigger + order form helpers (no deps) */
(function () {
  var d = document, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }

  /* --- scroll-driven reveal + parallax for creatives, carousel focus --- */
  var rv = $$(".ep-rv"), car = $(".car"), cfs = car ? $$(".cf", car) : [], live = [], ticking = false;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    live.forEach(function (el) {
      var r = el.getBoundingClientRect(), st = vh * 0.96, en = vh * 0.5;
      var p = clamp((st - r.top) / (st - en), 0, 1);
      el.style.setProperty("--p", ease(p).toFixed(3));
      el.style.setProperty("--py", clamp(((r.top + r.height / 2) - vh / 2) * -0.05, -12, 12).toFixed(1) + "px");
      if (p >= 1) el.classList.add("is-in");
    });
    if (car) {
      var cr = car.getBoundingClientRect(), mid = cr.left + cr.width / 2;
      cfs.forEach(function (f) {
        var fr = f.getBoundingClientRect(), dist = Math.abs((fr.left + fr.width / 2) - mid) / cr.width;
        f.style.setProperty("--s", (1 - clamp(dist, 0, 0.6) * 0.18).toFixed(3));
        f.style.setProperty("--o", (1 - clamp(dist, 0, 0.6) * 0.7).toFixed(3));
      });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (reduce) { rv.forEach(function (el) { el.style.setProperty("--p", 1); el.style.setProperty("--py", "0px"); }); }
  else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var i = live.indexOf(e.target); if (e.isIntersecting) { if (i < 0) live.push(e.target); } else if (i >= 0) live.splice(i, 1); });
      req();
    }, { rootMargin: "80px 0px" });
    rv.forEach(function (el) { io.observe(el); });
    window.addEventListener("scroll", req, { passive: true }); window.addEventListener("resize", req);
    if (car) car.addEventListener("scroll", req, { passive: true });
    req();
  } else rv.forEach(function (el) { el.style.setProperty("--p", 1); });

  /* --- numbers band: count-up when it scrolls into view --- */
  var nums = $(".ep-nums");
  if (nums && !reduce && "IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; nio.disconnect();
      $$("b[data-t]", nums).forEach(function (b) {
        var t = b.getAttribute("data-t"), t0 = null;
        (function step(now) { if (!t0) t0 = now; var p = Math.min(1, (now - t0) / 1000), e = 1 - Math.pow(1 - p, 3);
          b.textContent = t.replace(/\d+/g, function (n) { return Math.round(+n * e); });
          if (p < 1) requestAnimationFrame(step); else b.textContent = t; })(performance.now());
      });
    }, { threshold: 0.5 });
    nio.observe(nums);
  }

  /* --- after the order: upsell + cross-sell (prices come from catalog.json, re-checked by the server) --- */
  var doneEl = $("#done"), upBox = $("#ep-up"), offered = false, catalog = null;
  function el(tag, cls, txt) { var n = d.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function loadCatalog() {
    if (catalog) return Promise.resolve(catalog);
    return fetch("catalog.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (j) { return (catalog = j || {}); });
  }
  var ICON = {
    iphone: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2" width="11" height="20" rx="3"/><path d="M10 4.6h4"/></svg>',
    android: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2" width="11" height="20" rx="3"/><circle cx="12" cy="5.2" r=".9"/></svg>'
  };
  function offerFor(ref, cat) {
    var items = [], u = cat.upsell;
    if (u && u.enabled && u.id && +u.price > 0) items.push({ id: u.id, name: u.name, price: +u.price, was: +u.was || 0, img: u.img, text: u.text, up: true });
    (Array.isArray(cat.cross) ? cat.cross : []).forEach(function (x) { if (x && x.id && +x.price > 0) items.push({ id: x.id, name: x.name, price: +x.price, was: +x.was || 0, img: x.img, text: x.text, banner: !!x.banner, platform: x.platform === "iphone" || x.platform === "android" ? x.platform : "" }); });
    if (!items.length) return;
    var picked = {}, cards = {}, form = $("#form"), cfg = window.CONFIG || {};
    var plats = items.filter(function (i) { return i.platform; }), hasPlat = plats.length > 0;
    upBox.textContent = "";
    upBox.appendChild(el("h4", "", hasPlat ? "عندنا ليك باك بثمن واعر" : "قبل ما تمشي، شوف هاد العروض"));
    upBox.appendChild(el("p", "ep-up-s", hasPlat ? "كتزاد لنفس الطلبية، والتوصيل مجاني، وكتخلّص عند الاستلام." : "كتزاد لنفس الطلبية وكتخلّص كلشي عند الاستلام."));
    var plat = null, list = el("div", "ep-up-list");
    if (hasPlat) {
      upBox.appendChild(el("p", "ep-q", "شنو نوع التيليفون ديالك؟"));
      plat = el("div", "ep-plat"); plat.setAttribute("role", "group");
      [["iphone", "iPhone"], ["android", "Android"]].forEach(function (p) {
        if (!plats.some(function (i) { return i.platform === p[0]; })) return;
        var b = el("button", "ep-plat-b"); b.type = "button"; b.setAttribute("data-p", p[0]); b.setAttribute("aria-pressed", "false");
        var ic = el("span", "ep-plat-i"); ic.innerHTML = ICON[p[0]]; b.appendChild(ic); b.appendChild(el("b", "", p[1])); plat.appendChild(b);
      });
      upBox.appendChild(plat);
    }
    upBox.appendChild(list);
    var btn = el("button", "btn btn-glow ep-up-btn", "اختار شي حاجة"); btn.type = "button"; btn.disabled = true;
    var skip = el("button", "ep-up-skip", "لا، شكراً"); skip.type = "button";
    var msg = el("p", "ep-up-msg"); msg.setAttribute("role", "status");
    function recalc() {
      var n = 0, t = 0; items.forEach(function (i) { if (picked[i.id]) { n++; t += i.price; } });
      btn.hidden = hasPlat && !n; btn.disabled = !n; btn.textContent = n ? "أضف للطلب (+" + t + " درهم)" : "اختار شي حاجة";
    }
    function setPicked(i, on) {
      picked[i.id] = on; var card = cards[i.id]; card.classList.toggle("on", on); card.setAttribute("aria-pressed", on ? "true" : "false");
      var ad = $(".ep-up-add", card); if (ad) ad.textContent = on ? "✓ تزاد لطلبيتك" : "زيدو لطلبيتي";
    }
    items.forEach(function (i) {
      var card = el("button", "ep-up-card" + (i.up ? " is-up" : "") + (i.banner ? " is-banner" : "")); card.type = "button"; card.setAttribute("aria-pressed", "false");
      cards[i.id] = card;
      if (i.up) card.appendChild(el("span", "ep-up-badge", "عرض خاص"));
      if (i.banner) card.appendChild(el("span", "ep-up-badge", "توصيل مجاني معا الطلبية"));
      if (i.img) { var im = d.createElement("img"); im.src = i.img; im.alt = i.banner ? i.name : ""; im.width = i.banner ? 800 : 72; im.height = i.banner ? 800 : 72; im.loading = "lazy"; card.appendChild(im); }
      var t = el("span", "ep-up-t"); t.appendChild(el("b", "", i.name)); if (i.text) t.appendChild(el("small", "", i.text)); card.appendChild(t);
      var pr = el("span", "ep-up-p"); pr.appendChild(el("b", "", "+" + i.price + " درهم")); if (i.was) pr.appendChild(el("s", "", i.was + " درهم")); card.appendChild(pr);
      if (i.banner) card.appendChild(el("span", "ep-up-add", "زيدو لطلبيتي"));
      card.appendChild(el("span", "ep-up-chk", "✓"));
      if (i.platform) card.hidden = true;
      card.addEventListener("click", function () { setPicked(i, !picked[i.id]); recalc(); });
      list.appendChild(card);
    });
    if (plat) {
      $$(".ep-plat-b", plat).forEach(function (b) {
        b.addEventListener("click", function () {
          var p = b.getAttribute("data-p");
          $$(".ep-plat-b", plat).forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
          plats.forEach(function (i) { var show = i.platform === p; cards[i.id].hidden = !show; if (!show && picked[i.id]) setPicked(i, false); if (show) { cards[i.id].classList.remove("pop"); void cards[i.id].offsetWidth; cards[i.id].classList.add("pop"); } });
          recalc();
        });
      });
    }
    upBox.appendChild(btn); upBox.appendChild(msg); upBox.appendChild(skip);
    skip.addEventListener("click", function () { upBox.hidden = true; });
    recalc();
    btn.addEventListener("click", function () {
      var sel = items.filter(function (i) { return picked[i.id]; }).map(function (i) { return { id: i.id, qty: 1 }; });
      if (!sel.length || !cfg.orderEndpoint) return;
      btn.disabled = true; msg.textContent = "جاري الإضافة...";
      var f = form.elements;
      fetch(cfg.orderEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addon", ref: ref, items: sel, customer: { name: f.namedItem("name").value, phone: f.namedItem("phone").value, city: f.namedItem("city").value } }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, j: j }; }); })
        .then(function (res) {
          if (!res.ok) { btn.disabled = false; msg.textContent = (res.j && res.j.message) || "تعذّرت الإضافة. حاول مرة أخرى."; return; }
          upBox.textContent = "";
          upBox.appendChild(el("p", "ep-up-ok", "✓ تزادت لطلبيتك (+" + res.j.added + " درهم)"));
          upBox.appendChild(el("p", "ep-up-s", "غادي نأكدو كلشي معاك فالمكالمة، وكتخلّص ملي توصلك الطلبية."));
        })
        .catch(function () { btn.disabled = false; msg.textContent = "تعذّر الاتصال. حاول مرة أخرى."; });
    });
    upBox.hidden = false;
  }
  function checkDone() {
    if (offered || !doneEl || doneEl.hidden || /\b(warn|fail)\b/.test(doneEl.className)) return;
    var m = /EP-\d{6}-[0-9A-F]{6}/.exec(($("#done-sum") || {}).textContent || ""); if (!m) return;
    offered = true; loadCatalog().then(function (c) { offerFor(m[0], c); });
  }
  if (doneEl && upBox && "MutationObserver" in window) new MutationObserver(checkDone).observe(doneEl, { attributes: true, attributeFilter: ["hidden", "class"] });

  /* --- header: shadow once scrolled --- */
  var hd = $("#hd");
  if (hd) { var hs = function () { hd.classList.toggle("stuck", window.scrollY > 40); }; window.addEventListener("scroll", hs, { passive: true }); hs(); }

  /* --- order form: progress + delivery estimate --- */
  var form = $("#form"), bar = $(".ep-prog i"), lab = $(".ep-prog-t"), eta = $("#ep-eta");
  var DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  function etaText() {
    var a = new Date(), b = new Date(); a.setDate(a.getDate() + 1); b.setDate(b.getDate() + 2);
    return "غادي توصلك بين " + DAYS[a.getDay()] + " و" + DAYS[b.getDay()];
  }
  if (eta) eta.textContent = etaText();
  function progress() {
    if (!form || !bar) return;
    var n = form.elements.namedItem("name").value.trim().length >= 2,
      ph = /^(\+?212|0)[5-7][0-9]{8}$/.test(form.elements.namedItem("phone").value.replace(/[\s.-]/g, "")),
      c = form.elements.namedItem("city").value.trim().length >= 2,
      k = (n ? 1 : 0) + (ph ? 1 : 0) + (c ? 1 : 0);
    bar.style.transform = "scaleX(" + (k / 3) + ")";
    if (lab) lab.textContent = k === 3 ? "كلشي واجد، أكّد الطلب" : "باقي " + (3 - k) + (3 - k === 1 ? " خانة" : " خانات");
    form.classList.toggle("ready", k === 3);
  }
  if (form) { form.addEventListener("input", progress); form.addEventListener("change", progress); progress(); }
})();
