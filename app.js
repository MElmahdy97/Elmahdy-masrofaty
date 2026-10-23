'use strict';
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var DB_NAME='masrofaty',STORE='tx',db=null,txs=[],editId=null;
var fmt=function(n,c){c=c||CUR;try{return new Intl.NumberFormat(LANG==='ar'?'ar-EG':'en-US',{style:'currency',currency:c}).format(n)}catch(e){return n.toFixed(2)+' '+c}};
var pad=function(n){return String(n).padStart(2,'0')};
var today=function(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var TL={debit:'Debit',credit:'Credit'};
var D={"ar": {"currency": "العملة", "appName": "مصروفاتي", "month": "الشهر", "monthTotal": "إجمالي الشهر", "txCount": "عدد العمليات:", "latest": "آخر العمليات", "addTx": "إضافة عملية", "editTx": "تعديل العملية", "amount": "المبلغ", "date": "التاريخ", "acctType": "نوع الحساب", "debitOpt": "Debit – بطاقة خصم", "creditOpt": "Credit – بطاقة ائتمان", "reason": "السبب", "reasonPh": "مثال: بقالة", "save": "حفظ العملية", "cancelEdit": "إلغاء التعديل", "history": "السجل", "allTypes": "كل الأنواع", "searchPh": "بحث في السبب", "sortNew": "الأحدث أولاً", "sortOld": "الأقدم أولاً", "allMonths": "كل الشهور", "total": "الإجمالي:", "countLbl": "العدد:", "backup": "النسخ الاحتياطي", "bJson": "تصدير نسخة JSON", "bCsv": "تصدير السجل CSV", "bImp": "استيراد نسخة JSON", "bNote": "الاستيراد يستبدل كل العمليات الحالية بعد التأكيد. بياناتك تبقى على هذا الجهاز فقط.", "navHome": "الرئيسية", "navAdd": "إضافة", "navHist": "السجل", "navBackup": "النسخ", "rights": "© 2026 Mohamed Elmahdy — جميع الحقوق محفوظة", "fatal1": "تعذر تشغيل التطبيق.", "fatal2": "جرّب إعادة تحميل الصفحة. إذا استمرت المشكلة فلا تمسح بيانات المتصفح قبل أخذ نسخة احتياطية.", "err": "حدث خطأ: ", "noidb": "هذا المتصفح لا يدعم IndexedDB.", "dbopen": "فشل فتح قاعدة البيانات", "dbblocked": "قاعدة البيانات مفتوحة في تبويب آخر. أغلقه وأعد المحاولة.", "opfail": "فشلت العملية", "opabort": "أُلغيت العملية", "emptyMonth": "لا توجد عمليات في هذا الشهر. أضف أول عملية من تبويب «إضافة».", "noMatch": "لا توجد نتائج مطابقة.", "noTx": "لا توجد عمليات محفوظة بعد.", "edit": "تعديل", "del_": "حذف", "confDel": "حذف عملية «{0}» بقيمة {1}؟ لا يمكن التراجع.", "deleted": "تم الحذف", "delFail": "تعذر الحذف: ", "vAmount": "أدخل مبلغًا أكبر من صفر", "vDate": "اختر التاريخ", "vReason": "اكتب سبب العملية", "updated": "تم تحديث العملية", "saved": "تم حفظ العملية", "saveFail": "لم يتم الحفظ: ", "saveFail2": ". البيانات في النموذج ما زالت كما هي.", "noExport": "لا توجد بيانات للتصدير", "expN": "تم تصدير {0} عملية", "expCsv": "تم تصدير ملف CSV", "vFile": "الملف ليس نسخة احتياطية من مصروفاتي.", "vAmt": "مبلغ غير صالح في العملية رقم {0}", "vDt": "تاريخ غير صالح في العملية رقم {0}", "vType": "نوع حساب غير صالح في العملية رقم {0}", "vRsn": "سبب فارغ في العملية رقم {0}", "confImp": "سيتم حذف {0} عملية حالية واستبدالها بـ {1} عملية من الملف. هل تريد المتابعة؟", "impN": "تم استيراد {0} عملية", "impFail": "فشل الاستيراد: ", "badJson": "الملف ليس JSON صالحًا", "impFail2": ". لم يتغير شيء."}, "en": {"currency": "Currency", "appName": "Masrofaty", "month": "Month", "monthTotal": "Month total", "txCount": "Transactions:", "latest": "Latest transactions", "addTx": "Add transaction", "editTx": "Edit transaction", "amount": "Amount", "date": "Date", "acctType": "Account type", "debitOpt": "Debit card", "creditOpt": "Credit card", "reason": "Reason", "reasonPh": "e.g. Groceries", "save": "Save transaction", "cancelEdit": "Cancel editing", "history": "History", "allTypes": "All types", "searchPh": "Search reason", "sortNew": "Newest first", "sortOld": "Oldest first", "allMonths": "All months", "total": "Total:", "countLbl": "Count:", "backup": "Backup", "bJson": "Export JSON backup", "bCsv": "Export history as CSV", "bImp": "Import JSON backup", "bNote": "Importing replaces all current transactions after you confirm. Your data stays on this device only.", "navHome": "Home", "navAdd": "Add", "navHist": "History", "navBackup": "Backup", "rights": "© 2026 Mohamed Elmahdy. All rights reserved.", "fatal1": "The app could not start.", "fatal2": "Try reloading the page. If the problem continues, do not clear browser data before taking a backup.", "err": "Error: ", "noidb": "This browser does not support IndexedDB.", "dbopen": "Could not open the database", "dbblocked": "The database is open in another tab. Close it and try again.", "opfail": "Operation failed", "opabort": "Operation was cancelled", "emptyMonth": "No transactions this month. Add your first one from the Add tab.", "noMatch": "No matching transactions.", "noTx": "No transactions saved yet.", "edit": "Edit", "del_": "Delete", "confDel": "Delete \"{0}\" for {1}? This cannot be undone.", "deleted": "Deleted", "delFail": "Could not delete: ", "vAmount": "Enter an amount greater than zero", "vDate": "Choose a date", "vReason": "Enter a reason", "updated": "Transaction updated", "saved": "Transaction saved", "saveFail": "Not saved: ", "saveFail2": ". Your entries are still in the form.", "noExport": "No data to export", "expN": "Exported {0} transactions", "expCsv": "CSV file exported", "vFile": "This file is not a Masrofaty backup.", "vAmt": "Invalid amount in transaction {0}", "vDt": "Invalid date in transaction {0}", "vType": "Invalid account type in transaction {0}", "vRsn": "Empty reason in transaction {0}", "confImp": "This will delete {0} current transactions and replace them with {1} from the file. Continue?", "impN": "Imported {0} transactions", "impFail": "Import failed: ", "badJson": "The file is not valid JSON", "impFail2": ". Nothing was changed."}};
var LANG=(function(){try{var s=localStorage.getItem('mf_lang');if(s==='ar'||s==='en')return s}catch(e){}var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';return /^ar/i.test(l)?'ar':'en'})();
function tr(k){var v=D[LANG][k];for(var i=1;i<arguments.length;i++)v=v.replace('{'+(i-1)+'}',arguments[i]);return v}
var CURS=['EGP','USD','EUR','GBP','SAR','AED','KWD','QAR'];
var CUR=(function(){try{var c=localStorage.getItem('mf_cur');if(c&&/^[A-Z]{3}$/.test(c))return c}catch(e){}return 'EGP'})();
function vis(){return txs.filter(function(x){return(x.cur||'EGP')===CUR})}
function buildCur(){var l=CURS.slice();txs.forEach(function(x){var c=x.cur||'EGP';if(l.indexOf(c)<0)l.push(c)});if(l.indexOf(CUR)<0)l.push(CUR);
 var s=$('#cur');s.textContent='';l.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;s.append(o)});s.value=CUR}
function applyLang(){var h=document.documentElement;h.lang=LANG;h.dir=LANG==='ar'?'rtl':'ltr';
 $$('[data-i18n]').forEach(function(n){n.textContent=tr(n.dataset.i18n)});
 $$('[data-i18n-ph]').forEach(function(n){n.placeholder=tr(n.dataset.i18nPh)});
 $$('[data-i18n-aria]').forEach(function(n){n.setAttribute('aria-label',tr(n.dataset.i18nAria))});
 $('#lang').textContent=LANG==='ar'?'EN':'عربي';buildCur();$('[data-i18n="amount"]').textContent=tr('amount')+' ('+CUR+')';
 $('#formTitle').textContent=tr(editId==null?'addTx':'editTx');
 ['eAmount','eDate','eReason'].forEach(function(i){$('#'+i).textContent=''});
 if(db)renderAll()}

function showFatal(msg){var f=$('#fatal');if(!f)return;$('#boot').hidden=true;f.hidden=false;f.textContent=tr('fatal1')+'\n'+msg+'\n'+tr('fatal2')}
window.addEventListener('error',function(e){if($('#app')&&$('#app').hidden)showFatal(e.message)});
window.addEventListener('unhandledrejection',function(e){if(/ServiceWorker/i.test(String(e.reason&&e.reason.message||e.reason)))return;toast(tr('err')+(e.reason&&e.reason.message||e.reason),1)});
var tt;function toast(m,bad){var t=$('#toast');t.textContent=m;t.className=bad?'bad':'';t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},bad?6000:3000)}

