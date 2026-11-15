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
