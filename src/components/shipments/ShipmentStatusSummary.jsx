import React from 'react';
import {Icon} from '../ui/Icon';

const descriptions={
 'الكل':'جميع الشحنات المطابقة للبحث والفلاتر الحالية، موزعة حسب حالتها الحالية.',
 'قيد الانتظار':'شحنات جديدة تنتظر بدء التجهيز وإجراءات الشحن.',
 'جاهز للشحن':'شحنات جاهزة لتسليمها إلى شركة الشحن.',
 'قيد التجهيز':'شحنات يجري تجهيز منتجاتها وتغليفها قبل التسليم لشركة الشحن.',
 'تم الشحن':'شحنات تم تسليمها لشركة الشحن وبدأت رحلة التوصيل.',
 'في الطريق':'شحنات يجري نقلها إلى وجهة العميل.',
 'تحت محاولة التسليم':'شحنات خرجت لمحاولة التسليم إلى العميل.',
 'تم التسليم':'شحنات تم تسليمها للعميل بنجاح.',
 'فشل التسليم':'شحنات تعذر تسليمها وتحتاج مراجعة بيانات التوصيل أو إعادة المحاولة.',
 'جاري الإرجاع':'شحنات بدأت رحلة الإرجاع ولم تُسجّل كمرتجع نهائي بعد.',
 'مرتجع':'شحنات سُجّلت كمرتجع نهائي؛ وصولها للمخزن يُتابَع بشكل منفصل.',
 'ملغية':'شحنات تم إلغاؤها ولا تستكمل دورة التوصيل.'
};
/* الشحنات المتأخرة: تجاوزت التوصيل المتوقع ولم تصل لحالة نهائية (تسليم/إلغاء/إرجاع/فشل). */
export const lateExempt=['تم التسليم','ملغية','مرتجع','جاري الإرجاع','فشل التسليم'];
export const isLate=(r,today)=>!!(r.expectedDelivery&&r.expectedDelivery<today&&!lateExempt.includes(r.status));
export const needsActionOf=r=>r.status==='فشل التسليم'||r.changeRequests?.some(c=>c.status==='معلق')||(r.status==='تم الشحن'&&!r.tracking);
export function ShipmentOpsSummary({rows,overdue,needsAction,onToggleOverdue,onToggleNeedsAction}){
 const today=new Date().toISOString().slice(0,10);
 const late=rows.filter(r=>isLate(r,today));
 const action=rows.filter(needsActionOf);
 const delivered=rows.filter(r=>r.status==='تم التسليم').length;
 const returned=rows.filter(r=>r.status==='مرتجع').length;
 const base=delivered+returned;
 const rate=base?(delivered/base*100).toFixed(1)+'%':'—';
 return <section className="sh-ops-cards" aria-label="مؤشرات التشغيل للشحنات">
  <div className="sh-ops-card" role="group" aria-label="نسبة نجاح التسليم">
   <span className="shipment-status-icon shipment-tone-green"><Icon name="circle-check"/></span>
   <div><bdi>{rate}</bdi><h3>نسبة نجاح التسليم</h3><p>تم التسليم <bdi>{delivered}</bdi> من <bdi>{base}</bdi> (تسليم + مرتجع نهائي) داخل الفلاتر الحالية.</p></div>
  </div>
  <button type="button" className="sh-ops-card" aria-pressed={overdue} onClick={onToggleOverdue} title="اضغط لعرض الشحنات المتأخرة فقط">
   <span className="shipment-status-icon shipment-tone-red"><Icon name="clock"/></span>
   <div><bdi>{late.length.toLocaleString('en-US')}</bdi><h3>شحنات متأخرة</h3><p>تجاوزت تاريخ التوصيل المتوقع ولم تُسلَّم بعد — اضغط للتصفية.</p></div>
  </button>
  <button type="button" className="sh-ops-card" aria-pressed={needsAction} onClick={onToggleNeedsAction} title="اضغط لعرض الشحنات التي تحتاج إجراءً فقط">
   <span className="shipment-status-icon shipment-tone-amber"><Icon name="warning"/></span>
   <div><bdi>{action.length.toLocaleString('en-US')}</bdi><h3>تحتاج إجراء</h3><p>فشل تسليم، أو طلب تعديل معلق، أو شحنة مشحونة بدون رقم تتبع — اضغط للتصفية.</p></div>
  </button>
 </section>;
}
export function CarrierComparison({rows,carrier,onChange}){
 const carriers=[...new Set(rows.map(r=>r.carrier).filter(Boolean))];
 if(!carriers.length)return null;
 const data=carriers.map(c=>{const list=rows.filter(r=>r.carrier===c);const delivered=list.filter(r=>r.status==='تم التسليم').length,returned=list.filter(r=>r.status==='مرتجع').length,base=delivered+returned;return {c,count:list.length,delivered,rate:base?(delivered/base*100).toFixed(1)+'%':'—',active:list.filter(r=>!['تم التسليم','مرتجع','ملغية'].includes(r.status)).length}}).sort((a,b)=>b.count-a.count);
 return <section className="sh-carrier-compare" aria-label="مقارنة شركات الشحن">
  <header><h3>مقارنة شركات الشحن</h3><p>ضمن الشحنات المطابقة للفلاتر الحالية · اضغط شركة للتصفية عليها</p></header>
  <div className="sh-carrier-grid">{data.map(d=><button type="button" key={d.c} className={'sh-carrier-card'+(carrier===d.c?' active':'')} aria-pressed={carrier===d.c} onClick={()=>onChange(carrier===d.c?'':d.c)} title={carrier===d.c?'إلغاء تصفية '+d.c:'تصفية شحنات '+d.c}>
   <div className="sh-carrier-head"><span className="shipment-status-icon shipment-tone-blue"><Icon name="truck"/></span><div><h4>{d.c}</h4><bdi>{d.count}</bdi></div></div>
   <dl><div><dt>نسبة التسليم</dt><dd>{d.rate}</dd></div><div><dt>تم التسليم</dt><dd><bdi>{d.delivered}</bdi></dd></div><div><dt>قيد التوصيل</dt><dd><bdi>{d.active}</bdi></dd></div></dl>
  </button>)}</div>
 </section>;
}
export default function ShipmentStatusSummary({stages,rows,value,onChange}){
 const counts=Object.fromEntries(stages.map(([key])=>[key,key==='الكل'?rows.length:rows.filter(r=>r.status===key).length]));
 const percentage=n=>rows.length?(n/rows.length*100).toFixed(1):'0.0';
 const selected=stages.find(s=>s[0]===value)||stages[0];
 return <section className="shipment-status-summary" aria-label="ملخص جميع حالات الشحنات">
 <div className="shipment-status-cards">{stages.map(([key,label,icon,color])=><button type="button" key={key} className={'shipment-status-card '+(value===key?'active':'')} aria-pressed={value===key} aria-label={`عرض ${key} (${counts[key]})`} onClick={()=>onChange(key)} title={descriptions[key]}><span className={'shipment-status-icon shipment-tone-'+color}><Icon name={icon}/></span><span className="shipment-status-number"><bdi>{counts[key].toLocaleString('en-US')}</bdi><small>{key==='الكل'?'الإجمالي':percentage(counts[key])+'%'}</small></span><span className="shipment-status-name">{key==='الكل'?label:key}</span></button>)}</div>
 <div className="shipment-status-explanation" role="status"><span className={'shipment-status-icon shipment-tone-'+selected[3]}><Icon name={selected[2]}/></span><div><h3>{value==='الكل'?'إجمالي الشحنات':value}<bdi>{counts[value]||0}</bdi></h3><p>{descriptions[value]}</p></div><small>النسب من إجمالي {rows.length} شحنة داخل الفلاتر · الحالة الحالية</small></div>
 </section>
}
