import React,{useState} from 'react';
import {Button,Card} from '@heroui/react';
import {Icon} from '../ui/Icon';
import useAdminStore from '../../data/useAdminStore';
import {updateStore} from '../../data/adminStore';

const categories=['نقل البضاعة من مصر للسعودية','توريد بضاعة من الصين','إعلانات تيك توك','إعلانات منصات أخرى','شحن دولي','جمارك وتخليص','شحن محلي ومرتجعات','تخزين','تغليف وتجهيز','عينات وفحص جودة','إنتاج محتوى وتصوير','عمولات ورسوم خدمات'];
const payoutCategories=['دفعة للبائع','تعويض للبائع','رد مصروف للبائع'];
const currencies=['SAR','EGP','USD','CNY','AED'];
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Cairo'}).format(new Date());
const toMinor=value=>/^\d{1,10}(?:\.\d{1,2})?$/.test(value)?Math.round(Number(value)*100):NaN;
const money=(amount,currency)=> <bdi dir="ltr">{(amount/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} {currency}</bdi>;
const paid=r=>r.payments.reduce((sum,p)=>sum+p.amount,0);
const balance=r=>r.total-paid(r);
const fresh=()=>({sellerId:'',category:'',custom:'',title:'',date:today(),currency:'SAR',total:'',initial:'',reference:'',notes:''});

export default function SellerExpenses({notify}){
 const {sellers,sellerExpenses=[]}=useAdminStore();
 const [kind,setKind]=useState('expense'),[form,setForm]=useState(null),[filter,setFilter]=useState(''),[state,setState]=useState(''),[selected,setSelected]=useState(null),[payment,setPayment]=useState(null),[error,setError]=useState('');
 const outgoing=kind==='payout', settledLabel=outgoing?'تم صرفه':'تم سداده';
 const rows=sellerExpenses.filter(r=>r.kind===kind&&(!filter||r.sellerId===filter)&&(!state||(state==='open'?balance(r)>0:balance(r)===0)));
 const active=rows.find(r=>r.id===selected);
 const patch=(key,value)=>{setForm(f=>({...f,[key]:value}));setError('')};
 const changeKind=value=>{if(kind===value)return;setKind(value);setForm(null);setSelected(null);setPayment(null);setError('')};
 function save(e){
  e.preventDefault();
  const total=toMinor(form.total),initial=form.initial===''?0:toMinor(form.initial);
  if(!Number.isFinite(total)||total<=0||!Number.isFinite(initial)||initial>total){setError('أدخل تكلفة أكبر من صفر، ومبلغًا مسددًا أو مصروفًا لا يتجاوز الإجمالي. استخدم منزلتين عشريتين كحد أقصى.');return}
  const category=(form.category==='other'?form.custom:form.category).trim();
  if(!category||!form.title.trim()){setError('أدخل التصنيف ووصف البند.');return}
  const {sellerId,date,currency,title,reference,notes}=form;
  const record={id:crypto.randomUUID(),kind,sellerId,date,currency,title:title.trim(),reference:reference.trim(),notes:notes.trim(),category,total,payments:initial?[{id:crypto.randomUUID(),amount:initial,date,note:'الدفعة عند التسجيل'}]:[]};
  updateStore(s=>({...s,sellerExpenses:[record,...(s.sellerExpenses||[])]}));
  setFilter('');setState('');setSelected(record.id);setForm(null);setError('');notify('تم تسجيل البند في المعاينة');
 }
 function savePayment(e){
  e.preventDefault();const amount=toMinor(payment.amount);
  if(!active||!Number.isFinite(amount)||amount<=0||amount>balance(active)){setError('أدخل مبلغًا أكبر من صفر ولا يتجاوز المتبقي.');return}
  const entry={id:crypto.randomUUID(),amount,date:payment.date,note:payment.note.trim()};
  updateStore(s=>({...s,sellerExpenses:s.sellerExpenses.map(r=>r.id===active.id?{...r,payments:[...r.payments,entry]}:r)}));
  setPayment(null);setError('');notify(outgoing?'تم تسجيل دفعة الصرف':'تم تسجيل دفعة السداد');
 }
 const total=toMinor(form?.total??''), initial=toMinor(form?.initial||'0');
 return <div className="seller-expenses">
  <header className="expenses-heading"><div><p>سجّل التكاليف على البائع أو الدفعات المستحقة له، وتابع ما تم والمتبقي.</p><small>سجل تجريبي لهذه الجلسة · تسجيل الدفعات لا ينفّذ تحويلًا ماليًا.</small></div><Button size="sm" onPress={()=>{setForm(f=>f?null:fresh());setPayment(null);setError('')}}><Icon name={form?'circle-x':'plus'}/>{form?'إغلاق النموذج':outgoing?'إضافة صرف':'إضافة مصروف'}</Button></header>
  <nav className="expenses-tabs" aria-label="اتجاه المبلغ">{[['expense','مصروفات على البائع'],['payout','صرف للبائع']].map(([key,label])=><button type="button" key={key} aria-pressed={kind===key} onClick={()=>changeKind(key)}>{label}</button>)}</nav>
  {form&&<Card className="expenses-panel expenses-entry"><form onSubmit={save}>
   <h2>{outgoing?'تسجيل مبلغ للصرف للبائع':'تسجيل مصروف على البائع'}</h2>
   <div className="expenses-entry-layout">
    <div className="expenses-entry-main">
     <fieldset><legend>بيانات البند</legend><div className="expenses-fields">
    <label>البائع<select required value={form.sellerId} onChange={e=>patch('sellerId',e.target.value)}><option value="">اختر البائع</option>{sellers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label>نوع البند<select required value={form.category} onChange={e=>patch('category',e.target.value)}><option value="">اختر النوع</option>{(outgoing?payoutCategories:categories).map(c=><option key={c}>{c}</option>)}<option value="other">أخرى — كتابة يدوية</option></select></label>
    <label>تاريخ البند<input required type="date" value={form.date} onChange={e=>patch('date',e.target.value)}/></label>
    {form.category==='other'&&<label className="expenses-wide">نوع البند يدويًا<input required maxLength={80} value={form.custom} onChange={e=>patch('custom',e.target.value)}/></label>}
    <label className="expenses-wide">وصف البند<input required maxLength={120} placeholder={outgoing?'مثال: تعويض عن شحنة تالفة':'مثال: رسوم نقل دفعة أكتوبر'} value={form.title} onChange={e=>patch('title',e.target.value)}/></label>
     </div></fieldset>
     <fieldset><legend>المبالغ</legend><div className="expenses-fields expenses-amounts">
    <label>العملة<select value={form.currency} onChange={e=>patch('currency',e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>{outgoing?'إجمالي الصرف المستحق':'التكلفة الكاملة'}<input required type="number" min="0.01" step="0.01" value={form.total} onChange={e=>patch('total',e.target.value)} dir="ltr"/></label>
    <label>{outgoing?'المبلغ المصروف للبائع':'المبلغ الذي سدّده البائع'}<input type="number" min="0" step="0.01" placeholder="0.00" value={form.initial} onChange={e=>patch('initial',e.target.value)} dir="ltr"/></label>
     </div></fieldset>
     <details className="expenses-extra"><summary>إضافة مرجع أو ملاحظات <small>اختياري</small></summary><div className="expenses-fields">
    <label>رقم فاتورة أو مرجع<input maxLength={100} value={form.reference} onChange={e=>patch('reference',e.target.value)}/></label>
    <label className="expenses-wide">ملاحظات<textarea rows={2} maxLength={500} value={form.notes} onChange={e=>patch('notes',e.target.value)}/></label>
     </div></details>
    </div>
    <aside className="expenses-review" aria-label="ملخص المبالغ">
     <h3>ملخص المبالغ</h3>
     <dl aria-live="polite">
      <div><dt>الإجمالي</dt><dd>{Number.isFinite(total)?money(total,form.currency):'—'}</dd></div>
      <div><dt>{settledLabel}</dt><dd>{Number.isFinite(initial)?money(initial,form.currency):'—'}</dd></div>
      <div className="expenses-remaining"><dt>المتبقي {outgoing?'للصرف':'على البائع'}</dt><dd>{Number.isFinite(total)&&Number.isFinite(initial)&&initial<=total?money(total-initial,form.currency):'—'}</dd></div>
     </dl>
     {error&&<p role="alert" className="orders-error">{error}</p>}
     <Button type="submit" size="sm"><Icon name="circle-check"/>حفظ البند</Button>
    </aside>
   </div>
  </form></Card>}
  <Card className="expenses-panel expenses-list">
   <header className="expenses-list-header"><div><h2>سجل {outgoing?'الصرف للبائعين':'المصروفات'}</h2><p>{rows.length} بند</p></div><div className="expenses-filters"><label>البائع<select value={filter} onChange={e=>{setFilter(e.target.value);setSelected(null);setPayment(null);setError('')}}><option value="">كل البائعين</option>{sellers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>الحالة<select value={state} onChange={e=>{setState(e.target.value);setSelected(null);setPayment(null);setError('')}}><option value="">كل الحالات</option><option value="open">له مبلغ متبقٍ</option><option value="closed">مكتمل</option></select></label></div></header>
   {rows.length?<div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>البند</th><th>البائع</th><th>التاريخ</th><th>الإجمالي</th><th>{settledLabel}</th><th>المتبقي</th><th>الحالة</th><th>التفاصيل</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.title}<small className="analytics-cell-note">{r.category}</small></td><td>{sellers.find(s=>s.id===r.sellerId)?.name||'بائع غير متاح'}</td><td><bdi>{r.date}</bdi></td><td>{money(r.total,r.currency)}</td><td>{money(paid(r),r.currency)}</td><td><strong>{money(balance(r),r.currency)}</strong></td><td><span className={'analytics-status '+(balance(r)?'warning':'success')}>{balance(r)?paid(r)?'جزئي':'مفتوح':'مكتمل'}</span></td><td><button type="button" className="analytics-entity-link" aria-expanded={selected===r.id} onClick={()=>{setSelected(selected===r.id?null:r.id);setPayment(null);setError('')}}>عرض السجل</button></td></tr>)}</tbody></table></div>:<div className="expenses-empty"><Icon name="wallet"/><p>{filter||state?'لا توجد بنود مطابقة للفلاتر.':outgoing?'لا توجد دفعات صرف مسجلة.':'لا توجد مصروفات مسجلة بعد.'}</p></div>}
  </Card>
  {active&&<Card className="expenses-panel"><header className="expenses-list-header"><div><h2>{active.title}</h2><p>سجل الدفعات · المتبقي {money(balance(active),active.currency)}</p></div>{balance(active)>0&&<Button size="sm" variant="secondary" onPress={()=>{setForm(null);setPayment({amount:'',date:today(),note:''});setError('')}}><Icon name="plus"/>{outgoing?'تسجيل دفعة صرف':'تسجيل دفعة سداد'}</Button>}</header>
   {(active.reference||active.notes)&&<p className="expenses-notes">{active.reference&&<>المرجع: <bdi>{active.reference}</bdi> · </>}{active.notes}</p>}
   {payment&&<form onSubmit={savePayment}><div className="expenses-fields"><label>مبلغ الدفعة ({active.currency})<input required type="number" min="0.01" max={balance(active)/100} step="0.01" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/></label><label>تاريخ الدفعة<input required type="date" value={payment.date} onChange={e=>setPayment({...payment,date:e.target.value})}/></label><label>ملاحظة أو مرجع<input maxLength={150} value={payment.note} onChange={e=>setPayment({...payment,note:e.target.value})}/></label></div>{error&&<p role="alert" className="orders-error">{error}</p>}<footer className="expenses-form-footer"><Button size="sm" variant="ghost" onPress={()=>{setPayment(null);setError('')}}>إلغاء</Button><Button size="sm" type="submit">حفظ الدفعة</Button></footer></form>}
   {active.payments.length?<div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>تاريخ الدفعة</th><th>المبلغ</th><th>المرجع أو الملاحظة</th></tr></thead><tbody>{active.payments.map(p=><tr key={p.id}><td><bdi>{p.date}</bdi></td><td>{money(p.amount,active.currency)}</td><td>{p.note||'—'}</td></tr>)}</tbody></table></div>:<p className="expenses-notes">لا توجد دفعات على هذا البند بعد.</p>}
  </Card>}
 </div>
}
