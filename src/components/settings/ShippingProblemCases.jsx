import React,{useMemo,useState} from 'react';
import {Button,Card,Chip,Modal,Switch} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import useAdminStore from '../../data/useAdminStore';
import {defaultShippingProblemCases,setShippingProblemCases,shippingProblemStatusOptions} from '../../data/adminStore';
import {isLate,needsActionOf} from '../shipments/ShipmentStatusSummary';

function Field({label,children}){return <label className="settings-field"><span>{label}</span>{children}</label>}
const emptyDraft={id:'',label:'',description:'',status:shippingProblemStatusOptions[1],kind:'status'};

export default function ShippingProblemCases({notify}){
 const store=useAdminStore();
 const shipments=store.shipments||[];
 const items=useMemo(()=>store.shippingProblemCases?.length?store.shippingProblemCases:defaultShippingProblemCases,[store.shippingProblemCases]);
 const [query,setQuery]=useState(''),[open,setOpen]=useState(false),[draft,setDraft]=useState(emptyDraft);
 const isEditing=!!draft.id,today=new Date().toISOString().slice(0,10);

 const matches=(c,s)=>c.kind==='status'?s.status===c.status:c.kind==='late'?isLate(s,today):needsActionOf(s);
 const countOf=c=>shipments.filter(s=>matches(c,s)).length;
 const activeCases=items.filter(c=>c.active);
 const problemShipments=shipments.filter(s=>activeCases.some(c=>matches(c,s))).length;
 const rows=items.filter(c=>(c.label+' '+(c.description||'')+' '+c.status).includes(query));

 const openAdd=()=>{setDraft({...emptyDraft});setOpen(true)};
 const openEdit=c=>{setDraft({...c});setOpen(true)};
 const reset=()=>{setOpen(false);setDraft(emptyDraft)};
 const save=e=>{
  e.preventDefault();
  const label=draft.label.trim();
  if(!label)return;
  if(items.some(c=>c.id!==draft.id&&c.label.trim()===label)){notify('هذه الحالة مضافة بالفعل إلى القائمة');return}
  const payload={...draft,label,description:(draft.description||'').trim(),kind:draft.kind||'status'};
  if(draft.id){setShippingProblemCases(list=>list.map(c=>c.id===draft.id?payload:c));notify('تم تحديث حالة المشكلة')}
  else{setShippingProblemCases(list=>[...list,{...payload,id:crypto.randomUUID(),system:false,active:true}]);notify('تمت إضافة حالة المشكلة')}
  reset();
 };
 const toggle=c=>{setShippingProblemCases(list=>list.map(x=>x.id===c.id?{...x,active:!x.active}:x));notify(c.active?'تم تعطيل الحالة — لن تُحتسب كمشكلة':'تم تفعيل الحالة — أصبحت تُحتسب كمشكلة')};
 const remove=c=>{if(c.system){notify('حالة نظامية — يمكن تعطيلها بدل حذفها');return}setShippingProblemCases(list=>list.filter(x=>x.id!==c.id));notify('تم حذف الحالة من القائمة')};

 return <Card className="settings-section admin-reasons spc-section">
  <header className="settings-management-heading"><div><h2>حالات مشكلات الشحنات</h2><p>الحالات التي تُعد مشكلة تشغيلية في الشحنة، مع عدد الشحنات الحالية في كل حالة.</p></div><Button size="sm" onPress={openAdd}><Icon name="plus"/>إضافة حالة</Button></header>
  <div className="reason-stats"><span>الإجمالي <bdi>{items.length}</bdi></span><span>المفعّلة <bdi>{activeCases.length}</bdi></span><span>شحنات عليها مشكلة <bdi>{problemShipments}</bdi></span><span className="settings-preview-label"><Icon name="info"/>سجلات محلية للمعاينة</span></div>
  <div className="admin-record-toolbar"><div className="settings-record-search"><input aria-label="بحث في حالات مشكلات الشحنات" value={query} onChange={e=>setQuery(e.target.value)} placeholder="بحث في حالات المشكلات…"/></div></div>
  {rows.length?<div className="admin-table-wrap"><table className="admin-data-table spc-table">
   <thead><tr><th>الحالة</th><th>نوع المشكلة</th><th>شحنات حالياً</th><th>التفعيل</th><th>الإجراءات</th></tr></thead>
   <tbody>{rows.map(c=><tr key={c.id}>
    <td><div className="spc-case"><strong>{c.label}</strong><small>{c.description||'—'}</small></div></td>
    <td><Chip size="sm" variant="soft" color={c.kind==='status'?'default':c.kind==='late'?'warning':'danger'}>{c.status}</Chip></td>
    <td><bdi className="spc-count">{countOf(c)}</bdi></td>
    <td><div className="pm-switch-cell"><Switch size="sm" isSelected={c.active} onChange={()=>toggle(c)} aria-label={'تفعيل '+c.label}><Switch.Content><Switch.Control><Switch.Thumb/></Switch.Control></Switch.Content></Switch><Chip size="sm" color={c.active?'success':'default'} variant="soft">{c.active?'مفعّلة':'معطّلة'}</Chip></div></td>
    <td><div className="pm-row-actions"><IconButton icon="edit" label={'تعديل '+c.label} onPress={()=>openEdit(c)}/>{!c.system&&<IconButton icon="trash" label={'حذف '+c.label} onPress={()=>remove(c)}/>}</div></td>
   </tr>)}</tbody>
  </table></div>:<div className="admin-record-empty"><Icon name="warning"/><h3>{query?'لا توجد حالات مطابقة':'لا توجد حالات مشكلات'}</h3><p>أضف حالة مشكلة لمعاينتها.</p></div>}
  <Modal><Modal.Backdrop isOpen={open} onOpenChange={o=>{if(!o)reset()}}><Modal.Container><Modal.Dialog className="crm-dialog"><Modal.CloseTrigger aria-label="إغلاق"/><Modal.Heading>{isEditing?'تعديل حالة مشكلة':'إضافة حالة مشكلة'}</Modal.Heading>
   <form className="pm-form" onSubmit={save}>
    <Field label="اسم الحالة"><input required value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))} placeholder="مثال: تعذر التسليم للمرة الثانية"/></Field>
    <Field label="الوصف"><input value={draft.description} onChange={e=>setDraft(d=>({...d,description:e.target.value}))} placeholder="شرح مختصر يظهر للفريق"/></Field>
    <Field label="حالة الشحنة المرتبطة"><select value={draft.status} disabled={draft.kind!=='status'} onChange={e=>setDraft(d=>({...d,status:e.target.value}))}>{draft.kind==='status'?shippingProblemStatusOptions.map(s=><option key={s}>{s}</option>):<option>{draft.status}</option>}</select></Field>
    <p className="spc-hint">{draft.kind==='status'?'تُحتسب الشحنات من حالتها الحالية.':'حالة محسوبة تلقائيًا من بيانات الشحنة.'}</p>
    <div className="pm-form-actions"><Button type="button" size="sm" variant="ghost" onPress={reset}>إلغاء</Button><Button type="submit" size="sm"><Icon name="circle-check"/>حفظ</Button></div>
   </form>
  </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>
 </Card>;
}
