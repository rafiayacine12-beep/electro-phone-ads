/**
 * Electro Phone: boite de commandes dans Google Sheets.
 *
 * Installation (5 minutes):
 *  1. Cree un Google Sheet vide. Extensions -> Apps Script -> efface tout -> colle ce fichier -> Enregistrer.
 *  2. Execute la fonction `setup` une seule fois (bouton Executer) et accepte les autorisations.
 *     Elle cree la feuille "Orders" (en-tetes, statuts, couleurs) et la feuille "Resume" (totaux).
 *  3. Parametres du projet -> Proprietes du script -> ajoute SECRET = un mot de passe long (le meme que SHEETS_SECRET sur Vercel).
 *  4. Deployer -> Nouveau deploiement -> Application Web -> Executer en tant que: Moi, Acces: Tout le monde -> copie l'URL.
 *  5. Sur Vercel: SHEETS_WEBHOOK_URL = cette URL, SHEETS_SECRET = le meme mot de passe. Puis Redeploy.
 */
var COLS = ["ref", "created_at", "status", "name", "phone", "city", "address", "notes", "product", "quantity",
  "unit_price", "subtotal", "delivery_fee", "total", "currency",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "ttclid"];
var HEAD = ["رقم الطلب", "التاريخ", "الحالة", "الاسم", "الهاتف", "المدينة", "العنوان", "ملاحظات", "المنتج", "الكمية",
  "ثمن الوحدة", "المجموع الجزئي", "التوصيل", "المجموع", "العملة",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "ttclid"];
var STATUSES = ["جديد", "إضافة", "مؤكد", "ما جاوبش", "مؤجل", "تم التوصيل", "ملغى", "مرتجع"];
var COLORS = { "جديد": "#FFF3E0", "إضافة": "#E3F2FD", "مؤكد": "#E8F5E9", "ما جاوبش": "#FFF9C4", "مؤجل": "#EDE7F6", "تم التوصيل": "#C8E6C9", "ملغى": "#FFCDD2", "مرتجع": "#F8BBD0" };

/** Run once from the editor. Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Orders") || ss.insertSheet("Orders");
  sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight("bold").setBackground("#DB4F0B").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  sh.setFrozenRows(1); sh.setFrozenColumns(1);
  sh.setRightToLeft(true);
  var n = COLS.indexOf("status") + 1, max = 2000;
  sh.getRange(2, n, max, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(true).build());
  var rules = Object.keys(COLORS).map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="' + s + '"').setBackground(COLORS[s]).setRanges([sh.getRange(2, 1, max, COLS.length)]).build();
  });
  sh.setConditionalFormatRules(rules);
  sh.getRange(2, COLS.indexOf("phone") + 1, max, 1).setNumberFormat("@");
  sh.getRange(2, COLS.indexOf("created_at") + 1, max, 1).setNumberFormat("yyyy-mm-dd hh:mm");
  [1, 2, 3, 4, 5, 6, 7].forEach(function (c, i) { sh.setColumnWidth(c, [140, 130, 100, 150, 120, 110, 260][i]); });
  sh.hideColumns(COLS.indexOf("utm_source") + 1, 7);

  var rs = ss.getSheetByName("Resume") || ss.insertSheet("Resume");
  rs.clear(); rs.setRightToLeft(true);
  var rows = [["المؤشر", "القيمة"],
    ["عدد الطلبات (بدون الإضافات)", '=COUNTIFS(Orders!C2:C,"<>",Orders!C2:C,"<>إضافة")'],
    ["طلبات جديدة", '=COUNTIF(Orders!C2:C,"جديد")'],
    ["مؤكدة", '=COUNTIF(Orders!C2:C,"مؤكد")'],
    ["تم التوصيل", '=COUNTIF(Orders!C2:C,"تم التوصيل")'],
    ["ملغاة", '=COUNTIF(Orders!C2:C,"ملغى")'],
    ["إضافات (upsell)", '=COUNTIF(Orders!C2:C,"إضافة")'],
    ["مبيعات تم توصيلها (DH)", '=SUMIFS(Orders!N2:N,Orders!C2:C,"تم التوصيل")'],
    ["مجموع كل الطلبات (DH)", "=SUM(Orders!N2:N)"]];
  rs.getRange(1, 1, rows.length, 2).setValues(rows);
  rs.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#DB4F0B").setFontColor("#FFFFFF");
  rs.setColumnWidth(1, 260); rs.setColumnWidth(2, 140);
  var s1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("Feuille 1");
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  ss.setActiveSheet(sh);
}

function cell_(k, v) {
  if (v == null) v = "";
  if (k === "created_at" && v) { var t = new Date(v); return isNaN(t.getTime()) ? v : t; }
  if (k === "phone") return String(v); // column is plain text, so the leading 0 is kept
  if (typeof v === "string" && /^[=+\-@]/.test(v)) return "'" + v; // never run user text as a formula
  return v;
}

function doPost(e) {
  var out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
  try {
    var d = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (secret && d.secret !== secret) return out({ ok: false, error: "unauthorized" });
    var lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName("Orders");
      if (!sh) { setup(); sh = ss.getSheetByName("Orders"); }
      if (!d.status) d.status = "جديد";
      sh.appendRow(COLS.map(function (k) { return cell_(k, d[k]); }));
    } finally { lock.releaseLock(); }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

/** Open the URL in a browser to check that the deployment is alive. */
function doGet() { return ContentService.createTextOutput("Electro Phone orders: OK"); }
