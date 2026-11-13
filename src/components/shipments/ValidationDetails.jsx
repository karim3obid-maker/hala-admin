import React,{useState} from 'react';
import {Button,Card,Modal} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import {employees,lookup,money,products} from '../../data/adminAnalytics';
import {productDetails} from '../../data/orderProductDetails';
import {reportConfirmationIssue,validationDeliveryIntentTitle,validationReasons,validationReportReasons,validationStatuses} from '../../data/adminStore';
import ValidationAttemptModal from './ValidationAttemptModal';

function Panel({title,icon,children,className='',action}){
 return <Card className={'od-card vd-detail-card '+className}><header><h2><span><Icon name={icon}/></span>{title}</h2>{action}</header>{children}</Card>;
}
function Facts({items}){
 return <dl className="vd-facts">{items.map(([label,value,wide])=><div key={label} className={wide?'wide':''}><dt>{label}</dt><dd>{value??'غير مرفق'}</dd></div>)}</dl>;
}
function State({value}){
 const tone=['تم التصرف','تم التسليم'].includes(value)?'success':['فشل التسليم','ملغية','مرتجع','تعذر التسليم'].includes(value)?'danger':validationStatuses.slice(2,4).includes(value)?'info':'pending';
 return <span className={'analytics-status '+tone}>{value||'غير مرفق'}</span>;
}
function formatDate(value){
 if(!value)return 'غير مسجل';
 const parsed=new Date(value);
 return Number.isNaN(parsed.getTime())?value:parsed.toLocaleString('ar-EG',{timeZone:'Africa/Cairo',dateStyle:'medium',...(value.includes('T')?{timeStyle:'short'}:{})});
}

