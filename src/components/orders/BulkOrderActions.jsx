import React,{useState,useRef,useEffect} from 'react';
import {Button,Modal} from '@heroui/react';
import {Icon} from '../ui/Icon';
import {employees} from '../../data/adminAnalytics';

const statusOptions=[['جديد','جديد'],['جاري التأكيد','قيد التأكيد'],['مؤكد','مؤكد'],['بانتظار توفر المخزون','بانتظار توفر المخزون'],['انتظار إجراء','انتظار إجراء'],['مؤجل','مؤجل'],['مسودة','مسودة'],['ملغي','ملغي'],['وهمي','وهمي']];
const reasonStatuses=['ملغي','وهمي'];
const whatsappTemplates=[
 ['تأكيد الطلب','مرحبًا 👋 معك فريق هلا\nبخصوص طلبك: نودّ تأكيد الطلب وعنوان التوصيل قبل الشحن. يرجى الرد بكلمة «تأكيد» لإتمام الشحن.'],
 ['تأكيد العنوان','مرحبًا 👋 معك فريق هلا\nنرجو تأكيد عنوان التوصيل ووقت الاستلام المناسب، وسيتم شحن طلبك فور التأكيد.'],
 ['متابعة الشحنة','مرحبًا 👋 معك فريق هلا\nطلبك خرج للتوصيل 🚚 وسيصلك قريبًا. نرجو إبقاء الهاتف متاحًا لاستلام الطلب.'],
 ['تأجيل موعد التوصيل','مرحبًا 👋 معك فريق هلا\nهل يناسبك موعد التوصيل القادم؟ يمكنك تحديد وقت بديل يناسبك بالرد هنا.'],
 ['بانتظار التوفر','مرحبًا 👋 معك فريق هلا\nسجلّنا طلبك وسيصبح متاحًا قريبًا؛ سنعيد التواصل معك فور توفر المنتج.'],
];

function SelectionMenu({label,icon,children}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const close=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
    const key=e=>{if(e.key==='Escape')setOpen(false)};
    document.addEventListener('pointerdown',close);
    document.addEventListener('keydown',key);
    return ()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)};
  },[open]);
  return <div className={'orders-menu'+(open?' is-open':'')} ref={ref}>
    <Button size="sm" variant="ghost" aria-haspopup="menu" aria-expanded={open} onPress={()=>setOpen(v=>!v)}><Icon name={icon}/>{label}<Icon name={open?'chevron-up':'chevron-down'}/></Button>
    {open&&<div className="orders-menu-list" role="menu">{children}</div>}
  </div>;
}

const MenuItem=({children,danger,...props})=><button type="button" role="menuitem" className={'orders-menu-item'+(danger?' danger':'')} {...props}>{children}</button>;