function openDB(){return new Promise(function(res,rej){
 if(!window.indexedDB)return rej(new Error(tr('noidb')));
 var r;try{r=indexedDB.open(DB_NAME,1)}catch(e){return rej(e)}
 r.onupgradeneeded=function(){var s=r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});s.createIndex('date','date')};
 r.onsuccess=function(){r.result.onversionchange=function(){r.result.close()};res(r.result)};
 r.onerror=function(){rej(r.error||new Error(tr('dbopen')))};
 r.onblocked=function(){rej(new Error(tr('dbblocked')))};
})}
// resolves only when the transaction has fully committed
function run(mode,fn){return new Promise(function(res,rej){
 var out,t;try{t=db.transaction(STORE,mode)}catch(e){return rej(e)}
 t.oncomplete=function(){res(out&&out.result)};
 t.onerror=function(){rej(t.error||new Error(tr('opfail')))};
 t.onabort=function(){rej(t.error||new Error(tr('opabort')))};
 try{out=fn(t.objectStore(STORE))}catch(e){try{t.abort()}catch(_){}rej(e)}
})}
function reload(){return run('readonly',function(s){return s.getAll()}).then(function(a){txs=a||[]})}

function ym(d){return d.slice(0,7)}
function sum(a,t){return a.reduce(function(s,x){return s+(t&&x.type!==t?0:x.amount)},0)}
function setMoney(el,v){el.dataset.v=String(Math.round(v*100)/100);el.textContent=fmt(v)}
function item(x,acts){
 var li=document.createElement('li');li.className=x.type;
 var r=document.createElement('div');r.className='row';
 var a=document.createElement('span');a.textContent=x.reason;
 var b=document.createElement('b');b.textContent=fmt(x.amount,x.cur);r.append(a,b);
 var m=document.createElement('div');m.className='meta';m.textContent=x.date+' • '+TL[x.type];
 li.append(r,m);
 if(acts){var d=document.createElement('div');d.className='acts';
  var e=document.createElement('button');e.textContent=tr('edit');e.onclick=function(){startEdit(x.id)};
  var k=document.createElement('button');k.textContent=tr('del_');k.className='del';k.onclick=function(){remove(x.id)};
  d.append(e,k);li.append(d)}
 return li}