export default function ValidationDetails({validation,order,shipment,onBack,onNext,onNavigate,notify}){
 const [actionMode,setActionMode]=useState(''),[reportOpen,setReportOpen]=useState(false);
 const [reportCategory,setReportCategory]=useState(''),[reportNote,setReportNote]=useState(''),[reportError,setReportError]=useState('');
 const closed=validation.status===validationStatuses[4],stageIndex=validationStatuses.indexOf(validation.status),attempts=validation.attempts;
 const customer=order.customer||shipment.customer,phone=order.phone||shipment.phone;
 const currency=order.currency||shipment.currency||'USD',amount=order.amount??shipment.amount,paid=order.paymentStatus==='مدفوع';
 const employee=lookup(employees,validation.employeeId||order.employeeId),update=validation.carrierUpdate;
 const items=order.items?.length?order.items:[{productId:order.productId||shipment.productId,quantity:order.quantity||shipment.quantity||1,price:amount/(order.quantity||shipment.quantity||1)}];
 const pieces=items.reduce((sum,item)=>sum+Number(item.quantity||0),0);
 const lastAttempt=attempts.at(-1),reports=validation.confirmationReports||[];
 const historyMap=new Map();
 const remember=event=>historyMap.set(event.id,{...event,actor:event.actor||employee});
 attempts.forEach(a=>remember({...a,type:'attempt',title:'محاولة اتصال: '+a.result,summary:a.outcome+(a.note?' — '+a.note:'')}));
 (validation.history||[]).filter(event=>event.type!=='attempt').forEach(remember);
 (validation.carrierUpdates||[]).forEach(event=>{
  if(!historyMap.has(event.id))remember({...event,type:'carrier',title:event.title||'إجراء شركة الشحن: '+event.status,summary:event.note});
 });
 reports.forEach(report=>{
  if(![...historyMap.values()].some(e=>e.id===report.id||(e.type==='confirmation-report'&&e.at===report.reportedAt&&e.summary===report.details)))remember({
   id:report.id,type:'confirmation-report',title:'بلاغ عن مشكلة في تأكيد الطلب',summary:[report.category,report.details].filter(Boolean).join(' — '),actor:lookup(employees,report.reportedById),at:report.reportedAt,
  });
 });
 const history=[...historyMap.values()].sort((a,b)=>String(b.at).localeCompare(String(a.at)));
 const copy=async value=>{try{await navigator.clipboard.writeText(value);notify('تم النسخ')}catch{notify('النسخ غير متاح في المتصفح')}};
 const openReport=()=>{setReportCategory('');setReportNote('');setReportError('');setReportOpen(true)};
 const report=e=>{
  e.preventDefault();
  const error=reportConfirmationIssue(validation.id,{category:reportCategory,details:reportNote});
  if(error){setReportError(error);return}
  setReportOpen(false);notify('تم تسجيل بلاغ مشكلة التأكيد');
 };
 return <div className="vd-detail ow-compact">
  <header className="ow-heading vd-workspace-heading">
   <div className="ow-heading-title">
    <IconButton icon="chevron-right" label="العودة لحالات التحقق" onPress={onBack}/>
    <div><h2>حالة التحقق <bdi>{validation.id}</bdi></h2><p><bdi>{order.id}</bdi> · <bdi>{shipment.id}</bdi></p></div>
   </div>
   <div className="vd-heading-links">
    <Button size="sm" variant="secondary" onPress={()=>onNavigate('الطلبات',order.id)}>تفاصيل الطلب<Icon name="chevron-left"/></Button>
    <Button size="sm" variant="secondary" onPress={()=>onNavigate('الشحنات',shipment.id)}>تفاصيل الشحنة<Icon name="chevron-left"/></Button>
   </div>
  </header>
  <section className="vd-overview" aria-label="ملخص الشحنة والفالديشن">
   <div className="vd-overview-statuses">
    <div><span>حالة الشحنة الحالية</span><State value={shipment.status}/></div>
    <div><span>مرحلة الفالديشن</span><State value={validation.status}/></div>
    <div><span>سبب دخول الفالديشن</span><strong>{validationReasons[validation.entryReason]||'غير مرفق'}</strong></div>
    <div><span>الدفع عند الاستلام</span><strong><bdi>{money(paid?0:amount)} {currency}</bdi></strong>{paid&&<small>مدفوع</small>}</div>
   </div>
   <div className="vd-update-snapshot">
    <h3><Icon name="truck"/>تحديث شركة الشحن محل التحقق</h3>
    <Facts items={[
     ['الحالة التي أبلغت بها الشركة',update?.status?<State value={update.status}/>:null],
     ['شركة الشحن',update?.carrier||null],
     ['رقم التتبع',update?.tracking?<span className="vd-copy-value"><bdi>{update.tracking}</bdi><IconButton icon="copy" label="نسخ رقم التتبع" onPress={()=>copy(update.tracking)}/></span>:null],
     ['وقت التحديث',formatDate(update?.at)],
    ]}/>
   </div>
  </section>
  <div className="ow-layout vd-workspace-layout">
   <aside className="ow-summary vd-workspace-side">
    <Panel title="إجراءات الفالديشن" icon="headset" className="ow-action-panel">
     <div className="ow-panel-controls">
      {onNext&&<Button size="sm" variant="secondary" className="vd-next-validation" onPress={onNext}><Icon name="chevron-left"/>الطلب التالي</Button>}
      <div className="vd-attempt-meter">
       <div><span>محاولات الاتصال</span><strong><bdi>{attempts.length} / 5</bdi></strong></div>
       <progress max={5} value={Math.min(attempts.length,5)} aria-label="تقدم محاولات الاتصال"/>
      </div>
      {lastAttempt&&<div className="vd-recent-call"><small>آخر اتصال</small><strong>{lastAttempt.result} · {lastAttempt.outcome}</strong><time dateTime={lastAttempt.at}>{formatDate(lastAttempt.at)}</time></div>}
      {closed?<div className="vd-closed-result"><Icon name="circle-check"/><div><strong>{validation.finalAction==='إلغاء نهائي'?'إلغاء الشحن':validation.finalAction||'تم إغلاق الحالة'}</strong><small>{formatDate(validation.closedAt)}</small></div></div>:<>
       <Button size="sm" onPress={()=>setActionMode('call')}><Icon name="headset"/>تسجيل اتصال وإجراء</Button>
       <div className="vd-shipment-actions">
        <Button size="sm" className="vd-shipment-accept" isDisabled={Boolean(validation.deliveryRequestedAt)} onPress={()=>setActionMode('wants-delivery')}><Icon name="circle-check"/>{validation.deliveryRequestedAt?'تم تسجيل رغبة العميل':validationDeliveryIntentTitle}</Button>
        <Button size="sm" className="vd-shipment-cancel" onPress={()=>setActionMode('cancel')}><Icon name="circle-x"/>إلغاء الشحن</Button>
       </div>
      </>}
     </div>
    </Panel>
    <Panel title="تأكيد الطلب السابق" icon="circle-check">
     <Facts items={[
      ['تاريخ التأكيد',formatDate(order.confirmedAt)],['الموظف المسؤول حاليًا',employee],['ملاحظة التأكيد',order.confirmationNote||'لا توجد ملاحظة مسجلة',true],
     ]}/>
     <div className="vd-report-controls"><Button size="sm" variant="secondary" className="vd-report-button" onPress={openReport}><Icon name="warning"/>الإبلاغ عن مشكلة في التأكيد</Button></div>
    </Panel>
   </aside>
   <div className="ow-editor">
    <div className="ow-order-columns">
     <Panel title="بيانات العميل والتوصيل" icon="person">
      {phone&&<button type="button" className="vd-phone" aria-label="نسخ رقم هاتف العميل" onClick={()=>copy(phone)}><span><small>رقم هاتف العميل</small><bdi dir="ltr">{phone}</bdi></span><Icon name="copy"/></button>}
      <Facts items={[
       ['اسم العميل',<strong>{customer||'غير مرفق'}</strong>,true],['الدولة',order.country||shipment.country],['المدينة',order.city||shipment.city],['المنطقة',order.region],['الحي',order.district],['العنوان الوطني',order.nationalAddress],['رقم إضافي',order.extraPhone],['عنوان التوصيل',order.address||shipment.address,true],
      ]}/>
     </Panel>
     <Panel title="المنتجات والكميات" icon="package" action={<span className="ow-section-state">{items.length} منتج · {pieces} قطعة</span>}>
      <div className="vd-products">{items.map((item,index)=>{
       const product=products.find(p=>p.id===item.productId),details=productDetails[item.productId],name=product?.name||'منتج غير مرفق';
       return <article className="vd-product" key={item.productId+'-'+index}>
        <header><span className="vd-product-icon ow-product-thumb">{details?.images?.[0]?<img src={details.images[0]} alt=""/>:<Icon name="package"/>}</span><div><h4>{name}</h4><p><bdi>{details?.sku||'SKU غير مرفق'}</bdi> · {item.quantity} قطعة</p></div><strong><bdi>{money(Number(item.price||0)*Number(item.quantity||0))} {currency}</bdi></strong></header>
        <details className="ow-product-description"><summary>تفاصيل المنتج ومحتوياته<Icon name="chevron-down"/></summary><p>{details?.description||'وصف المنتج غير مرفق.'}</p><p>محتويات المنتج: {details?.contents||'غير مرفقة'}</p></details>
       </article>;
      })}</div>
     </Panel>
    </div>
   </div>
  </div>
  <Panel title="سجل الفالديشن" icon="reset" action={<span className="vd-panel-note">{history.length} حدث</span>}>
   {history.length?<ol className="vd-timeline">{history.map(event=><li key={event.id} className={'vd-event-'+event.type}><span className="vd-event-icon"><Icon name={event.type==='carrier'?'truck':event.type==='confirmation-report'?'warning':event.type==='decision'?'circle-check':'headset'}/></span><div><strong>{event.title}</strong><p>{event.summary||'بدون ملاحظات'}</p><small>{event.actor&&event.actor+' · '}<time dateTime={event.at}>{formatDate(event.at)}</time></small></div></li>)}</ol>:<div className="od-empty"><Icon name="reset"/><h3>لا توجد أحداث مسجلة</h3></div>}
  </Panel>
  <details className="vd-stages-disclosure">
   <summary>مراحل الفالديشن</summary>
   <ol className="vd-stage-strip">{validationStatuses.map((status,index)=><li key={status} aria-current={index===stageIndex?'step':undefined} className={'vd-stage '+(index<stageIndex?'complete':index===stageIndex?'current':'')}><span>{index<stageIndex?<Icon name="circle-check"/>:index+1}</span><bdi>{status}</bdi></li>)}</ol>
  </details>
  <ValidationAttemptModal validation={validation} mode={actionMode} onClose={()=>setActionMode('')} notify={notify}/>
  <Modal><Modal.Backdrop isOpen={reportOpen} onOpenChange={value=>{if(!value)setReportOpen(false)}}><Modal.Container><Modal.Dialog className="analytics-detail-modal orders-dialog">
   <Modal.CloseTrigger aria-label="إغلاق بلاغ التأكيد"/><Modal.Heading>الإبلاغ عن مشكلة في التأكيد</Modal.Heading>
   <p className="analytics-detail-intro">يظهر البلاغ في سجل الفالديشن والطلب والشحنة.</p>
   <form className="od-action-form" onSubmit={report}>
    <label className="settings-field"><span>نوع المشكلة</span><select required value={reportCategory} onChange={e=>{setReportCategory(e.target.value);setReportError('')}}><option value="">اختر نوع المشكلة</option>{validationReportReasons.map(value=><option key={value}>{value}</option>)}</select></label>
    <label className="settings-field"><span>تفاصيل المشكلة (20 حرفًا على الأقل)</span><textarea required minLength={20} maxLength={1000} value={reportNote} onChange={e=>{setReportNote(e.target.value);setReportError('')}}/></label>
    {reportError&&<p className="orders-error" role="alert">{reportError}</p>}
    <footer className="vd-dialog-footer"><Button type="button" size="sm" variant="secondary" onPress={()=>setReportOpen(false)}>رجوع</Button><Button type="submit" size="sm"><Icon name="warning"/>حفظ البلاغ</Button></footer>
   </form>
  </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>
 </div>;
}
