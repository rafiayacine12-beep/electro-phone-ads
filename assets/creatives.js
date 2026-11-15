/* Electro Phone — creatives animation trigger + order form helpers (no deps) */
(function () {
  var d = document, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }

  /* --- play each creative when it scrolls into view; pause when out of view --- */
  var crs = $$(".cr");
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to")), t0 = null, dur = 1100;
    if (reduce) { el.textContent = to; return; }
    (function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!e.target.classList.contains("go")) { e.target.classList.add("go"); $$("[data-to]", e.target).forEach(countUp); } e.target.classList.remove("off"); }
        else e.target.classList.add("off");
      });
    }, { threshold: 0.35 });
    crs.forEach(function (c) { io.observe(c); });
  } else crs.forEach(function (c) { c.classList.add("go"); $$("[data-to]", c).forEach(function (n) { n.textContent = n.getAttribute("data-to"); }); });

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