function empty(ul,t){var li=document.createElement('li');li.className='empty';li.textContent=t;ul.append(li)}
function sortDesc(a){return a.slice().sort(function(p,q){return q.date<p.date?-1:q.date>p.date?1:q.id-p.id})}

function renderDash(){
 var m=$('#dMonth').value,a=vis().filter(function(x){return ym(x.date)===m});
 setMoney($('#dTotal'),sum(a));setMoney($('#dDebit'),sum(a,'debit'));setMoney($('#dCredit'),sum(a,'credit'));
 $('#dCount').textContent=a.length;
 var ul=$('#dList');ul.textContent='';
 if(!a.length)return empty(ul,tr('emptyMonth'));
 sortDesc(a).slice(0,5).forEach(function(x){ul.append(item(x))})}
function renderHist(){
 var m=$('#hMonth').value,t=$('#hType').value,q=$('#hSearch').value.trim().toLowerCase(),asc=$('#hSort').value==='asc';
 var a=vis().filter(function(x){return(!m||ym(x.date)===m)&&(!t||x.type===t)&&(!q||x.reason.toLowerCase().indexOf(q)>-1)});
 a.sort(function(p,q2){var c=p.date<q2.date?-1:p.date>q2.date?1:p.id-q2.id;return asc?c:-c});
 setMoney($('#hTotal'),sum(a));$('#hCount').textContent=a.length;
 var ul=$('#hList');ul.textContent='';
 if(!a.length)return empty(ul,tr(txs.length?'noMatch':'noTx'));
 a.forEach(function(x){ul.append(item(x,true))})}
