# Electro Phone — Landing Page «باك 2» (موبايل، إعلانات Meta وTikTok)

> الصفحة متوافقة تقنياً مع الإعلانات، ولكن **هادشي ما كيضمنش القبول**: Meta وTikTok كيراجعو كل إعلان حسب السياسات ديالهم الحالية.

---

## 1. شنو خاص يتعمّر قبل الإطلاق (Missing configuration)

### أ) فـ `index.html` → `window.CONFIG` (معلومات عامة فقط)
| الخانة | القيمة | ضروري؟ |
|---|---|---|
| `orderEndpoint` | `"/.netlify/functions/order"` من بعد ما تنشر الـ backend | **إيه** (ولا `whatsapp`) |
| `whatsapp` | رقم البيزنس بلا `+` وبلا `0`، مثال `2126XXXXXXXX` — غير إلا ما كاينش backend | بديل |
| `metaPixelId` | Meta Pixel ID (أرقام) | للإعلانات |
| `tiktokPixelId` | TikTok Pixel ID | للإعلانات |
| `requireConsent` | `true` باش البيكسلات ما يتحملوش حتى يوافق الزائر | حسب القرار القانوني ديالك |
| `autoOffer` | `false` باش توقف الـ popup الأوتوماتيكي | اختياري |

وبدّل `YOUR-DOMAIN` فـ `og:image`.

### ب) متغيرات البيئة فـ Netlify (Site settings → Environment variables) — **أسرار، عمرهم ما يدخلو للـ HTML**
| المتغير | شنو |
|---|---|
| `SHEETS_WEBHOOK_URL` | رابط الـ Web App ديال Google Apps Script (`server/google-apps-script.gs`) — **بلاه الطلبات كترجع خطأ 503** |
| `SHEETS_SECRET` | نفس الكلمة السرية اللي فـ Script properties `SECRET` |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Meta Conversions API (اختياري) |
| `META_TEST_EVENT_CODE` | باش تختبر فـ Events Manager (اختياري) |
| `TIKTOK_PIXEL_ID`, `TIKTOK_ACCESS_TOKEN` | TikTok Events API (اختياري) |
| `ALLOWED_ORIGIN` | الدومين ديالك، مثال `https://electrophone.ma` |

### ج) فـ `policies.html` وقسم «معلومات المتجر» فـ `index.html`
كل خانة بين `[...]` (الاسم القانوني، الهاتف، البريد، العنوان، مدة التوصيل، شروط الإرجاع، الضمان، مدة الاحتفاظ بالمعطيات، CNDP). **ما خترعت حتى معلومة.** المراجعين ديال الإعلانات كيشوفو هاد الصفحات.

---

## 2. النشر الآمن (Netlify)
1. **Google Sheet**: دير شيت جديد → Extensions → Apps Script → لصق `server/google-apps-script.gs` → Script properties: `SECRET` → Deploy as Web app (Execute as: Me، Access: Anyone) → نسخ الرابط.
2. **Netlify**: ارفع الدوسي كامل (Git ولا `netlify deploy`). Netlify Drop ما كيدعمش Functions — استعمل Git ولا CLI.
3. زيد متغيرات البيئة (الجدول ب) ومن بعد **Redeploy**.
4. فـ `index.html` حط `orderEndpoint: "/.netlify/functions/order"` وIDs ديال البيكسلات.
5. **اختبار حقيقي قبل الإعلانات**: دير طلب تجريبي من التيليفون ← تأكد بلي بان فالشيت وبان «الطلب ديالك تسجل بنجاح» مع رقم الطلب. شوف Meta Events Manager → Test events وTikTok Pixel Helper.
6. من بعد مسح السطر التجريبي من الشيت.

> بلا backend: حط غير `whatsapp`. الطلب كيتحل فالواتساب والصفحة كتقول بوضوح «باقي خطوة وحدة» — ما كتقولش «تسجل بنجاح».

---

## 3. هيكلة الفورمولير (Form architecture)
- فورمولير واحد فصفحة وحدة: الاسم ← الهاتف ← المدينة (بحث + اقتراح من الموقع بإذن) ← العنوان ← ملاحظة (اختياري) ← عدد الباكات (1/2/3) ← ملخص حي ← معلومات الدفع ← زر «أكّد الطلب دابا».
- **التحقق فالمتصفح**: رسائل عربية، shake خفيف، علامة ✓ خضراء، الصعود للخانة الأولى الغالطة.
- **التحقق فالسيرفر** (`netlify/functions/order.js`): كيعاود يتحقق من كلشي، **كيعاود يحسب الثمن (179 × العدد)** وما كيتيقش فالثمن اللي جا من المتصفح، كينظف النصوص، honeypot + الوقت الأدنى + حد ديال 5 طلبات/10 دقائق لكل IP.
- **النجاح** كيبان غير إلا رجع السيرفر `{ok:true}`، ورقم الطلب كيبان غير إلا رجعو السيرفر.
- **الفشل**: رسالة صريحة، المعلومات كيبقاو، والزر كيرجع خدام.
- **ما كاينش جوج طلبات**: الزر كيتسد وقت الإرسال ومن بعد النجاح.
- Google Sheets: Lock ضد التداخل، وحماية من formula injection.

