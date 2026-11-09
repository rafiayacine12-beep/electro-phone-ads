/* Electro Phone — Pack 2 landing. Vanilla JS, no dependencies.
   Pure logic at the top (unit-tested in Node); DOM wiring below. */
(function (root) {
  "use strict";
  var CONFIG = root.CONFIG || {};
  var PRICE = CONFIG.unitPrice || 179;
  var MAX_QTY = 3;
  var PRODUCT = { id: "pack2-earbuds", name: "باك 2 سماعات بلا خيط" };

  /* ================= pure logic ================= */
  function total(q) { q = Number(q); return (q >= 1 && q <= MAX_QTY && q % 1 === 0) ? q * PRICE : NaN; }
  function dh(n) { return n + " درهم"; }
  function qtyLabel(q) { return q === 1 ? "باك واحد" : q === 2 ? "جوج باكات" : q + " باكات"; }

  function normPhone(v) {
    var d = String(v || "").replace(/[\s.\-()‎‏]/g, "")
      .replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }); // Arabic-Indic digits
    if (/^\+212[5-7]\d{8}$/.test(d)) return "0" + d.slice(4);
    if (/^00212[5-7]\d{8}$/.test(d)) return "0" + d.slice(5);
    if (/^212[5-7]\d{8}$/.test(d)) return "0" + d.slice(3);
    if (/^0[5-7]\d{8}$/.test(d)) return d;
    return null;
  }
  function cleanText(v, max) { return String(v || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
  function validName(v) {
    v = cleanText(v, 80);
    var letters = (v.match(/[A-Za-z؀-ۿ]/g) || []).length;
    return v.length >= 3 && letters >= 3 && !/\d{3,}/.test(v) && !/(.)\1{4,}/.test(v);
  }

  var CITIES = [
    ["الدار البيضاء", "casablanca casa dar el beida كازا", 33.573, -7.590], ["الرباط", "rabat", 34.021, -6.842],
    ["سلا", "sale salé", 34.034, -6.800], ["تمارة", "temara", 33.929, -6.906], ["القنيطرة", "kenitra", 34.261, -6.580],
    ["فاس", "fes fez", 34.033, -5.000], ["مكناس", "meknes", 33.894, -5.547], ["مراكش", "marrakech marrakesh", 31.630, -7.981],
    ["أكادير", "agadir اكادير", 30.428, -9.598], ["طنجة", "tanger tangier tanja", 35.760, -5.834], ["تطوان", "tetouan", 35.579, -5.368],
    ["وجدة", "oujda", 34.681, -1.909], ["الناظور", "nador", 35.168, -2.934], ["الحسيمة", "al hoceima alhoceima", 35.252, -3.937],
    ["بني ملال", "beni mellal", 32.337, -6.350], ["خريبكة", "khouribga", 32.881, -6.906], ["سطات", "settat", 33.001, -7.617],
    ["برشيد", "berrechid", 33.266, -7.588], ["المحمدية", "mohammedia", 33.687, -7.383], ["الجديدة", "el jadida eljadida", 33.232, -8.501],
    ["آسفي", "safi اسفي", 32.299, -9.237], ["الصويرة", "essaouira", 31.509, -9.760], ["تازة", "taza", 34.210, -4.010],
    ["الخميسات", "khemisset", 33.824, -6.066], ["العرائش", "larache", 35.193, -6.156], ["القصر الكبير", "ksar el kebir ksar kbir", 35.002, -5.910],
    ["شفشاون", "chefchaouen chaouen", 35.169, -5.264], ["الفنيدق", "fnideq", 35.850, -5.358], ["المضيق", "mdiq m'diq", 35.685, -5.325],
    ["ورزازات", "ouarzazate", 30.919, -6.893], ["الراشيدية", "errachidia", 31.931, -4.425], ["تارودانت", "taroudant", 30.470, -8.877],
    ["تزنيت", "tiznit", 29.697, -9.732], ["كلميم", "guelmim", 28.987, -10.057], ["العيون", "laayoune", 27.125, -13.163],
    ["الداخلة", "dakhla", 23.685, -15.958], ["إنزكان", "inezgane انزكان", 30.355, -9.537], ["أيت ملول", "ait melloul ايت ملول", 30.334, -9.497],
    ["بركان", "berkane", 34.920, -2.320], ["تاوريرت", "taourirt", 34.407, -2.897], ["سيدي سليمان", "sidi slimane", 34.265, -5.925],
    ["سيدي قاسم", "sidi kacem", 34.222, -5.708], ["الفقيه بن صالح", "fquih ben salah", 32.502, -6.691], ["قلعة السراغنة", "kelaa des sraghna", 32.058, -7.408],
    ["وادي زم", "oued zem", 32.863, -6.573], ["بنسليمان", "benslimane ben slimane", 33.619, -7.121], ["اليوسفية", "youssoufia", 32.246, -8.529],
    ["إفران", "ifrane افران", 33.523, -5.111], ["أزرو", "azrou ازرو", 33.434, -5.221], ["صفرو", "sefrou", 33.831, -4.835],
    ["ميدلت", "midelt", 32.685, -4.745], ["خنيفرة", "khenifra", 32.939, -5.668], ["زاكورة", "zagora", 30.332, -5.838],
    ["الصخيرات", "skhirat", 33.853, -7.031], ["بوزنيقة", "bouznika", 33.789, -7.160], ["الحاجب", "el hajeb", 33.686, -5.371],
    ["تيفلت", "tiflet", 33.894, -6.306], ["سيدي بنور", "sidi bennour", 32.651, -8.426], ["الدروة", "deroua", 33.374, -7.537]
  ];
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[éè]/g, "e")
      .replace(/[ً-ْـ]/g, "").replace(/\s+/g, " ").trim();
  }
  function findCities(q) {
    var n = norm(q); if (!n) return CITIES.slice(0, 8);
    var starts = [], has = [];
    CITIES.forEach(function (c) {
      var hay = norm(c[0] + " " + c[1]);
      if (norm(c[0]).indexOf(n) === 0 || hay.split(" ").some(function (w) { return w.indexOf(n) === 0; })) starts.push(c);
      else if (hay.indexOf(n) > -1) has.push(c);
    });
    return starts.concat(has).slice(0, 8);
  }
  function exactCity(q) { var n = norm(q); for (var i = 0; i < CITIES.length; i++) if (norm(CITIES[i][0]) === n) return CITIES[i][0]; return null; }
  function nearestCity(lat, lng) {
    var best = null, bd = Infinity;
    CITIES.forEach(function (c) {
      var dLat = (c[2] - lat) * 111, dLng = (c[3] - lng) * 111 * Math.cos(lat * Math.PI / 180);
      var dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < bd) { bd = dist; best = c[0]; }
    });
    return bd <= 25 ? best : null; // only suggest when clearly inside a known city
  }

  function orderText(o) {
    return [
      "🛒 طلب جديد — " + PRODUCT.name,
      "الاسم: " + o.name, "الهاتف: " + o.phone, "المدينة: " + o.city, o.address ? "العنوان: " + o.address : null,
      o.notes ? "ملاحظة: " + o.notes : null,
      "العدد: " + qtyLabel(o.qty) + " (" + (o.qty * 2) + " مجموعات)",
      "الثمن الإجمالي: " + dh(o.total), "التوصيل: مجاني", "الدفع: عند الاستلام"
    ].filter(Boolean).join("\n");
  }
  function waUrl(num, text) { return "https://wa.me/" + String(num).replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }
  function validWa(num) { return /^\d{9,15}$/.test(String(num || "").replace(/\D/g, "")); }
  function isInApp(ua) { return /FBAN|FBAV|FB_IAB|Instagram|TikTok|musical_ly|Bytedance|BytedanceWebview|Snapchat/i.test(ua || ""); }
  function readUtm(search) {
    var out = {}, keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "ttclid"];
    var p = String(search || "").replace(/^\?/, "").split("&");
    p.forEach(function (kv) {
      var i = kv.indexOf("="); if (i < 1) return;
      var k = decodeURIComponent(kv.slice(0, i)), v;
      try { v = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " ")); } catch (e) { return; }
      if (keys.indexOf(k) > -1 && v) out[k] = v.slice(0, 200);
    });
    return out;
  }
  function eventId(prefix) { return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10); }

  /* FAQ assistant: keyword matching over verified facts only */
  var KB = [
    { k: ["كاين", "فالباك", "الباك", "باك", "pack", "محتوى", "فيه", "مجموع"], a: "فالباك كاينين جوج مجموعات كاملة 🎧🎧\nكل مجموعة فيها جوج سماعات وعلبة الشحن ديالها.\nكلشي بـ179 درهم." },
    { k: ["iphone", "ايفون", "ايفن", "ios"], a: "إيه، متوافقة مع iPhone عبر Bluetooth ✅" },
    { k: ["android", "اندرويد", "سامسونغ", "samsung", "شاومي", "xiaomi", "هواوي"], a: "إيه، متوافقة مع Android عبر Bluetooth ✅" },
    { k: ["بطاري", "باتري", "batter", "كتدوم", "تدوم", "ساعات", "شارج", "الشحن"], a: "البطارية كتدوم تقريباً 5–6 ساعات ديال الاستعمال حسب الاستخدام 🔋\nومن بعد كترجعهم للعلبة باش يتشحنو." },
    { k: ["توصيل", "ليفريزون", "livraison", "فابور", "مجاني", "كيوصل", "توصل", "شحال كياخد"], a: "التوصيل مجاني 🚚\nالمدة كيأكدها ليك فريق المتجر ملي يتاصلو بيك." },
    { k: ["نخلص", "خلص", "الدفع", "دفع", "كاش", "cod", "بطاقه", "كارط"], a: "الدفع عند الاستلام 💵\nكتخلّص ملي توصلك الطلبية، ما كتخلّص والو قبل." },
    { k: ["ثمن", "شحال", "بشحال", "الثمن", "prix", "درهم", "سعر"], a: "باك واحد (جوج مجموعات) بـ179 درهم.\nجوج باكات بـ358 درهم، و3 باكات بـ537 درهم.\nوالتوصيل مجاني." },
    { k: ["كميه", "عدد", "جوج باكات", "عائله", "صحاب", "بزاف", "اكثر"], a: "تقدر تختار من باك واحد حتى 3 باكات فالفورمولير.\nكل باك فيه جوج مجموعات، والثمن كيتحسب بوحدو.", act: "order" },
    { k: ["نطلب", "طلب", "كوموند", "commande", "نشري", "شري", "كيفاش"], a: "الطلب ساهل:\n1. عمّر الاسم، الهاتف، المدينة والعنوان\n2. ختار شحال من باك\n3. أكّد الطلب، ومن بعد غادي نتاصلو بيك باش نأكدو", act: "order" },
    { k: ["ميكرو", "مكالم", "نعيط", "نهضر", "تيليفون"], a: "فيها ميكروفون مدمج، كتقدر تجاوب على المكالمات بلا ما تحيد التيليفون من جيبك 📞" },
    { k: ["لمس", "touch", "تاتش", "نتحكم", "تحكم"], a: "فيها تحكم باللمس، كتلمس السماعة باش تتحكم فالاستعمال بطريقة ساهلة 👆" },
    { k: ["بلوتوث", "bluetooth", "نربط", "كتربط", "ربط", "اقتران", "popup", "بوب"], a: "كتربطها بالتيليفون عبر Bluetooth.\nوملي كتربطها، كتبان نافذة الاقتران فالأجهزة المتوافقة 📱" },
    { k: ["ضمان", "ضمانه", "garantie"], a: "ما عنديش معلومة مؤكدة على الضمان 🙏\nسول فريق المتجر ملي يتاصلو بيك باش يأكدو الطلب." },
    { k: ["اصليه", "اصلي", "airpods", "ايربودز", "ايربود", "ابل", "اوريجينال", "original"], a: "هادي سماعات بلا خيط ديال Electro Phone، ماشي سماعات أصلية ديال آبل.\nكتخدم مع iPhone وAndroid عبر Bluetooth." },
    { k: ["الضجيج", "الضوضاء", "anc", "عزل"], a: "ما عندناش معلومة مؤكدة على إلغاء الضجيج، داكشي علاش ما نقدروش نوعدوك بيه 🙏" },
    { k: ["ماء", "الما", "مقاوم", "ضد الما"], a: "ما عندناش معلومة مؤكدة على مقاومة الماء 🙏" },
    { k: ["رجع", "ارجاع", "تبديل", "نبدل", "retour"], a: "شروط الإرجاع والاستبدال كاينين فصفحة السياسات (الرابط لتحت فالصفحة)." },
    { k: ["سلام", "مرحبا", "اهلا", "salam", "slm", "hi"], a: "سلام وعليكم 👋 كيفاش نقدر نعاونك على عرض جوج سماعات؟" },
    { k: ["شكرا", "شكرن", "merci", "يعطيك"], a: "العفو 🧡 إلا بغيتي تطلب، الفورمولير لتحت.", act: "order" }
  ];
  var FALLBACK = { a: "سمح ليا، ما فهمتش مزيان 🙏\nأنا مساعد آلي كنجاوب غير على الأسئلة ديال العرض. جرّب وحدة من هاد الأسئلة لتحت." };
  var SUGGESTIONS = ["شنو كاين فالباك؟", "واش خدامة مع iPhone؟", "واش خدامة مع Android؟", "شحال كتدوم البطارية؟", "واش التوصيل مجاني؟", "كيفاش نطلب؟"];
  function botAnswer(q) {
    var n = norm(q), best = null, score = 0;
    KB.forEach(function (e) {
      var s = 0; e.k.forEach(function (k) { if (n.indexOf(norm(k)) > -1) s += k.length; });
      if (s > score) { score = s; best = e; }
    });
    return best || FALLBACK;
  }

  var api = { total: total, dh: dh, qtyLabel: qtyLabel, normPhone: normPhone, cleanText: cleanText, validName: validName, findCities: findCities, exactCity: exactCity, nearestCity: nearestCity, CITIES: CITIES, orderText: orderText, waUrl: waUrl, validWa: validWa, isInApp: isInApp, readUtm: readUtm, botAnswer: botAnswer, KB: KB, FALLBACK: FALLBACK };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }
  if (typeof document === "undefined") return;

  /* ================= DOM ================= */
  var d = document, $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  d.documentElement.classList.remove("no-js");
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IN_APP = isInApp(root.navigator && navigator.userAgent);
  function store(kind) { try { var s = root[kind]; s.setItem("__t", "1"); s.removeItem("__t"); return s; } catch (e) { return null; } }
  var SS = store("sessionStorage"), LS = store("localStorage");
  function sget(k) { try { return SS ? SS.getItem(k) : null; } catch (e) { return null; } }
  function sset(k, v) { try { if (SS) SS.setItem(k, v); } catch (e) {} }
  function getCookie(n) { var m = d.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; }

  /* --- attribution: keep UTM + click ids for the whole session --- */
  var ATTR = {};
  try { ATTR = JSON.parse(sget("ep_attr") || "{}") || {}; } catch (e) { ATTR = {}; }
  var fresh = readUtm(root.location && location.search);
  if (Object.keys(fresh).length) { ATTR = fresh; ATTR.landing = location.pathname; ATTR.first_seen = new Date().toISOString(); sset("ep_attr", JSON.stringify(ATTR)); }

  /* --- ads tracking: Meta + TikTok, consent-aware, once-only, with event ids for server dedup --- */
  var T = { ready: false, fired: {}, queue: [] };
  function loadPixels() {
    if (T.ready) return; T.ready = true;
    if (/^\d{6,20}$/.test(CONFIG.metaPixelId || "")) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(root,d,'script','https://connect.facebook.net/en_US/fbevents.js');
      root.fbq("init", CONFIG.metaPixelId); root.fbq("track", "PageView");
    }
    if (/^[A-Z0-9]{10,30}$/i.test(CONFIG.tiktokPixelId || "")) {
      !function (w, d, t) {
        w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
        ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
        ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
        ttq.load = function (e, n) { var i = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = i + "?sdkid=" + e + "&lib=" + t; var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a); };
        ttq.load(CONFIG.tiktokPixelId); ttq.page();
      }(root, d, "ttq");
    }
    T.queue.splice(0).forEach(function (a) { send.apply(null, a); });
  }
  var TT_NAME = { ViewContent: "ViewContent", InitiateCheckout: "InitiateCheckout", Lead: "SubmitForm" };
  function send(ev, data, id) {
    if (root.fbq) root.fbq("track", ev, data, { eventID: id });
    if (root.ttq && TT_NAME[ev]) root.ttq.track(TT_NAME[ev], { content_id: PRODUCT.id, content_type: "product", content_name: PRODUCT.name, quantity: data.num_items || 1, value: data.value, currency: data.currency }, { event_id: id });
  }
  function track(ev, data, id) { // fires each event once per page view
    if (T.fired[ev]) return; T.fired[ev] = id || eventId(ev);
    data = data || {}; data.currency = CONFIG.currency || "MAD"; data.content_ids = [PRODUCT.id]; data.content_type = "product";
    if (T.ready) send(ev, data, T.fired[ev]); else T.queue.push([ev, data, T.fired[ev]]);
  }
  root.EP_TRACK = { fired: T.fired }; // read-only view for QA
  function consentFlow() {
    if (!CONFIG.requireConsent) { loadPixels(); return; }
    var c = null; try { c = LS && LS.getItem("ep_consent"); } catch (e) {}
    if (c === "yes") { loadPixels(); return; }
    if (c === "no") return;
    var bar = d.createElement("div"); bar.className = "consent"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", "الموافقة على ملفات التتبع");
    bar.innerHTML = '<p>كنستعملو أدوات ديال الإشهار (Meta وTikTok) باش نقيسو النتائج. واش موافق؟ <a href="policies.html#privacy">سياسة الخصوصية</a></p><div><button type="button" class="btn btn-glow" data-c="yes">موافق</button><button type="button" class="btn btn-glass" data-c="no">لا، شكراً</button></div>';
    bar.addEventListener("click", function (e) {
      var v = e.target.getAttribute && e.target.getAttribute("data-c"); if (!v) return;
      try { LS && LS.setItem("ep_consent", v); } catch (er) {}
      bar.remove(); if (v === "yes") loadPixels();
    });
    d.body.appendChild(bar);
  }
  consentFlow();
  track("ViewContent", { value: PRICE, content_name: PRODUCT.name });

  /* --- scroll reveal --- */
  var hasIO = "IntersectionObserver" in root;
  if (hasIO) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* --- sticky bar, assistant + offer launchers --- */
  var sticky = $("#sticky"), stickyCta = $("a", sticky), fab = $("#fab"), launcher = $("#promo-launch"), hero = $(".hero");
  var st = { heroGone: false, orderSeen: false, modal: false, typing: false, promoSeen: false };
  function updateBars() {
    var show = st.heroGone && !st.orderSeen && !st.modal && !st.typing;
    sticky.classList.toggle("show", show);
    sticky.setAttribute("aria-hidden", show ? "false" : "true");
    stickyCta.tabIndex = show ? 0 : -1;
    var floatOk = st.heroGone && !st.orderSeen && !st.modal && !st.typing; // never over the hero CTAs or the form
    if (fab) fab.classList.toggle("hide", !floatOk);
    if (launcher) launcher.classList.toggle("hide", !(floatOk && st.promoSeen));
  }
  if (hasIO) {
    new IntersectionObserver(function (e) { var x = e[e.length - 1]; st.heroGone = !x.isIntersecting; hero.classList.toggle("off", !x.isIntersecting); updateBars(); }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
    new IntersectionObserver(function (e) { st.orderSeen = e[e.length - 1].isIntersecting; updateBars(); }, { threshold: 0.02 }).observe($("#order"));
  } else { st.heroGone = true; updateBars(); }
  d.addEventListener("focusin", function (e) { if (/INPUT|TEXTAREA/.test(e.target.tagName)) { st.typing = true; updateBars(); } });
  d.addEventListener("focusout", function () { setTimeout(function () { var a = d.activeElement; st.typing = !!(a && /INPUT|TEXTAREA/.test(a.tagName)); updateBars(); }, 50); });
  d.addEventListener("visibilitychange", function () { d.documentElement.classList.toggle("paused", d.hidden); });

  /* --- modal / bottom-sheet manager (one at a time) --- */
  var scrim = $("#scrim"), main = $("#main"), current = null, opener = null, parent = null, scrollY0 = 0;
  var FOCUSABLE = "a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex='-1'])";
  function setInert(on) {
    [main, sticky, fab, launcher].forEach(function (el) { if (!el) return; if (on) { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); } else { el.removeAttribute("inert"); if (el !== sticky) el.removeAttribute("aria-hidden"); } });
    if (!on) updateBars();
  }
  function lockScroll(on) { // position-fixed lock: reliable in iOS and in-app webviews
    var b = d.body;
    if (on) { scrollY0 = root.scrollY || root.pageYOffset || 0; b.style.top = -scrollY0 + "px"; b.classList.add("lock"); }
    else { // restore instantly: a smooth scroll here fights the next scrollIntoView
      var h = d.documentElement, prev = h.style.scrollBehavior; h.style.scrollBehavior = "auto";
      b.classList.remove("lock"); b.style.top = ""; root.scrollTo(0, scrollY0); h.style.scrollBehavior = prev;
    }
  }
  function openSheet(id, from) {
    var el = d.getElementById("sh-" + id); if (!el) return;
    if (current && el.hasAttribute("data-over")) { parent = { el: current, opener: opener }; current.setAttribute("inert", ""); }
    else if (current) closeSheet(true, true);
    opener = from || d.activeElement; current = el;
    el.hidden = false; scrim.hidden = false;
    if (!d.body.classList.contains("lock")) lockScroll(true);
    st.modal = true; setInert(true); updateBars();
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("on"); scrim.classList.add("on"); }); });
    var f = $(".x", el) || $(FOCUSABLE, el); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
    el.dispatchEvent(new CustomEvent("sheet:open"));
  }
  function closeSheet(instant, keepLock) {
    if (!current) return;
    var el = current, back = parent, focusTo = opener; current = null; parent = null;
    el.classList.remove("on"); el.style.removeProperty("--drag");
    if (back) { current = back.el; opener = back.opener; current.removeAttribute("inert"); } // return to the sheet underneath
    else scrim.classList.remove("on");
    var done = function () { if (current !== el) el.hidden = true; if (!current) scrim.hidden = true; };
    if (instant || reduce) done(); else setTimeout(done, 320);
    if (!back && !keepLock) { lockScroll(false); st.modal = false; setInert(false); }
    if (focusTo && focusTo.focus && !instant && d.contains(focusTo)) focusTo.focus({ preventScroll: true });
    el.dispatchEvent(new CustomEvent("sheet:close"));
  }
  scrim.addEventListener("click", function () { closeSheet(); });
  d.addEventListener("keydown", function (e) {
    if (!current) return;
    if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
    if (e.key === "Tab") {
      var f = $$(FOCUSABLE, current).filter(function (x) { return x.offsetParent !== null || x === d.activeElement; }); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { closeSheet(); }); });
  $$(".sheet .grab").forEach(function (g) {
    var sheet = g.closest(".sheet"), y0 = null, dy = 0;
    g.addEventListener("pointerdown", function (e) { y0 = e.clientY; dy = 0; sheet.classList.add("dragging"); g.setPointerCapture(e.pointerId); });
    g.addEventListener("pointermove", function (e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.setProperty("--drag", dy + "px"); });
    function end() { if (y0 === null) return; y0 = null; sheet.classList.remove("dragging"); if (dy > 110) closeSheet(); else sheet.style.removeProperty("--drag"); }
    g.addEventListener("pointerup", end); g.addEventListener("pointercancel", end);
  });

  function goOrder(e) { // every "order" button opens the order form popup
    if (e) e.preventDefault();
    openSheet("order", e && e.currentTarget);
  }
  $$('[data-goto-order],a[href="#order"]').forEach(function (a) { a.addEventListener("click", goOrder); });
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openSheet(b.getAttribute("data-open"), b); }); });

  /* --- cinematic offer popup: auto once per session, then a launcher --- */
  var promo = $("#sh-promo");
  if (promo) {
    var markSeen = function () { st.promoSeen = true; sset("ep_promo", "1"); updateBars(); };
    if (sget("ep_promo")) st.promoSeen = true;
    promo.addEventListener("sheet:close", markSeen);
    $("#promo-cta").addEventListener("click", function (e) { e.preventDefault(); setQty(1); markSeen(); goOrder(); });
    $("#promo-more").addEventListener("click", function () { markSeen(); closeSheet(true); setTimeout(function () { openSheet("offer", launcher); }, 30); });
    if (launcher) launcher.addEventListener("click", function () { openSheet("promo", launcher); });
    if (CONFIG.autoOffer !== false && !st.promoSeen) {
      setTimeout(function () {
        // only if the visitor is not already busy: no other popup, not typing, not at the form
        if (!current && !st.typing && !st.orderSeen && !sget("ep_promo")) openSheet("promo");
      }, 1500);
    }
    updateBars();
  }

  /* --- feature details --- */
  var FEATURES = [
    { t: "اتصال Bluetooth", img: "features", p: "كتربط السماعات بالتيليفون عبر Bluetooth بلا خيوط. ساهلة فالاستعمال اليومي مع الأجهزة المتوافقة." },
    { t: "ميكروفون مدمج", img: "call", p: "فيها ميكروفون مدمج كيخليك تجاوب على المكالمات وتهضر بلا ما تحيد التيليفون من جيبك." },
    { t: "التحكم باللمس", img: "detail", p: "كتلمس السماعة باش تتحكم فالاستعمال بطريقة ساهلة وسريعة." },
    { t: "نافذة الاقتران", img: "compat", p: "ملي كتربط السماعات، كتبان نافذة منبثقة فالأجهزة المتوافقة باش تعرف بلي تربطو." },
    { t: "Android و iPhone", img: "compat", p: "متوافقة مع أجهزة Android و iPhone عبر Bluetooth." },
    { t: "علبة الشحن", img: "battery", p: "كل مجموعة عندها علبة ديالها لحفظ وشحن السماعات. البطارية كتدوم تقريباً 5–6 ساعات ديال الاستعمال حسب الاستخدام." }
  ];
  var fT = $("#sh-feature-t"), fI = $("#sh-feature-img"), fP = $("#sh-feature-p");
  $$("[data-feature]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = FEATURES[+b.getAttribute("data-feature")];
      fT.textContent = f.t; fP.textContent = f.p; fI.src = "images/" + f.img + ".webp"; fI.alt = f.t;
      openSheet("feature", b);
    });
  });

  /* --- gallery: swipe (scroll-snap), dots, double-tap zoom --- */
  var GALLERY = [
    ["rest", "جوج علب ديال السماعات مفتوحين"], ["pack-info", "شنو كاين فالباك"], ["pack", "جوج مجموعات كاملة"],
    ["features", "كلشي اللي محتاج"], ["compat", "كتخدم مع Android و iPhone"], ["call", "جاوب على المكالمات"],
    ["tram", "فالطرامواي"], ["cafe", "فالخدمة"], ["detail", "تفاصيل السماعة والعلبة"],
    ["battery", "5–6 ساعات ديال الاستعمال"], ["gift", "وحدة ليك ووحدة لعزيز عليك"], ["hero", "جوج سماعات بثمن وحدة"], ["story", "عرض باك 2"]
  ];
  var gTrack = $("#g-track"), dots = $("#g-dots"), built = false, gIdx = 0;
  function buildGallery() {
    if (built) return; built = true;
    GALLERY.forEach(function (g, i) {
      var s = d.createElement("div"); s.className = "g-slide"; s.setAttribute("role", "group"); s.setAttribute("aria-label", "صورة " + (i + 1) + " من " + GALLERY.length);
      var im = d.createElement("img"); im.src = "images/" + g[0] + ".webp"; im.alt = g[1]; im.loading = "lazy"; im.decoding = "async";
      var last = 0;
      function zoom(e) { var r = im.getBoundingClientRect(); im.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%"; im.classList.toggle("z"); }
      im.addEventListener("dblclick", zoom);
      im.addEventListener("pointerup", function (e) { if (e.pointerType !== "touch") return; var t = Date.now(); if (t - last < 300) { zoom(e); last = 0; } else last = t; });
      s.appendChild(im); gTrack.appendChild(s); dots.appendChild(d.createElement("i"));
    });
    var tick = null;
    gTrack.addEventListener("scroll", function () {
      clearTimeout(tick); tick = setTimeout(function () {
        var i = Math.round(gTrack.scrollLeft / gTrack.clientWidth);
        if (i !== gIdx) $$(".g-slide img.z", gTrack).forEach(function (z) { z.classList.remove("z"); });
        setDot(i);
      }, 60);
    }, { passive: true });
  }
  function setDot(i) { gIdx = i; $$("i", dots).forEach(function (x, k) { x.classList.toggle("on", k === i); }); }
  function openGallery(key, from) {
    buildGallery();
    var i = 0; GALLERY.forEach(function (g, k) { if (g[0] === key) i = k; });
    openSheet("gallery", from);
    requestAnimationFrame(function () { gTrack.scrollLeft = i * gTrack.clientWidth; setDot(i); });
  }
  $$("[data-gallery]").forEach(function (b) { b.addEventListener("click", function () { openGallery(b.getAttribute("data-gallery"), b); }); });
  d.addEventListener("keydown", function (e) {
    if (!current || current.id !== "sh-gallery") return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { var n = Math.min(GALLERY.length - 1, Math.max(0, gIdx + (e.key === "ArrowRight" ? 1 : -1))); gTrack.scrollTo({ left: n * gTrack.clientWidth, behavior: reduce ? "auto" : "smooth" }); }
  });

  /* ================= order form ================= */
  var form = $("#form"), submitBtn = $("#submit"), formErr = $("#form-err"), done = $("#done");
  var cityIn = $("#f-city"), cityList = $("#city-list"), locBtn = $("#loc-btn"), locMsg = $("#loc-msg");
  var startedAt = Date.now(), busy = false, completed = false;
  var MSG = {
    name: "يُرجى إدخال اسمك الكامل (3 أحرف على الأقل).",
    phone: "يُرجى إدخال رقم هاتف مغربي صحيح، مثال: 0612345678",
    city: "يُرجى اختيار مدينتك من القائمة.",
    address: "يُرجى إدخال عنوانك بالتفصيل: الحي، الزنقة، رقم المنزل."
  };
  function fieldEl(name) { return $('.fl[data-field="' + name + '"]', form); }
  function check(name, show) {
    var el = form.elements.namedItem(name), v = el.value, ok;
    if (name === "name") ok = validName(v);
    else if (name === "phone") ok = !!normPhone(v);
    else if (name === "city") ok = !!(exactCity(v) || cityCustom === cleanText(v, 60) && cityCustom);
    else if (name === "address") ok = true; // optional
    else ok = true;
    var f = fieldEl(name), wasBad = f.classList.contains("bad");
    f.classList.toggle("valid", ok);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    if (ok) { f.classList.remove("bad"); $(".err", f).textContent = ""; }
    else if (show || wasBad) { f.classList.add("bad"); $(".err", f).textContent = MSG[name]; }
    return ok;
  }
  ["name", "phone", "address"].forEach(function (n) {
    var el = form.elements.namedItem(n);
    el.addEventListener("blur", function () { if (el.value.trim()) check(n, true); });
    el.addEventListener("input", function () { if (fieldEl(n).classList.contains("bad") || fieldEl(n).classList.contains("valid")) check(n, false); });
  });
  form.addEventListener("focusin", function () { track("InitiateCheckout", { value: total(getQty()), num_items: getQty() }); });

  /* city combobox */
  var cityCustom = "", activeIdx = -1, opts = [];
  function renderCities() {
    var q = cityIn.value; opts = findCities(q); activeIdx = -1; cityList.textContent = "";
    opts.forEach(function (c, i) {
      var li = d.createElement("li"); li.id = "city-" + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false");
      var b = d.createElement("span"); b.textContent = c[0]; var s = d.createElement("small"); s.textContent = c[1].split(" ")[0]; s.setAttribute("dir", "ltr");
      li.appendChild(b); li.appendChild(s);
      li.addEventListener("mousedown", function (e) { e.preventDefault(); pickCity(c[0]); });
      cityList.appendChild(li);
    });
    var t = cleanText(q, 60);
    if (t.length >= 2 && !exactCity(t)) {
      var li2 = d.createElement("li"); li2.setAttribute("role", "option"); li2.id = "city-custom"; li2.setAttribute("aria-selected", "false");
      li2.textContent = "مدينتي ماشي فاللائحة: «" + t + "»";
      li2.addEventListener("mousedown", function (e) { e.preventDefault(); cityCustom = t; pickCity(t); });
      cityList.appendChild(li2); opts.push([t, "", 0, 0, true]);
    }
    openList(cityList.children.length > 0);
  }
  function openList(on) { cityList.hidden = !on; cityIn.setAttribute("aria-expanded", on ? "true" : "false"); if (!on) cityIn.removeAttribute("aria-activedescendant"); }
  function pickCity(name) { cityIn.value = name; openList(false); check("city", true); }
  function moveActive(dlt) {
    var items = $$("li", cityList); if (!items.length) return;
    activeIdx = (activeIdx + dlt + items.length) % items.length;
    items.forEach(function (li, i) { li.setAttribute("aria-selected", i === activeIdx ? "true" : "false"); });
    cityIn.setAttribute("aria-activedescendant", items[activeIdx].id); items[activeIdx].scrollIntoView({ block: "nearest" });
  }
  cityIn.addEventListener("focus", renderCities);
  cityIn.addEventListener("input", function () { cityCustom = ""; renderCities(); if (fieldEl("city").classList.contains("bad") || fieldEl("city").classList.contains("valid")) check("city", false); });
  cityIn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (cityList.hidden) renderCities(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Enter" && !cityList.hidden && activeIdx > -1) { e.preventDefault(); var o = opts[activeIdx]; if (o[4]) cityCustom = o[0]; pickCity(o[0]); }
    else if (e.key === "Escape" && !cityList.hidden) { e.stopPropagation(); openList(false); }
  });
  cityIn.addEventListener("blur", function () { setTimeout(function () { openList(false); var ex = exactCity(cityIn.value); if (ex) cityIn.value = ex; if (cityIn.value.trim()) check("city", true); }, 120); });

  /* location: suggestion only, needs explicit permission, never auto-submitted */
  if (locBtn && !("geolocation" in navigator)) locBtn.hidden = true;
  if (locBtn) locBtn.addEventListener("click", function () {
    locMsg.textContent = "كنقلبو على الموقع…";
    navigator.geolocation.getCurrentPosition(function (pos) {
      var c = nearestCity(pos.coords.latitude, pos.coords.longitude);
      locMsg.textContent = "";
      if (!c) { locMsg.textContent = "ما قدرناش نعرفو المدينة بالضبط. ختارها من اللائحة عافاك."; return; }
      locMsg.append("واش انت ف" + c + "؟ ");
      var yes = d.createElement("button"); yes.type = "button"; yes.textContent = "إيه، هادي هي";
      yes.addEventListener("click", function () { pickCity(c); locMsg.textContent = ""; });
      locMsg.appendChild(yes);
    }, function () {
      locMsg.textContent = "ما تعطاش الإذن للموقع. ختار المدينة من اللائحة عافاك.";
    }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
  });

  /* quantity cards + summary */
  function getQty() { var r = $('input[name="qty"]:checked'); return r ? +r.value : 1; }
  function setQty(q) { var r = $('input[name="qty"][value="' + q + '"]'); if (r) { r.checked = true; refresh(); } }
  var shownTotal = PRICE;
  function tween(el, from, to) {
    if (reduce || from === to) { el.textContent = to; return; }
    var t0 = null; function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 350); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function refresh() {
    var q = getQty(), t = total(q);
    $$(".qc").forEach(function (l) { l.classList.toggle("sel", $("input", l).checked); });
    $("#s-qty").textContent = qtyLabel(q) + " (" + q * 2 + " مجموعات)";
    var ql = $("#qp-label"); if (ql) { ql.textContent = qtyLabel(q); $("#qp-sub").textContent = q * 2 + " مجموعات كاملة"; $("#qp-price").textContent = t; }
    var sub = $("#s-sub"); if (sub) tween(sub, shownTotal, t);
    tween($("#s-tot"), shownTotal, t); shownTotal = t;
  }
  $$('input[name="qty"]').forEach(function (r) { r.addEventListener("change", refresh); });
  refresh();

  /* submit */
  function setBusy(on) {
    busy = on; submitBtn.classList.toggle("loading", on);
    submitBtn.setAttribute("aria-disabled", on ? "true" : "false");
    $(".s-txt", submitBtn).textContent = on ? "جارٍ تسجيل طلبك…" : "أكّد طلبك دابا";
  }
  function showErr(msg) { formErr.textContent = msg; formErr.hidden = !msg; if (msg) formErr.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }
  function readOrder() {
    var el = form.elements; // form.name is the form's own attribute, so read via elements
    var ok = ["name", "phone", "city"].map(function (n) { return check(n, true); });
    if (ok.indexOf(false) > -1) {
      var firstBad = $(".fl.bad", form);
      $$(".fl.bad", form).forEach(function (f) { f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); });
      firstBad.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      setTimeout(function () { var i = $("input,textarea", firstBad); if (i) i.focus({ preventScroll: true }); }, reduce ? 0 : 350);
      return null;
    }
    var q = getQty();
    return {
      name: cleanText(el.namedItem("name").value, 80), phone: normPhone(el.namedItem("phone").value),
      city: exactCity(el.namedItem("city").value) || cleanText(el.namedItem("city").value, 60),
      address: cleanText(el.namedItem("address").value, 250), notes: el.namedItem("notes") ? cleanText(el.namedItem("notes").value, 200) : "",
      qty: q, total: total(q)
    };
  }
  function payload(o, evId) {
    return {
      customer: { name: o.name, phone: o.phone, city: o.city, address: o.address, notes: o.notes },
      product: { id: PRODUCT.id, name: PRODUCT.name, quantity: o.qty, unit_price: PRICE, subtotal: o.total, delivery_fee: 0, total: o.total, currency: CONFIG.currency || "MAD" },
      attribution: ATTR, event_id: evId, page_url: location.href.split("#")[0], created_at: new Date().toISOString(),
      fbp: getCookie("_fbp"), fbc: getCookie("_fbc") || (ATTR.fbclid ? "fb.1." + Date.now() + "." + ATTR.fbclid : ""), ttp: getCookie("_ttp"),
      hp: form.elements.namedItem("website").value, elapsed_ms: Date.now() - startedAt
    };
  }
  function fillSum(o, ref) {
    var box = $("#done-sum"); box.textContent = "";
    var rows = [];
    if (ref) rows.push(["رقم الطلب", ref]); // only when the backend returned one
    rows.push(["المنتج", PRODUCT.name], ["الكمية", qtyLabel(o.qty) + " (" + o.qty * 2 + " مجموعات)"], ["مدينة التوصيل", o.city], ["التوصيل", "مجاني"], ["طريقة الدفع", "الدفع عند الاستلام"], ["المبلغ المستحق عند الاستلام", dh(o.total)]);
    rows.forEach(function (r, i, a) {
      var row = d.createElement("div"), k = d.createElement("dt"), v = d.createElement("dd");
      k.textContent = r[0]; v.textContent = r[1]; if (i === a.length - 1) row.className = "tot";
      if (r[0] === "رقم الطلب") v.setAttribute("dir", "ltr");
      row.appendChild(k); row.appendChild(v); box.appendChild(row);
    });
  }
  var STAGES = ["confirm", "prepare", "ship", "deliver"];
  // A stage is "done" only when the backend explicitly says so; the first unconfirmed one is "next".
  function renderJourney(stages) {
    stages = stages && typeof stages === "object" ? stages : {};
    var nextSet = false;
    STAGES.forEach(function (k) {
      var li = $('#journey li[data-stage="' + k + '"]'), state = $(".j-state", li), isDone = stages[k] === true;
      li.className = isDone ? "is-done" : (!nextSet ? "is-next" : "is-wait");
      if (!isDone && !nextSet) nextSet = true;
      state.textContent = isDone ? "تمّت" : li.className === "is-next" ? "الخطوة القادمة" : "في الانتظار";
    });
  }
  function showDone(kind, o, ref, waLink, stages) {
    done.className = "done" + (kind === "ok" ? "" : " " + kind);
    var t = $("#done-t"), sub = $("#ty-sub"), p = $("#done-p"), wa = $("#done-wa");
    $("#ty-status").hidden = kind !== "ok"; $("#ty-journey-wrap").hidden = kind !== "ok";
    if (kind === "ok") {
      t.textContent = "شكراً لاختيارك لنا!"; sub.textContent = "طلبك أصبح بين أيدينا";
      p.textContent = "نقدّر ثقتك بنا، ونسعد بأن تكون من عملائنا. سنحرص على متابعة طلبك خطوة بخطوة حتى يصلك إلى باب منزلك.";
      renderJourney(stages);
    } else { // WhatsApp hand-off: nothing is registered until the customer presses Send
      t.textContent = "خطوة أخيرة لإتمام طلبك"; sub.textContent = "طلبك لم يُسجَّل بعد";
      p.textContent = "فتحنا لك واتساب وفيه تفاصيل طلبك جاهزة. اضغط «إرسال» ليصلنا طلبك، وسيتواصل معك فريقنا لتأكيده.";
    }
    fillSum(o, ref);
    wa.hidden = !waLink; if (waLink) wa.href = waLink;
    form.hidden = true; done.hidden = false;
    done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); done.focus({ preventScroll: true });
  }
  $("#done-home").addEventListener("click", function (e) { e.preventDefault(); closeSheet(); root.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy || completed) return;
    showErr("");
    var o = readOrder(); if (!o) return;
    if (form.elements.namedItem("website").value) return; // bot

    if (CONFIG.orderEndpoint) {
      var evId = eventId("lead");
      setBusy(true);
      var ctl = root.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
      fetch(CONFIG.orderEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(o, evId)), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          clearTimeout(to);
          if (res.ok && res.j && res.j.ok === true) {
            completed = true; setBusy(false);
            var ref = typeof res.j.ref === "string" ? res.j.ref.slice(0, 40) : "";
            var serverTotal = typeof res.j.total === "number" ? res.j.total : o.total;
            o.total = serverTotal;
            track("Lead", { value: serverTotal, num_items: o.qty }, evId); // Purchase/CompletePayment are NOT sent here: COD is unpaid until delivery
            showDone("ok", o, ref, null, res.j.stages);
          } else {
            setBusy(false);
            showErr((res.j && res.j.message) || "تعذّر تسجيل طلبك في الوقت الحالي. معلوماتك محفوظة، يُرجى المحاولة مرة أخرى.");
          }
        })
        .catch(function () { clearTimeout(to); setBusy(false); showErr("تعذّر الاتصال بخدمة الطلبات. تأكّد من اتصالك بالإنترنت ثم أعد المحاولة؛ معلوماتك محفوظة."); });
      return;
    }

    if (validWa(CONFIG.whatsapp)) {
      completed = true;
      var url = waUrl(CONFIG.whatsapp, orderText(o));
      // in-app browsers (Facebook/Instagram/TikTok) block new windows: open in place
      if (IN_APP) root.location.href = url; else if (!root.open(url, "_blank", "noopener")) root.location.href = url;
      showDone("warn", o, "", url); // honest: not confirmed until the customer presses Send
      return;
    }

    showErr("نعتذر، خدمة استقبال الطلبات غير متاحة حالياً. يُرجى المحاولة بعد قليل.");
    if (root.console) console.error("No order destination: set CONFIG.orderEndpoint (or CONFIG.whatsapp) in index.html");
  });

  /* --- FAQ assistant --- */
  var msgs = $("#msgs"), sugg = $("#sugg"), askF = $("#ask"), askIn = $("#ask-in"), greeted = false, botBusy = false;
  function bubble(text, who, act) {
    var m = d.createElement("div"); m.className = "msg " + who; m.textContent = text;
    if (act === "order") { var b = d.createElement("a"); b.href = "#order"; b.className = "btn btn-glow"; b.textContent = "زيد للطلب"; b.addEventListener("click", goOrder); m.appendChild(b); }
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
  }
  function ask(q) {
    q = String(q || "").trim().slice(0, 200); if (!q || botBusy) return;
    botBusy = true; bubble(q, "me");
    var ty = d.createElement("div"); ty.className = "typing"; ty.setAttribute("aria-label", "كيكتب…"); ty.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(ty); msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function () { ty.remove(); var r = botAnswer(q); bubble(r.a, "bot", r.act); botBusy = false; }, reduce ? 0 : 650);
  }
  if (msgs) SUGGESTIONS.forEach(function (s) { var b = d.createElement("button"); b.type = "button"; b.textContent = s; b.addEventListener("click", function () { ask(s); }); sugg.appendChild(b); });
  if (askF) askF.addEventListener("submit", function (e) { e.preventDefault(); ask(askIn.value); askIn.value = ""; });
  if (msgs) $("#sh-assistant").addEventListener("sheet:open", function () { if (!greeted) { greeted = true; bubble("سلام! 👋 مرحبا بيك، واش بغيتي تعرف أكثر على عرض جوج سماعات؟", "bot"); } });

  root.__ep = { openSheet: openSheet, closeSheet: closeSheet, ask: ask, setQty: setQty, getQty: getQty, attr: function () { return ATTR; } }; // QA hooks
})(typeof window !== "undefined" ? window : this);