function renderAll(){buildCur();renderDash();renderHist()}

function view(n){$$('.view').forEach(function(v){v.hidden=v.id!==n});$$('#nav button').forEach(function(b){b.classList.toggle('on',b.dataset.v===n)});window.scrollTo(0,0)}
function resetForm(){editId=null;$('#form').reset();$('#fDate').value=today();$('#fType').value='debit';$('#formTitle').textContent=tr('addTx');$('#fCancel').hidden=true;['eAmount','eDate','eReason'].forEach(function(i){$('#'+i).textContent=''})}
function startEdit(id){var x=txs.find(function(t){return t.id===id});if(!x)return;resetForm();editId=id;
 $('#fAmount').value=x.amount;$('#fDate').value=x.date;$('#fType').value=x.type;$('#fReason').value=x.reason;
 $('#formTitle').textContent=tr('editTx');$('#fCancel').hidden=false;view('add')}
function remove(id){
 var x=txs.find(function(t){return t.id===id});if(!x)return;
 if(!confirm(tr('confDel',x.reason,fmt(x.amount,x.cur))))return;
 run('readwrite',function(s){return s.delete(id)}).then(reload).then(function(){renderAll();toast(tr('deleted'))}).catch(function(e){toast(tr('delFail')+e.message,1)})}

function submit(e){e.preventDefault();
 var amt=parseFloat($('#fAmount').value),date=$('#fDate').value,type=$('#fType').value,reason=$('#fReason').value.trim(),ok=true;
 function er(i,m){$('#'+i).textContent=m;if(m)ok=false}
 er('eAmount',amt>0&&isFinite(amt)?'':tr('vAmount'));
 er('eDate',/^\d{4}-\d{2}-\d{2}$/.test(date)?'':tr('vDate'));
 er('eReason',reason?'':tr('vReason'));
 if(!ok)return;
 var rec={amount:Math.round(amt*100)/100,date:date,type:type,reason:reason};
 if(editId!=null){rec.id=editId;var o=txs.find(function(x){return x.id===editId});rec.cur=(o&&o.cur)||'EGP'}else rec.cur=CUR;
 var btn=$('#fSave'),wasEdit=editId!=null;btn.disabled=true;
 run('readwrite',function(s){return s.put(rec)}).then(reload).then(function(){
  renderAll();resetForm();toast(tr(wasEdit?'updated':'saved'));
  $('#dMonth').value=ym(date);renderDash();view(wasEdit?'history':'dashboard')
 }).catch(function(er2){toast(tr('saveFail')+(er2&&er2.message||er2)+tr('saveFail2'),1)}).then(function(){btn.disabled=false})}