export default function BulkOrderActions({selected,selectedOrders,onClear,onApply}){
  const [dialog,setDialog]=useState(''),[reason,setReason]=useState(''),[date,setDate]=useState(''),[template,setTemplate]=useState(-1),[message,setMessage]=useState('');
  const title=dialog==='fake'?'تصنيف الطلبات كوهمية':dialog==='cancel'?'إلغاء الطلبات المحددة':dialog==='postpone'?'تأجيل بموعد متابعة':'إرسال رسالة واتساب';
  const withPhone=selectedOrders.filter(o=>(o.phone||'').replace(/\D/g,'').length>=8).length;
  const open=key=>{setReason('');setDate('');setTemplate(-1);setMessage('');setDialog(key)};
  const pickTemplate=index=>{setTemplate(index);setMessage(whatsappTemplates[index][1])};
  const applyStatus=status=>{
    if(reasonStatuses.includes(status))return open(status==='وهمي'?'fake':'cancel');
    const patch=(status==='مؤكد'||status==='جاري التأكيد')?{status,scheduledAt:''}:{status};
    onApply(patch,'تغيير الحالة إلى '+status);
  };
  const applyEmployee=id=>onApply({employeeId:id},id?'تحويل الطلبات إلى موظف':'إلغاء تعيين الموظف');
  const apply=e=>{e.preventDefault();if(dialog!=='postpone'&&!reason.trim())return;onApply(dialog==='postpone'?{scheduledAt:date}:{status:'ملغي',cancellationReason:dialog==='fake'?'طلب وهمي: '+reason.trim():reason.trim()},dialog==='postpone'?'تأجيل بموعد متابعة':dialog==='fake'?'تصنيف الطلبات كوهمية':'إلغاء الطلبات');setDialog('')};
  const logWhatsapp=e=>{e.preventDefault();onApply({},'إرسال رسالة واتساب جماعية');setDialog('')};
  return <>
  <div className="orders-selection-spacer"/><div className="orders-selection-bar" role="region" aria-label="إجراءات الطلبات المحددة"><div className="orders-selection-actions">
    <SelectionMenu label="تحويل لموظف" icon="users">
      <MenuItem onClick={()=>applyEmployee('')}>إلغاء التعيين<small>بدون موظف مسؤول</small></MenuItem>
      <div className="orders-menu-divider" role="separator"/>
      {employees.map(x=><MenuItem key={x.id} onClick={()=>applyEmployee(x.id)}>{x.name}</MenuItem>)}
    </SelectionMenu>
    <SelectionMenu label="تغيير الحالة" icon="chart-bar">
      {statusOptions.map(([value,label])=><MenuItem key={value} danger={reasonStatuses.includes(value)} onClick={()=>applyStatus(value)}>{label}{reasonStatuses.includes(value)&&<small>يطلب سببًا</small>}</MenuItem>)}
      <div className="orders-menu-divider" role="separator"/>
      <MenuItem onClick={()=>open('postpone')}><Icon name="calendar"/>تأجيل بموعد متابعة…</MenuItem>
    </SelectionMenu>
    <Button size="sm" variant="ghost" onPress={()=>open('whatsapp')}><Icon name="whatsapp"/>إرسال واتساب</Button>
  </div><div className="orders-selection-count"><span><bdi>{selected.length}</bdi> محدد</span><button type="button" aria-label="إلغاء تحديد كل الطلبات" onClick={onClear}><Icon name="circle-x"/></button></div></div>
  <Modal><Modal.Backdrop isOpen={!!dialog} onOpenChange={isOpen=>!isOpen&&setDialog('')}><Modal.Container><Modal.Dialog className="analytics-detail-modal orders-dialog orders-bulk-dialog"><Modal.CloseTrigger aria-label="إغلاق الإجراء الجماعي"/><Modal.Heading>{title}</Modal.Heading>{dialog==='whatsapp'?
    <form className="od-action-form" onSubmit={logWhatsapp}><p className="orders-bulk-summary">مستلمون: <strong>{selected.length} طلب</strong> · {withPhone} لديه رقم هاتف صالح{selected.length-withPhone>0?` · ${selected.length-withPhone} بدون رقم`:''}</p><div className="wa-templates" role="radiogroup" aria-label="اختيار قالب الرسالة">{whatsappTemplates.map(([name,text],i)=><button key={name} type="button" role="radio" aria-checked={template===i} className={'wa-template'+(template===i?' active':'')} onClick={()=>pickTemplate(i)}><span className="wa-template-name"><Icon name="whatsapp"/>{name}</span><small>{text}</small></button>)}</div><label className="settings-field"><span>نص الرسالة{template>=0?' (قابل للتعديل)':' — اختر قالبًا أولًا'}</span><textarea rows={5} maxLength={1000} required value={message} onChange={e=>setMessage(e.target.value)} placeholder="اختر قالبًا من الأعلى ثم عدّل النص إن أردت…"/></label><p className="seller-credential-note"><Icon name="info"/><span>المعاينة لا ترسل رسائل واتساب فعلية؛ الزر يوثّق العملية في سجل كل طلب محدد فقط.</span></p><div className="orders-bulk-dialog-footer"><Button type="button" size="sm" variant="secondary" onPress={()=>setDialog('')}>رجوع</Button><Button type="submit" size="sm" isDisabled={template<0||!message.trim()}>تسجيل الإرسال لـ {selected.length} طلب<Icon name="circle-check"/></Button></div></form>
    :<form className="od-action-form" onSubmit={apply}>{dialog==='postpone'?<label className="settings-field"><span>موعد المتابعة</span><input type="datetime-local" min="2026-10-24T00:00" required value={date} onInput={e=>setDate(e.currentTarget.value)} onChange={e=>setDate(e.target.value)}/></label>:<label className="settings-field"><span>{dialog==='fake'?'سبب تصنيف الطلبات كوهمية':'سبب الإلغاء'}</span><textarea required maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="اكتب السبب…"/></label>}<p className="od-muted">التغيير داخل المعاينة التجريبية فقط.</p><div className="orders-bulk-dialog-footer"><Button type="button" size="sm" variant="secondary" onPress={()=>setDialog('')}>رجوع</Button><Button type="submit" size="sm" isDisabled={dialog==='postpone'?!date:!reason.trim()}>تطبيق على {selected.length} طلب<Icon name="circle-check"/></Button></div></form>}</Modal.Dialog></Modal.Container></Modal.Backdrop></Modal></>
}
