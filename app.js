'use strict';
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var DB_NAME='masrofaty',STORE='tx',db=null,txs=[],editId=null;
var fmt=function(n){try{return new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP'}).format(n)}catch(e){return n.toFixed(2)+' EGP'}};
var pad=function(n){return String(n).padStart(2,'0')};
var today=function(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var TL={debit:'Debit',credit:'Credit'};
function showFatal(msg){var f=$('#fatal');if(!f)return;$('#boot').hidden=true;f.hidden=false;f.textContent='تعذر تشغيل التطبيق.\n'+msg+'\nجرّب إعادة تحميل الصفحة. إذا استمرت المشكلة فلا تمسح بيانات المتصفح قبل أخذ نسخة احتياطية.'}
window.addEventListener('error',function(e){if($('#app')&&$('#app').hidden)showFatal(e.message)});
window.addEventListener('unhandledrejection',function(e){toast('حدث خطأ: '+(e.reason&&e.reason.message||e.reason),1)});
var tt;function toast(m,bad){var t=$('#toast');t.textContent=m;t.className=bad?'bad':'';t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},bad?6000:3000)}

function openDB(){return new Promise(function(res,rej){
 if(!window.indexedDB)return rej(new Error('هذا المتصفح لا يدعم IndexedDB.'));
 var r;try{r=indexedDB.open(DB_NAME,1)}catch(e){return rej(e)}
 r.onupgradeneeded=function(){var s=r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});s.createIndex('date','date')};
 r.onsuccess=function(){r.result.onversionchange=function(){r.result.close()};res(r.result)};
 r.onerror=function(){rej(r.error||new Error('فشل فتح قاعدة البيانات'))};
 r.onblocked=function(){rej(new Error('قاعدة البيانات مفتوحة في تبويب آخر. أغلقه وأعد المحاولة.'))};
})}
// resolves only when the transaction has fully committed
function run(mode,fn){return new Promise(function(res,rej){
 var out,t;try{t=db.transaction(STORE,mode)}catch(e){return rej(e)}
 t.oncomplete=function(){res(out&&out.result)};
 t.onerror=function(){rej(t.error||new Error('فشلت العملية'))};
 t.onabort=function(){rej(t.error||new Error('أُلغيت العملية'))};
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
 var b=document.createElement('b');b.textContent=fmt(x.amount);r.append(a,b);
 var m=document.createElement('div');m.className='meta';m.textContent=x.date+' • '+TL[x.type];
 li.append(r,m);
 if(acts){var d=document.createElement('div');d.className='acts';
  var e=document.createElement('button');e.textContent='تعديل';e.onclick=function(){startEdit(x.id)};
  var k=document.createElement('button');k.textContent='حذف';k.className='del';k.onclick=function(){remove(x.id)};
  d.append(e,k);li.append(d)}
 return li}
function empty(ul,t){var li=document.createElement('li');li.className='empty';li.textContent=t;ul.append(li)}
function sortDesc(a){return a.slice().sort(function(p,q){return q.date<p.date?-1:q.date>p.date?1:q.id-p.id})}

function renderDash(){
 var m=$('#dMonth').value,a=txs.filter(function(x){return ym(x.date)===m});
 setMoney($('#dTotal'),sum(a));setMoney($('#dDebit'),sum(a,'debit'));setMoney($('#dCredit'),sum(a,'credit'));
 $('#dCount').textContent=a.length;
 var ul=$('#dList');ul.textContent='';
 if(!a.length)return empty(ul,'لا توجد عمليات في هذا الشهر. أضف أول عملية من تبويب «إضافة».');
 sortDesc(a).slice(0,5).forEach(function(x){ul.append(item(x))})}
function renderHist(){
 var m=$('#hMonth').value,t=$('#hType').value,q=$('#hSearch').value.trim().toLowerCase(),asc=$('#hSort').value==='asc';
 var a=txs.filter(function(x){return(!m||ym(x.date)===m)&&(!t||x.type===t)&&(!q||x.reason.toLowerCase().indexOf(q)>-1)});
 a.sort(function(p,q2){var c=p.date<q2.date?-1:p.date>q2.date?1:p.id-q2.id;return asc?c:-c});
 setMoney($('#hTotal'),sum(a));$('#hCount').textContent=a.length;
 var ul=$('#hList');ul.textContent='';
 if(!a.length)return empty(ul,txs.length?'لا توجد نتائج مطابقة.':'لا توجد عمليات محفوظة بعد.');
 a.forEach(function(x){ul.append(item(x,true))})}
function renderAll(){renderDash();renderHist()}

function view(n){$$('.view').forEach(function(v){v.hidden=v.id!==n});$$('#nav button').forEach(function(b){b.classList.toggle('on',b.dataset.v===n)});window.scrollTo(0,0)}
function resetForm(){editId=null;$('#form').reset();$('#fDate').value=today();$('#fType').value='debit';$('#formTitle').textContent='إضافة عملية';$('#fCancel').hidden=true;['eAmount','eDate','eReason'].forEach(function(i){$('#'+i).textContent=''})}
function startEdit(id){var x=txs.find(function(t){return t.id===id});if(!x)return;resetForm();editId=id;
 $('#fAmount').value=x.amount;$('#fDate').value=x.date;$('#fType').value=x.type;$('#fReason').value=x.reason;
 $('#formTitle').textContent='تعديل العملية';$('#fCancel').hidden=false;view('add')}
function remove(id){
 var x=txs.find(function(t){return t.id===id});if(!x)return;
 if(!confirm('حذف عملية «'+x.reason+'» بقيمة '+fmt(x.amount)+'؟ لا يمكن التراجع.'))return;
 run('readwrite',function(s){return s.delete(id)}).then(reload).then(function(){renderAll();toast('تم الحذف')}).catch(function(e){toast('تعذر الحذف: '+e.message,1)})}

function submit(e){e.preventDefault();
 var amt=parseFloat($('#fAmount').value),date=$('#fDate').value,type=$('#fType').value,reason=$('#fReason').value.trim(),ok=true;
 function er(i,m){$('#'+i).textContent=m;if(m)ok=false}
 er('eAmount',amt>0&&isFinite(amt)?'':'أدخل مبلغًا أكبر من صفر');
 er('eDate',/^\d{4}-\d{2}-\d{2}$/.test(date)?'':'اختر التاريخ');
 er('eReason',reason?'':'اكتب سبب العملية');
 if(!ok)return;
 var rec={amount:Math.round(amt*100)/100,date:date,type:type,reason:reason};
 if(editId!=null)rec.id=editId;
 var btn=$('#fSave'),wasEdit=editId!=null;btn.disabled=true;
 run('readwrite',function(s){return s.put(rec)}).then(reload).then(function(){
  renderAll();resetForm();toast(wasEdit?'تم تحديث العملية':'تم حفظ العملية');
  $('#dMonth').value=ym(date);renderDash();view(wasEdit?'history':'dashboard')
 }).catch(function(er2){toast('لم يتم الحفظ: '+(er2&&er2.message||er2)+'. البيانات في النموذج ما زالت كما هي.',1)}).then(function(){btn.disabled=false})}

function download(name,text,mime){var u=URL.createObjectURL(new Blob([text],{type:mime}));var a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function exportJson(){if(!txs.length)return toast('لا توجد بيانات للتصدير',1);
 download('masrofaty-backup-'+today()+'.json',JSON.stringify({app:'masrofaty',version:1,exportedAt:new Date().toISOString(),currency:'EGP',transactions:txs.map(function(x){return{amount:x.amount,date:x.date,type:x.type,reason:x.reason}})},null,1),'application/json');
 toast('تم تصدير '+txs.length+' عملية')}
function exportCsv(){if(!txs.length)return toast('لا توجد بيانات للتصدير',1);
 var q=function(s){s=String(s);return /^[=+\-@]/.test(s)?"'"+s:s},c=function(s){return '"'+q(s).replace(/"/g,'""')+'"'};
 var rows=['Date,Type,Amount (EGP),Reason'].concat(sortDesc(txs).map(function(x){return[x.date,TL[x.type],x.amount,c(x.reason)].join(',')}));
 download('masrofaty-'+today()+'.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');toast('تم تصدير ملف CSV')}
function validate(data){
 var l=Array.isArray(data)?data:data&&data.transactions;
 if(!Array.isArray(l))throw new Error('الملف ليس نسخة احتياطية من مصروفاتي.');
 return l.map(function(x,i){var n=i+1;
  if(!x||typeof x.amount!=='number'||!(x.amount>0)||!isFinite(x.amount))throw new Error('مبلغ غير صالح في العملية رقم '+n);
  if(typeof x.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||isNaN(Date.parse(x.date)))throw new Error('تاريخ غير صالح في العملية رقم '+n);
  if(x.type!=='debit'&&x.type!=='credit')throw new Error('نوع حساب غير صالح في العملية رقم '+n);
  if(typeof x.reason!=='string'||!x.reason.trim())throw new Error('سبب فارغ في العملية رقم '+n);
  return{amount:x.amount,date:x.date,type:x.type,reason:x.reason.trim().slice(0,120)}})}
function importFile(f){if(!f)return;
 f.text().then(function(t){var l=validate(JSON.parse(t));
  if(!confirm('سيتم حذف '+txs.length+' عملية حالية واستبدالها بـ '+l.length+' عملية من الملف. هل تريد المتابعة؟'))return;
  return run('readwrite',function(s){var r=s.clear();l.forEach(function(x){s.add(x)});return r}).then(reload).then(function(){renderAll();toast('تم استيراد '+l.length+' عملية')})
 }).catch(function(e){toast('فشل الاستيراد: '+(e instanceof SyntaxError?'الملف ليس JSON صالحًا':e.message)+'. لم يتغير شيء.',1)}).then(function(){$('#bFile').value=''})}

function registerSW(){
 if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
 var had=!!navigator.serviceWorker.controller,re=false;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(had&&!re){re=true;location.reload()}});
 navigator.serviceWorker.register('./sw.js').then(function(r){r.update&&r.update()}).catch(function(){})}

function init(){
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
function start(){init().catch(function(e){showFatal(e&&e.message||String(e))})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