## 4. التتبع (Pixels)
| الحدث | Meta | TikTok | إمتى |
|---|---|---|---|
| PageView | ✓ | `ttq.page()` | تحميل الصفحة |
| ViewContent | ✓ | ✓ | تحميل الصفحة |
| InitiateCheckout | ✓ | ✓ | أول تفاعل مع الفورمولير |
| Lead / SubmitForm | ✓ | ✓ | **غير من بعد نجاح السيرفر** + نفس `event_id` فـ CAPI وEvents API (dedup) |
| Purchase / CompletePayment | ✗ | ✗ | **ما كيتصيفطوش**: طلب COD ما تخلّصش. صيفطهم من النظام ديالك ملي يتخلّص الطلب فعلاً |

- كل حدث مرة وحدة فالصفحة. UTM + `fbclid` + `ttclid` كيتحفظو فالـ session وكيمشيو مع الطلب للشيت.
- رقم الهاتف كيتصيفط لـ CAPI/TikTok **مشفّر SHA-256** فقط.

## 5. الـ Popup ديال العرض
- كيبان مرة وحدة فكل session، 1.5 ثانية من بعد التحميل، إلا الزائر ما كيكتبش وما وصلش للفورمولير.
- ✕ ديما باين، Escape، والسكرول كيتقفل وكيرجع لنفس البلاصة.
- «اطلب العرض دابا» كيسد ويختار باك واحد ويطلع للفورمولير — **بلا إرسال أوتوماتيكي**.
- من بعد الإغلاق كيبان زر صغير «🎁 العرض» باش يتعاود يتحل.

---

## 6. تقرير الاختبار (اللي تدار فعلاً)
**أداة**: Google Chrome headless + Playwright، محاكاة موبايل (touch). **ما تختبرش على تيليفون حقيقي.**

- أحجام 320/360/375/390/393/414/430: انظر `QA` فالتقرير ديال المحادثة.
- User-agents ديال Facebook، Instagram، TikTok، Android Chrome، iPhone Safari: **محاكاة UA فقط** فوق Chrome — ماشي التطبيقات الحقيقية.
- Backend: تختبر بـ fetch مزيّف (unit tests): الثمن كيتعاود يتحسب، 503 بلا إعداد، 422 للخانات، 400 للسبام، 502 إلا فشل الشيت، 429، CAPI/TikTok بنفس event_id وبلا Purchase.
- **ما تختبرش**: إرسال حقيقي للشيت، CAPI/TikTok حقيقي، فونت Noto Kufi (الأنترنيت كان مقطوع)، الكلافيي الحقيقي ديال iOS/Android.

## 7. حدود ومخاطر معروفة
- **الشكل ديال السماعة** فالصور قريب بزاف من منتج معروف. Meta وTikTok يقدرو يرفضو الإعلان كـ«منتج مقلد» حتى بلا لوغو. استعمل تصاور حقيقيين للمنتج ديالك.
- **«جوج سماعات بثمن وحدة»**: صحيح غير إلا كنتي كتبيع مجموعة وحدة عادةً بـ179 درهم. إلا لا، بدّل الجملة فالتصاور.
- المساعد **ماشي ذكاء اصطناعي** (مكتوب فالواجهة).
- الحد ديال الطلبات فالسيرفر «best-effort» (كيتعاود ملي يبرد الـ function). إلا جاك سبام بزاف، زيد Cloudflare Turnstile.
- الـ popup الأوتوماتيكي يقدر ينقص التقييم ديال تجربة الصفحة عند بعض المنصات — `autoOffer: false` إلا لاحظتي مشكل.

## 8. الملفات
```
index.html                      الصفحة
policies.html                   التواصل، التوصيل، الإرجاع، الخصوصية، الشروط (فيها خانات خاصها تتعمّر)
assets/app.css · assets/app.js  التصميم والمنطق (بلا مكتبات)
images/*.webp                   الصور (~740KB) + hero.jpg لـ og:image
netlify/functions/order.js      الـ backend ديال الطلبات
server/google-apps-script.gs    صندوق الطلبات فـ Google Sheets
netlify.toml                    إعدادات Netlify (functions + cache)
```
