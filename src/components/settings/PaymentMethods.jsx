import React,{useMemo,useState} from 'react';
import {Button,Card,Chip,Modal,Switch} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import useAdminStore from '../../data/useAdminStore';
import {defaultPaymentMethods,setPaymentMethods} from '../../data/adminStore';

const typeMeta={
 payoneer:{label:'Payoneer',icon:'world',fields:[{key:'account',label:'حساب Payoneer لاستلام المدفوعات',placeholder:'example@payoneer.com'}]},
 bank:{label:'حساب بنكي',icon:'building-store',fields:[{key:'bankName',label:'اسم البنك',placeholder:'البنك الأهلي'},{key:'accountNumber',label:'رقم الحساب / IBAN',placeholder:'SA03...'},{key:'accountHolder',label:'اسم صاحب الحساب',placeholder:'اسم الشركة'}]},
 instapay:{label:'InstaPay',icon:'link',fields:[{key:'phone',label:'رقم الهاتف / حساب InstaPay لاستلام المدفوعات',placeholder:'0100 XXX XXXX'}]},
 wallet:{label:'محفظة',icon:'wallet',fields:[{key:'provider',label:'نوع المحفظة الإلكترونية',placeholder:'Vodafone Cash / STC Pay'},{key:'number',label:'رقم المحفظة لاستلام المدفوعات',placeholder:'05X XXX XXXX'}]}
};

function Field({label,children}){return <label className="settings-field"><span>{label}</span>{children}</label>}

const emptyDraft={id:'',type:'payoneer',label:'',enabled:true,fields:{}};

export default function PaymentMethods({notify}){
 const store=useAdminStore();
 const items=useMemo(()=>store.paymentMethods?.length?store.paymentMethods:defaultPaymentMethods(),[store.paymentMethods]);
 const [open,setOpen]=useState(false);
 const [draft,setDraft]=useState(emptyDraft);
 const isEditing=!!draft.id;

 const reset=()=>{setOpen(false); setDraft(emptyDraft);};
 const openAdd=()=>{setDraft({...emptyDraft,type:'payoneer',fields:fieldsFor('payoneer')}); setOpen(true);};
 const openEdit=m=>{setDraft({...m,fields:{...m.fields}}); setOpen(true);};
 const fieldsFor=type=>Object.fromEntries((typeMeta[type]||typeMeta.wallet).fields.map(f=>[f.key,'']));

 const setField=(key,value)=>setDraft(d=>({...d,fields:{...d.fields,[key]:value}}));
 const setType=type=>setDraft(d=>({...d,type,label:d.id?d.label:(type==='wallet'?'':typeMeta[type].label),fields:fieldsFor(type)}));

 const save=e=>{
  e.preventDefault();
  const meta=typeMeta[draft.type];
  const label=draft.type==='wallet'?(draft.label.trim()||meta.label):meta.label;
  const payload={...draft,label,fields:{...draft.fields}};
  if(draft.id){
   setPaymentMethods(list=>list.map(x=>x.id===draft.id?payload:x));
   notify('تم تحديث '+label);
  }else{
   setPaymentMethods(list=>[...list,{...payload,id:crypto.randomUUID()}]);
   notify('تمت إضافة '+label);
  }
  reset();
 };

 const toggle=m=>{
  setPaymentMethods(list=>list.map(x=>x.id===m.id?{...x,enabled:!x.enabled}:x));
  notify((!m.enabled?'تم تشغيل ':'تم إيقاف ')+m.label);
 };

 const remove=m=>{setPaymentMethods(list=>list.filter(x=>x.id!==m.id)); notify('تم حذف '+m.label);};

 return <Card className="settings-section"><header className="settings-management-heading"><div><h2>طرق دفع العملاء</h2><p>الطرق اللي العميل يدفع من خلالها لإتمام طلباته.</p></div><Button size="sm" onPress={openAdd}><Icon name="plus"/>إضافة طريقة</Button></header>
  <div className="admin-record-toolbar"><span className="settings-preview-label"><Icon name="info"/>سجلات محلية للمعاينة</span></div>
  {items.length?(
   <div className="admin-table-wrap"><table className="admin-data-table pm-table"><thead><tr><th>الطريقة</th><th>النوع</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>
    {items.map(m=>{
     const meta=typeMeta[m.type]||typeMeta.wallet;
     return <tr key={m.id}>
      <td><div className="pm-row-name"><span className="pm-row-icon"><Icon name={meta.icon}/></span><div><strong>{m.label}</strong><small>{meta.fields.map(f=>m.fields[f.key]).filter(Boolean).join(' · ')||'—'}</small></div></div></td>
      <td>{meta.label}</td>
      <td><div className="pm-switch-cell"><Switch size="sm" isSelected={m.enabled} onChange={()=>toggle(m)} aria-label={'تفعيل '+m.label}><Switch.Content><Switch.Control><Switch.Thumb/></Switch.Control></Switch.Content></Switch><Chip size="sm" color={m.enabled?'success':'default'} variant="soft">{m.enabled?'مفعّلة':'معطّلة'}</Chip></div></td>
      <td><div className="pm-row-actions"><IconButton icon="edit" label="تعديل" onPress={()=>openEdit(m)}/><IconButton icon="trash" label="حذف" onPress={()=>remove(m)}/></div></td>
     </tr>;
    })}
   </tbody></table></div>
  ):<div className="admin-record-empty"><Icon name="wallet"/><h3>لا توجد طرق دفع مضافة</h3><p>أضف طريقة دفع لمعاينتها.</p></div>}

  <Modal><Modal.Backdrop isOpen={open} onOpenChange={o=>{if(!o)reset()}}><Modal.Container><Modal.Dialog className="crm-dialog"><Modal.CloseTrigger aria-label="إغلاق"/><Modal.Heading>{isEditing?'تعديل طريقة الدفع':'إضافة طريقة دفع'}</Modal.Heading>
   <form className="pm-form" onSubmit={save}>
    <Field label="نوع الطريقة"><select value={draft.type} onChange={e=>setType(e.target.value)} disabled={isEditing}>{Object.entries(typeMeta).map(([k,m])=><option key={k} value={k}>{m.label}</option>)}</select></Field>
    {draft.type==='wallet'&&<Field label="اسم المحفظة"><input required value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))} placeholder="مثال: Vodafone Cash"/></Field>}
    {(typeMeta[draft.type]||typeMeta.wallet).fields.map(f=><Field key={f.key} label={f.label}><input value={draft.fields[f.key]||''} onChange={e=>setField(f.key,e.target.value)} placeholder={f.placeholder} dir="ltr"/></Field>)}
    <div className="pm-form-actions"><Button type="button" size="sm" variant="ghost" onPress={reset}>إلغاء</Button><Button type="submit" size="sm"><Icon name="circle-check"/>حفظ</Button></div>
   </form>
  </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>
 </Card>;
}
