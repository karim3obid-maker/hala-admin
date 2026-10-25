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
export default function ShipmentStatusSummary({stages,rows,value,onChange}){
 const counts=Object.fromEntries(stages.map(([key])=>[key,key==='الكل'?rows.length:rows.filter(r=>r.status===key).length]));
 const percentage=n=>rows.length?(n/rows.length*100).toFixed(1):'0.0';
 const selected=stages.find(s=>s[0]===value)||stages[0];
 return <section className="shipment-status-summary" aria-label="ملخص جميع حالات الشحنات">
 <div className="shipment-status-cards">{stages.map(([key,label,icon,color])=><button type="button" key={key} className={'shipment-status-card '+(value===key?'active':'')} aria-pressed={value===key} aria-label={`عرض ${key} (${counts[key]})`} onClick={()=>onChange(key)} title={descriptions[key]}><span className={'shipment-status-icon shipment-tone-'+color}><Icon name={icon}/></span><span className="shipment-status-number"><bdi>{counts[key].toLocaleString('en-US')}</bdi><small>{key==='الكل'?'الإجمالي':percentage(counts[key])+'%'}</small></span><span className="shipment-status-name">{key==='الكل'?label:key}</span></button>)}</div>
 <div className="shipment-status-explanation" role="status"><span className={'shipment-status-icon shipment-tone-'+selected[3]}><Icon name={selected[2]}/></span><div><h3>{value==='الكل'?'إجمالي الشحنات':value}<bdi>{counts[value]||0}</bdi></h3><p>{descriptions[value]}</p></div><small>النسب من إجمالي {rows.length} شحنة داخل الفلاتر · الحالة الحالية</small></div>
 </section>
}
