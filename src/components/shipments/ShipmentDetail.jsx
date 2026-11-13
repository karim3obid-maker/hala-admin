import React,{useState} from 'react';
import {Button,Card} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import useAdminStore from '../../data/useAdminStore';
import {products,lookup} from '../../data/adminAnalytics';
const tabs=['تفاصيل الشحنة','معاملات المحفظة','طلبات التعديل'];
/* مسار الشحنة: موقعها الحالي داخل دورة التوصيل مع تاريخ كل مرحلة سُجّلت. */
const journey=[
 {label:'تم الإنشاء',icon:'clock',step:0,dateKey:'date'},
 {label:'جاهز للتسليم',icon:'package',step:1,dateKey:''},
 {label:'تم الشحن',icon:'truck',step:2,dateKey:'shippedAt'},
 {label:'في الطريق',icon:'truck',step:3,dateKey:''},
 {label:'محاولة التسليم',icon:'location',step:4,dateKey:'failedAt',tone:'red'},
 {label:'تم التسليم',icon:'circle-check',step:5,dateKey:'deliveredAt'}];
const journeyIndex={'قيد الانتظار':0,'قيد التجهيز':1,'جاهز للشحن':1,'تم الشحن':2,'في الطريق':3,'تحت محاولة التسليم':4,'فشل التسليم':4,'تم التسليم':5};
export function ShipmentBadge({status,tone}){return <span className={'shipment-badge shipment-tone-'+tone}><i/>{status}</span>}
function Facts({items}){return <dl className="shipment-detail-facts">{items.map(([label,value,wide])=><div key={label} className={wide?'wide':''}><dt>{label}</dt><dd>{value||'—'}</dd></div>)}</dl>}
function Panel({title,icon,children,className=''}){return <Card className={'shipment-info-panel '+className}><h2><Icon name={icon}/>{title}</h2>{children}</Card>}
function Steps({shipment:r,tone}){
 const returning=['جاري الإرجاع','مرتجع'].includes(r.status);
 const cancelled=r.status==='ملغية';
 const nodes=returning?[...journey,{label:r.status,icon:'reset',step:6,dateKey:'returnedAt',tone:r.status==='مرتجع'?'purple':'amber'}]:journey;
 const current=returning?6:(journeyIndex[r.status]??0);
 return <nav className="sh-steps" aria-label="مسار الشحنة داخل دورة التوصيل">
  {nodes.map((node,i)=>{const reached=!cancelled&&i<=current,isCurrent=!cancelled&&i===current,toneClass=(isCurrent&&node.tone)?' sh-tone-'+node.tone:'';
   return <div key={node.label} className={'sh-step'+(reached?' reached':'')+((isCurrent&&!node.tone)?' current':'')+toneClass}>
    <span className="sh-step-dot"><Icon name={node.icon}/></span>
    <bdi>{node.label}</bdi>
    {node.dateKey&&r[node.dateKey]?<time>{r[node.dateKey]}</time>:<time aria-hidden="true">&nbsp;</time>}
   </div>})}
 </nav>;
}
export default function ShipmentDetail({shipment:r,onBack,onEdit,tone,notify,onNavigate,onArrive}){
 const {sellers}=useAdminStore();
 const [tab,setTab]=useState(tabs[0]),[showSKU,setShowSKU]=useState(false),[allEvents,setAllEvents]=useState(false);
 const product=products.find(p=>p.id===r.productId),items=r.items|| (product?[{productId:product.id,quantity:r.quantity,price:r.amount/r.quantity}]:[]);
 const events=r.events||[],requests=r.changeRequests||[];
 const returning=['جاري الإرجاع','مرتجع'].includes(r.status);
 return <div className="shipment-detail-page"><header className="shipment-detail-top"><div className="shipment-detail-title"><IconButton icon="chevron-right" label="العودة للشحنات" onPress={onBack}/><div><h1>شحنة <bdi>{r.id}</bdi><IconButton icon="copy" label="نسخ رقم الشحنة" onPress={async()=>{try{await navigator.clipboard.writeText(r.id);notify('تم نسخ رقم الشحنة')}catch{notify('تعذر النسخ')}}}/></h1><p>أُنشئت في <bdi>{r.date}</bdi> · بيانات تجريبية</p></div></div><div className="shipment-detail-controls"><ShipmentBadge status={r.status} tone={tone}/>{returning&&!r.arrivedAtWarehouse&&<Button size="sm" variant="secondary" onPress={()=>onArrive?.(r.id)}><Icon name="building-store"/>تسجيل وصول المخزن</Button>}<Button size="sm" onPress={()=>onEdit(r,'status')}><Icon name="reset"/>تحديث الحالة</Button><Button size="sm" variant="secondary" onPress={()=>onEdit(r,'tracking')}><Icon name="truck"/>تعديل بيانات التتبع</Button></div></header>
 <Steps shipment={r} tone={tone}/>
 <nav className="shipment-detail-tabs" aria-label="أقسام تفاصيل الشحنة">{tabs.map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}{t===tabs[2]&&requests.length>0&&<bdi>{requests.length}</bdi>}</button>)}</nav>
 {tab===tabs[0]?<div className="shipment-detail-layout"><div className="shipment-detail-main"><Panel title="معلومات الشحنة" icon="package"><Facts items={[
 ['رقم الشحنة',<bdi>{r.id}</bdi>],['الحالة',<ShipmentBadge status={r.status} tone={tone}/>],['رقم الطلب',<button className="crm-text-link" onClick={()=>onNavigate?.('الطلبات',r.orderId)}>{r.orderId}</button>],['شركة الشحن',r.carrier],['رقم التتبع',<bdi>{r.tracking||'—'}</bdi>],['التوصيل المتوقع',r.expectedDelivery],['المبلغ (COD)',<bdi className="analytics-order-id">{r.amount} {r.currency||'USD'}</bdi>],['عدد المنتجات',`${r.quantity||0} قطعة`],['البائع',lookup(sellers,r.sellerId)],
 ...(r.cancellationCategory?[['سبب الإلغاء',r.cancellationCategory],['تفاصيل السبب',r.cancellationDetails,true]]:[])
 ]}/></Panel><Panel title="بيانات العميل والعنوان" icon="person"><Facts items={[
 ['اسم العميل',r.customer],['رقم الهاتف',r.phone],['هاتف إضافي',r.extraPhone],['الدولة',r.country],['المنطقة',r.region],['المدينة',r.city],['الحي',r.district],['العنوان',r.address,true],['العنوان الوطني',r.nationalAddress]
 ]}/></Panel><Panel title={`عناصر الشحنة (${items.length})`} icon="package"><div className="shipment-products-heading"><div><h3>منتجات الشحنة</h3><p>{items.length?items.length+' منتج':'لم تُرفق بيانات منتجات'}</p></div><Button size="sm" variant="secondary" aria-pressed={showSKU} onPress={()=>setShowSKU(!showSKU)}><Icon name="layout-grid"/>{showSKU?'إخفاء رمز المنتج':'عرض رمز المنتج'}</Button></div><div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>المنتج</th>{showSKU&&<th>رمز المنتج</th>}<th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>{items.map((item,i)=><tr key={item.productId+'-'+i}><td><span className="shipment-product-name"><span><Icon name="package"/></span>{products.find(p=>p.id===item.productId)?.name||'منتج غير مرفق'}</span></td>{showSKU&&<td><bdi>{item.productId.toUpperCase()}</bdi></td>}<td>{item.quantity}</td><td><bdi>{item.price} {r.currency||'USD'}</bdi></td><td><bdi>{Math.round(item.price*item.quantity*100)/100} {r.currency||'USD'}</bdi></td></tr>)}</tbody><tfoot><tr><td colSpan={showSKU?4:3}>إجمالي التحصيل</td><td><bdi>{r.amount} {r.currency||'USD'}</bdi></td></tr></tfoot></table></div></Panel></div>
 <aside className="shipment-detail-aside"><Panel title="التواريخ" icon="clock"><Facts items={[
 ['تاريخ الإنشاء',r.date],['تاريخ الشحن',r.shippedAt],['تاريخ التسليم',r.deliveredAt],['تاريخ الفشل',r.failedAt],['تاريخ الإرجاع',r.returnedAt],...(r.arrivedAtWarehouse?[['وصول المخزن',r.arrivedAtWarehouseAt||'مسجل']]:[])
 ]}/><p className="shipment-data-note">تظهر تواريخ الحالات عند تسجيلها داخل المعاينة.</p></Panel><Panel title="سجل التحديثات" icon="reset">{events.length?<React.Fragment><ol className={'shipment-history'+(allEvents?' sh-history-all':'')}>{events.slice().reverse().map((event,i)=><li key={i}><span className="shipment-history-dot"/><div><strong>{event.title}</strong><p>{event.summary}</p><time>{new Date(event.at).toLocaleString('ar-EG')}</time></div></li>)}</ol>{events.length>5&&!allEvents&&<Button size="sm" variant="ghost" className="sh-history-toggle" onPress={()=>setAllEvents(true)}><Icon name="chevron-down"/>عرض كل التحديثات ({events.length})</Button>}</React.Fragment>:<div className="shipment-quiet-empty"><Icon name="clock"/><p>لا توجد تحديثات مسجلة</p><small>ستظهر هنا التعديلات التي تنفذها.</small></div>}</Panel></aside></div>
 :tab===tabs[1]?<Panel title="معاملات المحفظة" icon="wallet"><div className="shipment-quiet-empty"><Icon name="wallet"/><h3>لا توجد معاملات محفظة مرفقة</h3><p>تظهر المعاملات المرتبطة بالشحنة بعد ربط النظام.</p></div></Panel>:<Panel title="طلبات التعديل" icon="edit">{requests.length?<div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>نوع التعديل</th><th>التفاصيل</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>{requests.slice().reverse().map((event,i)=><tr key={i}><td>{event.title}</td><td>{event.summary||event.title}</td><td>{new Date(event.at).toLocaleString('ar-EG')}</td><td><span className="shipment-badge shipment-tone-green">{event.status}</span></td></tr>)}</tbody></table></div>:<div className="shipment-quiet-empty"><Icon name="edit"/><h3>لا توجد طلبات تعديل</h3><p>تظهر هنا طلبات التعديل الواردة فقط. سجل التغييرات محفوظ في سجل التحديثات.</p></div>}</Panel>}
 </div>
}