function download(name,text,mime){var u=URL.createObjectURL(new Blob([text],{type:mime}));var a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function exportJson(){if(!txs.length)return toast(tr('noExport'),1);
 download('masrofaty-backup-'+today()+'.json',JSON.stringify({app:'masrofaty',version:1,exportedAt:new Date().toISOString(),transactions:txs.map(function(x){return{amount:x.amount,cur:x.cur||'EGP',date:x.date,type:x.type,reason:x.reason}})},null,1),'application/json');
 toast(tr('expN',txs.length))}
function exportCsv(){if(!txs.length)return toast(tr('noExport'),1);
 var q=function(s){s=String(s);return /^[=+\-@]/.test(s)?"'"+s:s},c=function(s){return '"'+q(s).replace(/"/g,'""')+'"'};
 var rows=['Date,Type,Amount,Currency,Reason'].concat(sortDesc(txs).map(function(x){return[x.date,TL[x.type],x.amount,x.cur||'EGP',c(x.reason)].join(',')}));
 download('masrofaty-'+today()+'.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');toast(tr('expCsv'))}
function validate(data){
 var l=Array.isArray(data)?data:data&&data.transactions;
 if(!Array.isArray(l))throw new Error(tr('vFile'));
 return l.map(function(x,i){var n=i+1;
  if(!x||typeof x.amount!=='number'||!(x.amount>0)||!isFinite(x.amount))throw new Error(tr('vAmt',n));
  if(typeof x.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||isNaN(Date.parse(x.date)))throw new Error(tr('vDt',n));
  if(x.type!=='debit'&&x.type!=='credit')throw new Error(tr('vType',n));
  if(typeof x.reason!=='string'||!x.reason.trim())throw new Error(tr('vRsn',n));
  return{amount:x.amount,cur:(typeof x.cur==='string'&&/^[A-Z]{3}$/.test(x.cur))?x.cur:'EGP',date:x.date,type:x.type,reason:x.reason.trim().slice(0,120)}})}
function importFile(f){if(!f)return;
 f.text().then(function(t){var l=validate(JSON.parse(t));
  if(!confirm(tr('confImp',txs.length,l.length)))return;
  return run('readwrite',function(s){var r=s.clear();l.forEach(function(x){s.add(x)});return r}).then(reload).then(function(){renderAll();toast(tr('impN',l.length))})
 }).catch(function(e){toast(tr('impFail')+(e instanceof SyntaxError?tr('badJson'):e.message)+tr('impFail2'),1)}).then(function(){$('#bFile').value=''})}

function registerSW(){
 if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
 var had=!!navigator.serviceWorker.controller,re=false;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(had&&!re){re=true;location.reload()}});
 navigator.serviceWorker.register('./sw.js').catch(function(){})}

function init(){
 $('#cur').onchange=function(){CUR=this.value;try{localStorage.setItem('mf_cur',CUR)}catch(e){}resetForm();applyLang()};
 $('#lang').onclick=function(){LANG=LANG==='ar'?'en':'ar';try{localStorage.setItem('mf_lang',LANG)}catch(e){}applyLang()};
 $('#dMonth').value=ym(today());$('#hMonth').value=ym(today());resetForm();
 $('#dMonth').onchange=renderDash;
 ['hMonth','hType','hSort'].forEach(function(i){$('#'+i).onchange=renderHist});
 $('#hSearch').oninput=renderHist;
 $('#hAll').onclick=function(){$('#hMonth').value='';renderHist()};
 $('#form').addEventListener('submit',submit);
 $('#fCancel').onclick=function(){resetForm();view('history')};
 $$('#nav button').forEach(function(b){b.onclick=function(){if(b.dataset.v==='add'&&editId==null)resetForm();view(b.dataset.v)}});
 $('#bJson').onclick=exportJson;$('#bCsv').onclick=exportCsv;$('#bFile').onchange=function(e){importFile(e.target.files[0])};
 return openDB().then(function(d){db=d;return reload()}).then(function(){
  renderAll();$('#boot').hidden=true;$('#app').hidden=false;$('#nav').hidden=false;
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});
  registerSW()})}
function start(){applyLang();init().catch(function(e){showFatal(e&&e.message||String(e))})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
