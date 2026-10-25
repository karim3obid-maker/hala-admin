import React from 'react';
import {Card} from '@heroui/react';
import {Icon} from '../ui/Icon';
import {carriers,shippingStatuses,stageBreakdown,summarize,percent} from '../../data/adminAnalytics';

export default function LifecycleAnalysis({rows,onStage}) {
 const ordersAnalysis=stageBreakdown(rows),shipping=stageBreakdown(rows,'shipping');
 const active=ordersAnalysis.stages.filter(x=>!['تم التسليم','مرتجع','ملغي'].includes(x.status)).sort((a,b)=>b.count-a.count)[0];
 const shippingRows=rows.filter(x=>shippingStatuses.includes(x.status));
 return <section className="lifecycle-analysis" aria-labelledby="lifecycle-title">
  <div className="section-heading"><Icon name="chart-bar"/><h2 id="lifecycle-title">تحليل مراحل الطلبات والشحن</h2><span className="analytics-heading-note">اضغط على أي حالة لتصفية اللوحة</span></div>
  <div className="lifecycle-insights">
   <Card><Icon name="clock"/><div><small>أكبر مرحلة مفتوحة حاليًا</small><strong>{active?.count?active.status:'لا توجد مراحل مفتوحة'}</strong><span>{active?.count||0} طلب · حسب العدد داخل الفلاتر</span></div></Card>
   <Card><Icon name="truck"/><div><small>داخل دورة الشحن</small><strong>{shipping.total} شحنة</strong><span>من الجاهز للشحن حتى التسليم أو الإرجاع</span></div></Card>
   <Card><Icon name="circle-x"/><div><small>تحتاج متابعة التوصيل</small><strong>{shipping.stages.find(x=>x.status==='تعذر التسليم').count} شحنة</strong><span>تعذر التسليم · راجع الموظف وشركة الشحن</span></div></Card>
  </div>
  <div className="lifecycle-card-groups">{[[ordersAnalysis,'كل حالات الطلبات','orders'],[shipping,'مراحل الشحن بالتفصيل','shipping']].map(([analysis,title,scope])=><section className="lifecycle-card-group" key={scope} aria-labelledby={'stage-group-'+scope}>
   <header><h3 id={'stage-group-'+scope}>{title}</h3><span>{analysis.total} {scope==='orders'?'طلب':'شحنة'}</span></header>
   <p>الحالات الحالية داخل الفلاتر · النسب من إجمالي هذا القسم</p>
   <div className="lifecycle-stage-cards">{analysis.stages.map(stage=>{
    const tone=['ملغي','مرتجع','تعذر التسليم','جاري الإرجاع'].includes(stage.status)?'danger':['جديد','جاري التأكيد'].includes(stage.status)?'pending':stage.status==='تم التسليم'?'success':'active';
    const icon=tone==='danger'?(stage.status.includes('رج')?'reset':'circle-x'):tone==='pending'?'clock':tone==='success'?'circle-check':scope==='shipping'?'truck':'package';
    return <button className={'lifecycle-stage-card stage-tone-'+tone} key={stage.status} onClick={()=>onStage(stage.status)} aria-label={'تصفية حالة '+stage.status+' من '+title}>
     <span className="lifecycle-card-top"><span>{stage.status}</span><span className="lifecycle-card-icon"><Icon name={icon}/></span></span>
     <span className="lifecycle-card-values"><span><bdi>{stage.count}</bdi><small>{scope==='orders'?'طلب':'شحنة'}</small></span><span className="lifecycle-card-share"><bdi>{percent(stage.share)}</bdi><small>من إجمالي {scope==='orders'?'الطلبات':'الشحنات'}</small></span></span>
     <progress value={stage.share} max="100" aria-label={'نسبة '+stage.status}/>
    </button>;
   })}</div>
   <footer>كل طلب يظهر في حالة واحدة. الترتيب يوضح المراحل والفروع، ولا يعرض سجل انتقالات أو مدة انتظار.</footer>
  </section>)}</div>
  <Card className="lifecycle-carriers"><header><h3>تحليل شركات الشحن</h3><span>الشحنات الداخلة في دورة الشحن فقط · حسب تاريخ إنشاء الطلب</span></header>
   <div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>شركة الشحن</th><th>إجمالي الشحنات</th><th>جاهز للشحن</th><th>تم الالتقاط</th><th>قيد النقل</th><th>خرج للتسليم</th><th>تعذر التسليم</th><th>تم التسليم</th><th>جاري الإرجاع</th><th>مرتجع نهائي</th><th>نسبة الاستلام</th></tr></thead>
   <tbody>{carriers.map(carrier=>{const selected=shippingRows.filter(x=>x.carrier===carrier),stats=summarize(selected);return <tr key={carrier}><td>{carrier}</td><td>{stats.total}</td>{['ready','picked','inTransit','outForDelivery','deliveryFailed','delivered','returning','returned'].map(key=><td key={key} className={key==='deliveryFailed'?'analytics-danger':''}>{stats[key]}</td>)}<td><bdi>{percent(stats.deliveryRate)}</bdi></td></tr>})}</tbody></table></div>
   <footer>نسبة الاستلام = المسلّم ÷ (المسلّم + المرتجع النهائي). جميع البيانات تجريبية.</footer>
  </Card>
 </section>;
}
