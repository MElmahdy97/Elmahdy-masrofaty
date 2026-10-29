'use strict';
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var DB_NAME='masrofaty',STORE='tx',db=null,txs=[],budgets=[],editId=null,bEdit=null;
var fmt=function(n,c){c=c||CUR;try{return new Intl.NumberFormat(LANG==='ar'?'ar-EG':'en-US',{style:'currency',currency:c}).format(n)}catch(e){return n.toFixed(2)+' '+c}};
var pad=function(n){return String(n).padStart(2,'0')};
var today=function(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var TL={debit:'Debit',credit:'Credit'};
var D={"ar": {"currency": "العملة", "appName": "مصروفاتي", "month": "الشهر", "monthTotal": "إجمالي الشهر", "txCount": "عدد العمليات:", "latest": "آخر العمليات", "addTx": "إضافة عملية", "editTx": "تعديل العملية", "amount": "المبلغ", "date": "التاريخ", "acctType": "نوع الحساب", "debitOpt": "Debit – بطاقة خصم", "creditOpt": "Credit – بطاقة ائتمان", "reason": "السبب", "reasonPh": "مثال: بقالة", "save": "حفظ العملية", "cancelEdit": "إلغاء التعديل", "history": "السجل", "allTypes": "كل الأنواع", "searchPh": "بحث في السبب", "sortNew": "الأحدث أولاً", "sortOld": "الأقدم أولاً", "allMonths": "كل الشهور", "total": "الإجمالي:", "countLbl": "العدد:", "backup": "النسخ الاحتياطي", "bJson": "تصدير نسخة JSON", "bCsv": "تصدير السجل CSV", "bImp": "استيراد نسخة JSON", "bNote": "النسخة تشمل العمليات والميزانية. الاستيراد يستبدل البيانات الحالية بعد التأكيد. بياناتك تبقى على هذا الجهاز فقط.", "navHome": "الرئيسية", "navAdd": "إضافة", "navHist": "السجل", "navBackup": "النسخ", "rights": "© 2026 Mohamed Elmahdy — جميع الحقوق محفوظة", "fatal1": "تعذر تشغيل التطبيق.", "fatal2": "جرّب إعادة تحميل الصفحة. إذا استمرت المشكلة فلا تمسح بيانات المتصفح قبل أخذ نسخة احتياطية.", "err": "حدث خطأ: ", "noidb": "هذا المتصفح لا يدعم IndexedDB.", "dbopen": "فشل فتح قاعدة البيانات", "dbblocked": "قاعدة البيانات مفتوحة في تبويب آخر. أغلقه وأعد المحاولة.", "opfail": "فشلت العملية", "opabort": "أُلغيت العملية", "emptyMonth": "لا توجد عمليات في هذا الشهر. أضف أول عملية من تبويب «إضافة».", "noMatch": "لا توجد نتائج مطابقة.", "noTx": "لا توجد عمليات محفوظة بعد.", "edit": "تعديل", "del_": "حذف", "confDel": "حذف عملية «{0}» بقيمة {1}؟ لا يمكن التراجع.", "deleted": "تم الحذف", "delFail": "تعذر الحذف: ", "vAmount": "أدخل مبلغًا أكبر من صفر", "vDate": "اختر التاريخ", "vReason": "اكتب سبب العملية", "updated": "تم تحديث العملية", "saved": "تم حفظ العملية", "saveFail": "لم يتم الحفظ: ", "saveFail2": ". البيانات في النموذج ما زالت كما هي.", "noExport": "لا توجد بيانات للتصدير", "expN": "تم تصدير {0} عملية", "expCsv": "تم تصدير ملف CSV", "vFile": "الملف ليس نسخة احتياطية من مصروفاتي.", "vAmt": "مبلغ غير صالح في العملية رقم {0}", "vDt": "تاريخ غير صالح في العملية رقم {0}", "vType": "نوع حساب غير صالح في العملية رقم {0}", "vRsn": "سبب فارغ في العملية رقم {0}", "confImp": "سيتم حذف {0} عملية حالية واستبدالها بـ {1} عملية من الملف. هل تريد المتابعة؟", "impN": "تم استيراد {0} عملية", "impFail": "فشل الاستيراد: ", "badJson": "الملف ليس JSON صالحًا", "impFail2": ". لم يتغير شيء.", "navBudget": "الميزانية", "budget": "الميزانية", "monthlyBudget": "ميزانية الشهر (EGP)", "saveBudget": "حفظ", "budgetSaved": "تم حفظ الميزانية", "vBTotal": "أدخل ميزانية صحيحة (صفر أو أكثر)", "sBudget": "الميزانية", "sPlanned": "المخطط", "sLeft": "المتبقي للتخطيط", "sPaid": "المدفوع", "sUnpaid": "غير مدفوع", "budgetNote": "الميزانية منفصلة ولا تدخل في إجمالي المصروفات.", "planTitle": "خطة التوزيع", "itemPh": "مثال: إيجار", "itemAmtPh": "المبلغ", "addItem": "إضافة للخطة", "saveItem": "حفظ التعديل", "noItems": "لم تضف بنودًا لهذا الشهر بعد.", "vItemName": "اكتب اسم البند", "paidTxt": "مدفوع", "unpaidTxt": "غير مدفوع", "confDelItem": "حذف البند «{0}»؟", "itemSaved": "تم حفظ البند", "vBud": "بيانات الميزانية غير صالحة (الشهر {0})", "confImpB": "سيتم حذف {0} عملية و{1} شهر ميزانية حاليين واستبدالها بـ {2} عملية و{3} شهر ميزانية من الملف. هل تريد المتابعة؟"}, "en": {"currency": "Currency", "appName": "Masrofaty", "month": "Month", "monthTotal": "Month total", "txCount": "Transactions:", "latest": "Latest transactions", "addTx": "Add transaction", "editTx": "Edit transaction", "amount": "Amount", "date": "Date", "acctType": "Account type", "debitOpt": "Debit card", "creditOpt": "Credit card", "reason": "Reason", "reasonPh": "e.g. Groceries", "save": "Save transaction", "cancelEdit": "Cancel editing", "history": "History", "allTypes": "All types", "searchPh": "Search reason", "sortNew": "Newest first", "sortOld": "Oldest first", "allMonths": "All months", "total": "Total:", "countLbl": "Count:", "backup": "Backup", "bJson": "Export JSON backup", "bCsv": "Export history as CSV", "bImp": "Import JSON backup", "bNote": "Backups include transactions and budgets. Importing replaces current data after you confirm. Your data stays on this device only.", "navHome": "Home", "navAdd": "Add", "navHist": "History", "navBackup": "Backup", "rights": "© 2026 Mohamed Elmahdy. All rights reserved.", "fatal1": "The app could not start.", "fatal2": "Try reloading the page. If the problem continues, do not clear browser data before taking a backup.", "err": "Error: ", "noidb": "This browser does not support IndexedDB.", "dbopen": "Could not open the database", "dbblocked": "The database is open in another tab. Close it and try again.", "opfail": "Operation failed", "opabort": "Operation was cancelled", "emptyMonth": "No transactions this month. Add your first one from the Add tab.", "noMatch": "No matching transactions.", "noTx": "No transactions saved yet.", "edit": "Edit", "del_": "Delete", "confDel": "Delete \"{0}\" for {1}? This cannot be undone.", "deleted": "Deleted", "delFail": "Could not delete: ", "vAmount": "Enter an amount greater than zero", "vDate": "Choose a date", "vReason": "Enter a reason", "updated": "Transaction updated", "saved": "Transaction saved", "saveFail": "Not saved: ", "saveFail2": ". Your entries are still in the form.", "noExport": "No data to export", "expN": "Exported {0} transactions", "expCsv": "CSV file exported", "vFile": "This file is not a Masrofaty backup.", "vAmt": "Invalid amount in transaction {0}", "vDt": "Invalid date in transaction {0}", "vType": "Invalid account type in transaction {0}", "vRsn": "Empty reason in transaction {0}", "confImp": "This will delete {0} current transactions and replace them with {1} from the file. Continue?", "impN": "Imported {0} transactions", "impFail": "Import failed: ", "badJson": "The file is not valid JSON", "impFail2": ". Nothing was changed.", "navBudget": "Budget", "budget": "Budget", "monthlyBudget": "Monthly budget (EGP)", "saveBudget": "Save", "budgetSaved": "Budget saved", "vBTotal": "Enter a valid budget (zero or more)", "sBudget": "Budget", "sPlanned": "Planned", "sLeft": "Left to plan", "sPaid": "Paid", "sUnpaid": "Still to pay", "budgetNote": "The budget is separate and is not included in your expense totals.", "planTitle": "Spending plan", "itemPh": "e.g. Rent", "itemAmtPh": "Amount", "addItem": "Add to plan", "saveItem": "Save changes", "noItems": "No plan items for this month yet.", "vItemName": "Enter an item name", "paidTxt": "Paid", "unpaidTxt": "Not paid", "confDelItem": "Delete plan item \"{0}\"?", "itemSaved": "Item saved", "vBud": "Invalid budget data (month {0})", "confImpB": "This will delete {0} current transactions and {1} budget months and replace them with {2} transactions and {3} budget months from the file. Continue?"}};
var LANG=(function(){try{var s=localStorage.getItem('mf_lang');if(s==='ar'||s==='en')return s}catch(e){}var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';return /^ar/i.test(l)?'ar':'en'})();
function tr(k){var v=D[LANG][k];for(var i=1;i<arguments.length;i++)v=v.replace('{'+(i-1)+'}',arguments[i]);return v}
var CURS=['EGP','USD','EUR','GBP','SAR','AED','KWD','QAR'];
var CUR='EGP';
function vis(){return txs.filter(function(x){return(x.cur||'EGP')===CUR})}
function buildCur(){}
function applyLang(){var h=document.documentElement;h.lang=LANG;h.dir=LANG==='ar'?'rtl':'ltr';
 $$('[data-i18n]').forEach(function(n){n.textContent=tr(n.dataset.i18n)});
 $$('[data-i18n-ph]').forEach(function(n){n.placeholder=tr(n.dataset.i18nPh)});
 $$('[data-i18n-aria]').forEach(function(n){n.setAttribute('aria-label',tr(n.dataset.i18nAria))});
 $('#lang').textContent=LANG==='ar'?'English':'العربية';buildCur();$('[data-i18n="amount"]').textContent=tr('amount')+' ('+CUR+')';
 $('#formTitle').textContent=tr(editId==null?'addTx':'editTx');
 ['eAmount','eDate','eReason','eBTotal','eBItem'].forEach(function(i){$('#'+i).textContent=''});$('#bAdd').textContent=tr(bEdit==null?'addItem':'saveItem');
 if(db)renderAll()}

function showFatal(msg){var f=$('#fatal');if(!f)return;$('#boot').hidden=true;f.hidden=false;f.textContent=tr('fatal1')+'\n'+msg+'\n'+tr('fatal2')}
window.addEventListener('error',function(e){if($('#app')&&$('#app').hidden)showFatal(e.message)});
window.addEventListener('unhandledrejection',function(e){if(/ServiceWorker/i.test(String(e.reason&&e.reason.message||e.reason)))return;toast(tr('err')+(e.reason&&e.reason.message||e.reason),1)});
var tt;function toast(m,bad){var t=$('#toast');t.textContent=m;t.className=bad?'bad':'';t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},bad?6000:3000)}

function openDB(){return new Promise(function(res,rej){
 if(!window.indexedDB)return rej(new Error(tr('noidb')));
 var r;try{r=indexedDB.open(DB_NAME,2)}catch(e){return rej(e)}
 r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains(STORE)){d.createObjectStore(STORE,{keyPath:'id',autoIncrement:true}).createIndex('date','date')}if(!d.objectStoreNames.contains('budget'))d.createObjectStore('budget',{keyPath:'month'})};
 r.onsuccess=function(){r.result.onversionchange=function(){r.result.close()};res(r.result)};
 r.onerror=function(){rej(r.error||new Error(tr('dbopen')))};
 r.onblocked=function(){rej(new Error(tr('dbblocked')))};
})}
// resolves only when the transaction has fully committed
function run(mode,fn){return new Promise(function(res,rej){
 var out,t;try{t=db.transaction([STORE,'budget'],mode)}catch(e){return rej(e)}
 t.oncomplete=function(){res(Array.isArray(out)?out.map(function(r){return r.result}):out&&out.result)};
 t.onerror=function(){rej(t.error||new Error(tr('opfail')))};
 t.onabort=function(){rej(t.error||new Error(tr('opabort')))};
 try{out=fn(t.objectStore(STORE),t.objectStore('budget'))}catch(e){try{t.abort()}catch(_){}rej(e)}
})}
function reload(){return run('readonly',function(s,b){return [s.getAll(),b.getAll()]}).then(function(a){txs=a[0]||[];budgets=a[1]||[]})}

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
function renderAll(){buildCur();renderDash();renderHist();renderBudget()}

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
function exportJson(){if(!txs.length&&!budgets.length)return toast(tr('noExport'),1);
 download('masrofaty-backup-'+today()+'.json',JSON.stringify({app:'masrofaty',version:2,exportedAt:new Date().toISOString(),transactions:txs.map(function(x){return{amount:x.amount,cur:x.cur||'EGP',date:x.date,type:x.type,reason:x.reason}}),budgets:budgets},null,1),'application/json');
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
function validateB(data){
 if(!data||!Array.isArray(data.budgets))return null;var seen={};
 return data.budgets.map(function(x){var m=x&&x.month;
  if(typeof m!=='string'||!/^\d{4}-\d{2}$/.test(m)||seen[m]||typeof x.total!=='number'||!(x.total>=0)||!isFinite(x.total)||!Array.isArray(x.items))throw new Error(tr('vBud',m));
  seen[m]=1;
  return{month:m,total:x.total,items:x.items.map(function(i){
   if(!i||typeof i.name!=='string'||!i.name.trim()||typeof i.amount!=='number'||!(i.amount>0)||!isFinite(i.amount))throw new Error(tr('vBud',m));
   return{id:typeof i.id==='string'&&i.id?i.id:uid(),name:i.name.trim().slice(0,60),amount:i.amount,paid:i.paid===true}})}})}
function importFile(f){if(!f)return;
 f.text().then(function(t){var data=JSON.parse(t),l=validate(data),bl=validateB(data);
  if(!confirm(bl?tr('confImpB',txs.length,budgets.length,l.length,bl.length):tr('confImp',txs.length,l.length)))return;
  return run('readwrite',function(s,b){var r=s.clear();l.forEach(function(x){s.add(x)});if(bl){b.clear();bl.forEach(function(x){b.add(x)})}return r}).then(reload).then(function(){renderAll();toast(tr('impN',l.length))})
 }).catch(function(e){toast(tr('impFail')+(e instanceof SyntaxError?tr('badJson'):e.message)+tr('impFail2'),1)}).then(function(){$('#bFile').value=''})}

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function clone(o){return JSON.parse(JSON.stringify(o))}
function curB(){var m=$('#bMonth').value;return budgets.find(function(x){return x.month===m})||{month:m,total:0,items:[]}}
function saveB(rec){return run('readwrite',function(s,b){return b.put(rec)}).then(reload)}
function bFail(e){toast(tr('saveFail')+(e&&e.message||e),1);renderBudget()}
function renderBudget(){
 var b=curB(),pl=0,pd=0;b.items.forEach(function(i){pl+=i.amount;if(i.paid)pd+=i.amount});
 setMoney($('#bTotal'),b.total);setMoney($('#bPlanned'),pl);setMoney($('#bLeft'),b.total-pl);setMoney($('#bPaid'),pd);setMoney($('#bUnpaid'),pl-pd);
 $('#bLeftBox').classList.toggle('neg',b.total-pl<-0.004);
 if(document.activeElement!==$('#bAmount'))$('#bAmount').value=b.total||'';
 var ul=$('#bList');ul.textContent='';
 if(!b.items.length)return empty(ul,tr('noItems'));
 b.items.forEach(function(it){
  var li=document.createElement('li');if(it.paid)li.className='paid';
  var r=document.createElement('div');r.className='row';
  var lab=document.createElement('label');lab.className='chkl';
  var c=document.createElement('input');c.type='checkbox';c.className='chk';c.checked=it.paid;c.onchange=function(){togglePaid(it.id,c.checked)};
  var nm=document.createElement('span');nm.className='nm';nm.textContent=it.name;lab.append(c,nm);
  var am=document.createElement('b');am.textContent=fmt(it.amount);r.append(lab,am);
  var m=document.createElement('div');m.className='meta';m.textContent=tr(it.paid?'paidTxt':'unpaidTxt');
  var d=document.createElement('div');d.className='acts';
  var e=document.createElement('button');e.textContent=tr('edit');e.onclick=function(){startItem(it.id)};
  var k=document.createElement('button');k.textContent=tr('del_');k.className='del';k.onclick=function(){delItem(it.id)};
  d.append(e,k);li.append(r,m,d);ul.append(li)})}
function togglePaid(id,v){var n=clone(curB());n.items.forEach(function(i){if(i.id===id)i.paid=v});saveB(n).then(renderAll).catch(bFail)}
function saveTotal(){
 var v=parseFloat($('#bAmount').value);
 if(!(v>=0)||!isFinite(v)){$('#eBTotal').textContent=tr('vBTotal');return}
 $('#eBTotal').textContent='';var n=clone(curB());n.total=Math.round(v*100)/100;
 saveB(n).then(function(){renderAll();toast(tr('budgetSaved'))}).catch(bFail)}
function resetItem(){bEdit=null;$('#bName').value='';$('#bItemAmt').value='';$('#bCancel').hidden=true;$('#bAdd').textContent=tr('addItem');$('#eBItem').textContent=''}
function startItem(id){var it=curB().items.find(function(i){return i.id===id});if(!it)return;bEdit=id;$('#bName').value=it.name;$('#bItemAmt').value=it.amount;$('#bCancel').hidden=false;$('#bAdd').textContent=tr('saveItem');$('#bName').focus()}
function delItem(id){var n=clone(curB()),it=n.items.find(function(i){return i.id===id});if(!it||!confirm(tr('confDelItem',it.name)))return;
 n.items=n.items.filter(function(i){return i.id!==id});saveB(n).then(function(){if(bEdit===id)resetItem();renderAll();toast(tr('deleted'))}).catch(bFail)}
function submitItem(e){e.preventDefault();
 var name=$('#bName').value.trim(),amt=parseFloat($('#bItemAmt').value);
 if(!name){$('#eBItem').textContent=tr('vItemName');return}
 if(!(amt>0)||!isFinite(amt)){$('#eBItem').textContent=tr('vAmount');return}
 $('#eBItem').textContent='';amt=Math.round(amt*100)/100;
 var n=clone(curB());
 if(bEdit!=null){n.items.forEach(function(i){if(i.id===bEdit){i.name=name;i.amount=amt}})}else n.items.push({id:uid(),name:name,amount:amt,paid:false});
 saveB(n).then(function(){resetItem();renderAll();toast(tr('itemSaved'))}).catch(bFail)}
function registerSW(){
 if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
 var had=!!navigator.serviceWorker.controller,re=false;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(had&&!re){re=true;location.reload()}});
 navigator.serviceWorker.register('./sw.js').catch(function(){})}

function init(){
 $('#lang').onclick=function(){LANG=LANG==='ar'?'en':'ar';try{localStorage.setItem('mf_lang',LANG)}catch(e){}applyLang()};
 $('#dMonth').value=ym(today());$('#bMonth').value=ym(today());$('#hMonth').value=ym(today());resetForm();
 $('#dMonth').onchange=renderDash;
 ['hMonth','hType','hSort'].forEach(function(i){$('#'+i).onchange=renderHist});
 $('#hSearch').oninput=renderHist;
 $('#hAll').onclick=function(){$('#hMonth').value='';renderHist()};
 $('#form').addEventListener('submit',submit);
 $('#bMonth').onchange=function(){resetItem();renderBudget()};$('#bSaveTotal').onclick=saveTotal;$('#bForm').addEventListener('submit',submitItem);$('#bCancel').onclick=resetItem;
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
