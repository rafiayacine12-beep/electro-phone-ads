// Store assistant widget (no API): floating robot button + chat that answers from the store info
(function () {
  var WA = '0716550591';
  // order matters: specific topics first, price last (because "شحال" also appears in other questions)
  var INTENTS = [
    { k: ['سلام', 'السلام', 'salam', 'slm', 'bonjour', 'bonsoir', 'مرحبا', 'mrhba', 'hello', 'hi'], a: 'وعليكم السلام! مرحبا بيك 😊 سولني على الثمن، التوصيل، الدفع، البطارية ولا كيفاش تطلب.', greet: true },
    { k: ['اصلي', 'اصليه', 'original', 'orginal', 'apple', 'ابل', 'airpods', 'ايربودز', 'copie', 'كوبي'], a: 'هي سماعات بلا خيط (Bluetooth) كيف ما كاينة فالصفحة. للتفاصيل أكثر على المنتوج تاصل بينا فالواتساب ' + WA + '.' },
    { k: ['بطاري', 'باتري', 'شارج', 'شحن', 'كتدوم', 'تدوم', 'batterie', 'battery', 'charge', 'tdoum', 'kat dom', 'katdom'], a: 'البطارية كتدوم تقريباً 5–6 ساعات حسب الاستعمال، وعلبة الشحن كتعاونك تشارجي السماعات.' },
    { k: ['iphone', 'ايفون', 'آيفون', 'android', 'اندرويد', 'أندرويد', 'samsung', 'سامسونغ', 'bluetooth', 'بلوتوث', 'compatible', 'متوافق', 'خدام', 'khdama', 'telephone', 'تيليفوني'], a: 'إيه، متوافقة مع Android و iPhone عبر Bluetooth.' },
    { k: ['توصيل', 'التوصيل', 'ليفريزون', 'توصل', 'كتوصل', 'غتوصل', 'livraison', 'livr', 'tawsil', 'twsil', 'twsl', 'delivery', 'مدينه', 'مدينتي', 'ville', 'فوقاش', 'يوم'], a: 'التوصيل مجاني للمغرب كامل، وكيوصل من 24 حتى 48 ساعة 🚚' },
    { k: ['خلص', 'نخلص', 'الدفع', 'دفع', 'paiement', 'payer', 'paye', 'khles', 'khlas', 'nkhles', 'cash', 'كاش', 'carte', 'كارط'], a: 'الدفع عند الاستلام (كاش) 💵 ما كتخلّص والو قبل. من بعد الطلب كنتاصلو بيك فالتيليفون باش نأكدو المعلومات.' },
    { k: ['رجع', 'ارجاع', 'نرجع', 'استبدال', 'نبدل', 'بدل', 'retour', 'rembours', 'echange', 'خاسر', 'خاسره', 'مخسر', 'panne', 'mkhser'], a: 'الإرجاع مجاني. باش ترجع ولا تبدل: تاصل ولا صيفط واتساب لـ ' + WA + '، ولا إيميل لـ electrophone@support.ma' },
    { k: ['شنو كاين', 'شنو فيه', 'فيه', 'فالباك', 'مجموع', 'contenu', 'contient', 'chno kayn', 'fih'], a: 'كل باك فيه جوج مجموعات كاملة، وكل مجموعة فيها جوج سماعات وعلبة الشحن ديالها.' },
    { k: ['واتساب', 'whatsapp', 'wtsp', 'watsap', 'هاتف', 'تيليفون', 'رقم', 'numero', 'num', 'contact', 'تاصل', 'عنوان', 'adresse', 'فين', 'محل', 'متجر', 'magasin', 'email', 'ايميل'], a: 'Electro Phone — الرباط، وسط المدينة.\nالهاتف / واتساب: ' + WA + '\nالإيميل: electrophone@support.ma\nالخدمة كل يوم.' },
    { k: ['طلب', 'نطلب', 'كوموند', 'كومند', 'commande', 'commander', 'command', 'nchri', 'نشري', 'شري', 'acheter'], a: 'ساهلة! ضغط على "اطلب العرض دابا"، عمّر الاسم، رقم الهاتف والمدينة، وأكّد. غادي نتاصلو بيك باش نأكدو 👍', order: true },
    { k: ['ثمن', 'تمن', 'الثمن', 'بشحال', 'شحال', 'بكام', 'prix', 'taman', 'tamn', 'ch7al', 'bch7al', 'combien', 'درهم', 'dh', 'باك', 'pack', 'promo', 'عرض'], a: 'باك واحد (جوج مجموعات) بـ 179 درهم.\nجوج باكات (4 مجموعات) بـ 358 درهم.\n3 باكات (6 مجموعات) بـ 537 درهم.\nالتوصيل مجاني والدفع عند الاستلام.' }
  ];
  var FALLBACK = 'ما فهمتش مزيان سؤالك 🙏 تقدر تختار سؤال من التحت، ولا تاصل بينا فالواتساب ' + WA + ' وغادي نجاوبوك.';
  var QUICK = [['💰 الثمن', 'شحال الثمن؟'], ['🚚 التوصيل', 'التوصيل؟'], ['💵 الدفع', 'كيفاش نخلص؟'], ['🔋 البطارية', 'شحال كتدوم البطارية؟'], ['🛒 كيفاش نطلب', 'بغيت نطلب']];

  function norm(s) {
    return (' ' + s + ' ').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[؟?!.,،]/g, ' ');
  }
  function answer(q) {
    var t = norm(q);
    for (var i = 0; i < INTENTS.length; i++) {
      var it = INTENTS[i];
      for (var j = 0; j < it.k.length; j++) {
        var w = norm(it.k[j]).trim();
        // short latin words must match whole words ("hi" must not match "chi")
        var hit = /^[a-z]{1,3}$/.test(w) ? t.indexOf(' ' + w + ' ') > -1 : t.indexOf(w) > -1;
        if (hit && !(it.greet && t.trim().split(/\s+/).length > 2)) return it;
      }
    }
    return { a: FALLBACK };
  }
  window.__agentAnswer = function (q) { return answer(q).a; }; // used by tests

  var ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/><path d="M2 13v3M22 13v3"/></svg>';
  var css = '\
#ai-fab{position:fixed;left:14px;bottom:88px;z-index:900;width:54px;height:54px;border-radius:50%;border:0;background:#111;color:#fff;display:grid;place-items:center;box-shadow:0 6px 20px rgba(0,0,0,.3);cursor:pointer}\
#ai-box{position:fixed;left:14px;right:14px;bottom:152px;z-index:900;max-width:380px;height:min(480px,62vh);background:#fff;color:#111;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden;font-size:15px;line-height:1.5;direction:rtl}\
#ai-box[hidden]{display:none}\
#ai-box header{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#111;color:#fff;font-weight:700}\
#ai-box header button{margin-inline-start:auto;background:none;border:0;color:#fff;font-size:18px;cursor:pointer}\
#ai-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}\
#ai-log p{margin:0;padding:8px 12px;border-radius:12px;max-width:85%;white-space:pre-wrap;word-wrap:break-word}\
#ai-log .u{align-self:flex-start;background:#111;color:#fff}\
#ai-log .a{align-self:flex-end;background:#f1f1f1}\
#ai-quick{display:flex;gap:6px;overflow-x:auto;padding:8px 10px 0}\
#ai-quick button{flex:none;padding:6px 10px;border:1px solid #ddd;border-radius:999px;background:#fff;color:#111;font:inherit;font-size:13px;cursor:pointer}\
#ai-form{display:flex;gap:6px;padding:10px}\
#ai-form input{flex:1;min-width:0;padding:10px 12px;border:1px solid #ddd;border-radius:10px;font:inherit;font-size:16px}\
#ai-form button{padding:0 14px;border:0;border-radius:10px;background:#111;color:#fff;font:inherit;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button');
  fab.id = 'ai-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'المساعد'); fab.innerHTML = ICON;
  var box = document.createElement('div');
  box.id = 'ai-box'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'المساعد');
  box.innerHTML = '<header>' + ICON + '<span>مساعد Electro Phone</span><button type="button" aria-label="إغلاق">✕</button></header>' +
    '<div id="ai-log" aria-live="polite"></div><div id="ai-quick"></div>' +
    '<form id="ai-form"><input id="ai-in" maxlength="300" placeholder="كتب سؤالك هنا..." autocomplete="off"><button>صيفط</button></form>';
  document.body.appendChild(fab); document.body.appendChild(box);

  var log = box.querySelector('#ai-log'), input = box.querySelector('#ai-in'), quick = box.querySelector('#ai-quick');
  function add(cls, text) { var p = document.createElement('p'); p.className = cls; p.textContent = text; log.appendChild(p); log.scrollTop = log.scrollHeight; }
  function ask(q) {
    add('u', q);
    var it = answer(q);
    setTimeout(function () {
      add('a', it.a);
      var cta = it.order && document.querySelector('a[href="#order"]');
      if (cta) setTimeout(function () { box.hidden = true; cta.click(); }, 1200); // open the existing order form
    }, 350);
  }
  QUICK.forEach(function (x) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0];
    b.onclick = function () { ask(x[1]); }; quick.appendChild(b);
  });
  add('a', 'السلام! أنا المساعد ديال Electro Phone 🤖 سولني على الثمن، التوصيل، البطارية ولا كيفاش تطلب.');

  fab.onclick = function () { box.hidden = !box.hidden; if (!box.hidden) input.focus(); };
  box.querySelector('header button').onclick = function () { box.hidden = true; };
  box.querySelector('#ai-form').onsubmit = function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    input.value = ''; ask(q);
  };
})();
