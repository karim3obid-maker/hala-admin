import React,{useState} from 'react';
import {Button,Card,Chip,Modal} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import {MetricRows} from '../dashboard/Metrics';
import useAdminStore from '../../data/useAdminStore';
import {setPlans} from '../../data/adminStore';
const groups=[
 {label:'أسعار الشحن',icon:'truck',short:['التغليف','المشحون','الموصل','المرتجع','COD (%)'],fields:[['packing','سعر تجهيز وتغليف الطلب'],['shipped','سعر الطلب المشحون (تم الشحن)'],['delivery','سعر الموصَّل (توصيل ناجح)'],['return','سعر المرتجع (شحنة مرتجعة)'],['codPercent','نسبة الـ COD fee (%)']]},
 {label:'أسعار التخزين',icon:'package',short:['CBM','القطعة'],fields:[['storageCbm','تكلفة التخزين بناء على CBM'],['storageItem','تكلفة التخزين بناء على القطعة']]},
 {label:'أسعار الكول سنتر',icon:'headset',short:['طلب ثابت','الليد','الكونفرم','الموصل','الاب سيل'],fields:[['callFixed','سعر ثابت لكل طلب على السيستم'],['callLead','سعر الـ Lead (لكل ليد)'],['callConfirm','سعر كل طلب كونفرم'],['callDelivered','سعر كل طلب موصَّل'],['callUpsell','سعر الـ Upsell']]}
];
const allFields=groups.flatMap(g=>g.fields);
const money=v=>Number(v||0).toFixed(2);
const fmtDate=d=>{if(!d)return '—';const [y,m,dd]=d.split('-');return `${dd}/${m}/${y}`};
const todayISO=()=>new Date().toISOString().slice(0,10);
const planStatus=p=>{const days=Math.ceil((new Date(p.expiry)-new Date(todayISO()))/86400000);return days<0?{label:'منتهية',cls:'danger'}:days<=30?{label:'تنتهي قريبًا',cls:'warning'}:{label:'سارية',cls:'success'}};
function Num({label,value,onChange}){return <label className="settings-field"><span>{label}</span><input type="number" min="0" step="0.01" value={value} onChange={e=>onChange(e.target.value)} placeholder="0.00"/></label>}
export default function PricingPlans({notify}){
 const store=useAdminStore();
 const plans=store.pricingPlans||[];
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('الكل'),[open,setOpen]=useState(false),[editId,setEditId]=useState(null),[name,setName]=useState(''),[expiry,setExpiry]=useState(''),[isDefault,setIsDefault]=useState(false),[draft,setDraft]=useState({});
 const rows=plans.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).filter(p=>filter==='الكل'||(filter==='الافتراضية'?p.default:filter==='المنتهية'?planStatus(p).label==='منتهية':filter==='تنتهي قريبًا'?planStatus(p).label==='تنتهي قريبًا':planStatus(p).label==='سارية'));
 const openNew=()=>{setEditId(null);setName('');setExpiry('');setIsDefault(plans.length===0);setDraft(Object.fromEntries(allFields.map(([k])=>[k,''])));setOpen(true)};
 const openEdit=p=>{setEditId(p.id);setName(p.name);setExpiry(p.expiry);setIsDefault(!!p.default);setDraft(Object.fromEntries(allFields.map(([k])=>[k,String(p[k]??'')])));setOpen(true)};
 const close=()=>{setOpen(false);setEditId(null)};
 const save=e=>{e.preventDefault();if(!name.trim()||!expiry){notify('أكمل اسم الخطة وتاريخ الانتهاء');return}if(plans.some(p=>p.id!==editId&&p.name.trim().toLowerCase()===name.trim().toLowerCase())){notify('يوجد خطة بنفس الاسم — اختر اسمًا آخر');return}const values=Object.fromEntries(allFields.map(([k])=>[k,Number(draft[k]||0)]));const id=editId||crypto.randomUUID();setPlans(ps=>{let next=editId?ps.map(p=>p.id===editId?{...p,...values,name:name.trim(),expiry,default:isDefault}:p):[...ps,{id,name:name.trim(),expiry,default:isDefault,...values}];if(isDefault)next=next.map(p=>({...p,default:p.id===id}));return next});notify(editId?'تم حفظ تعديلات الخطة':'تم إنشاء الخطة — الأسعار أصبحت جزءًا من القائمة');close()};
 const remove=p=>{if(p.default){notify('لا يمكن حذف الخطة الافتراضية — اختر خطة أخرى افتراضية أولًا');return}setPlans(ps=>ps.filter(x=>x.id!==p.id));notify('تم حذف الخطة من القائمة')};
 const makeDefault=p=>{if(p.default)return;setPlans(ps=>ps.map(x=>({...x,default:x.id===p.id})));notify('تم تعيين «'+p.name+'» كخطة افتراضية')};
 const defaultPlan=plans.find(p=>p.default),soon=plans.filter(p=>planStatus(p).label==='تنتهي قريبًا').length,expired=plans.filter(p=>planStatus(p).label==='منتهية').length,active=plans.length-expired;
 const metrics=[{label:'إجمالي الخطط',value:plans.length,icon:'wallet',tone:'purple',caption:defaultPlan?'الخطة الافتراضية: '+defaultPlan.name:'بدون خطة افتراضية'},{label:'الخطط السارية',value:active,icon:'circle-check',tone:'green'},{label:'تنتهي قريبًا',value:soon,icon:'calendar',tone:'amber',caption:'خلال 30 يومًا'},{label:'الخطط المنتهية',value:expired,icon:'circle-x',tone:'red'}];
 return <div className="plans-page">
  <div className="orders-intro"><div><h2>إدارة الخطط</h2><p>خطط أسعار موحّدة تجمع أسعار الشحن والتخزين والكول سنتر لكل خطة.</p></div><div className="orders-actions"><Button size="sm" onPress={openNew}><Icon name="plus"/>إضافة خطة جديدة</Button></div></div>
  <div className="crm-metric-cards plans-metric-cards"><MetricRows group="plans" items={metrics}/></div>
  <Card className="crm-panel plans-panel">
   <header><div><h2>قائمة الخطط</h2><p>الأسعار مقسومة إلى: الشحن، التخزين، والكول سنتر.</p></div><span className="orders-demo"><Icon name="wallet"/>عملة العرض: USD</span></header>
   <div className="admin-record-toolbar"><div className="settings-record-search"><input aria-label="بحث عن خطة" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن خطة…"/></div><label className="settings-field settings-status-filter plans-filter"><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="تصفية الخطط">{['الكل','الافتراضية','السارية','تنتهي قريبًا','المنتهية'].map(x=><option key={x}>{x}</option>)}</select></label></div>
   {rows.length?<div className="admin-table-wrap"><table className="analytics-table plans-table">
    <thead>
     <tr className="plans-groups"><th rowSpan={2}>الخطة</th><th rowSpan={2}>تاريخ الانتهاء</th>{groups.map(g=><th key={g.label} colSpan={g.fields.length} className="plans-group-head"><Icon name={g.icon}/>{g.label}</th>)}<th rowSpan={2}>الإجراءات</th></tr>
     <tr>{groups.flatMap((g,gi)=>g.fields.map(([k,label],i)=><th key={k} title={label}>{g.short[i]}</th>))}</tr>
    </thead>
    <tbody>{rows.map(p=>{const status=planStatus(p);return <tr key={p.id}>
     <td><div className="plan-name"><strong>{p.name}</strong><div className="plan-flags">{p.default&&<Chip size="sm" color="accent" variant="soft">الافتراضية</Chip>}<span className={'analytics-status '+status.cls}>{status.label}</span></div></div></td>
     <td><bdi>{fmtDate(p.expiry)}</bdi></td>
     {groups.flatMap(g=>g.fields.map(([k])=><td key={k} className="plan-amount"><bdi>{money(p[k])}</bdi></td>))}
     <td><div className="reason-row-actions">{!p.default&&<IconButton icon="circle-check" label={'تعيين '+p.name+' افتراضية'} onPress={()=>makeDefault(p)}/>}<IconButton icon="edit" label={'تعديل '+p.name} onPress={()=>openEdit(p)}/><IconButton icon="trash" label={'حذف '+p.name} onPress={()=>remove(p)}/></div></td>
    </tr>})}</tbody>
   </table></div>:<div className="admin-record-empty"><Icon name="wallet"/><h3>{query||filter!=='الكل'?'لا توجد خطط مطابقة':'لا توجد خطط'}</h3><p>أضف خطة جديدة لتعريف أسعار الشحن والتخزين والكول سنتر.</p></div>}
   <p className="crm-table-note">سجلات محلية للمعاينة · قيم التخزين والكول سنتر تجريبية. الخطة الافتراضية تطبق على البائعين الجدد، ونسبة الـ COD fee تُحسب من مبلغ التحصيل عند التسليم.</p>
  </Card>
  <Modal><Modal.Backdrop isOpen={open} onOpenChange={o=>{if(!o)close()}}><Modal.Container><Modal.Dialog className="analytics-detail-modal orders-dialog plans-dialog"><Modal.CloseTrigger aria-label="إغلاق النافذة"/><Modal.Heading>{editId?'تعديل الخطة: '+name:'إضافة خطة جديدة'}</Modal.Heading>
   <form className="od-action-form plans-form" onSubmit={save}>
    <div className="plans-general">
     <label className="settings-field"><span>اسم الخطة</span><input autoFocus value={name} onChange={e=>setName(e.target.value)} required placeholder="مثال: الخطة الذهبية"/></label>
     <label className="settings-field"><span>تاريخ الانتهاء</span><input type="date" required value={expiry} onChange={e=>setExpiry(e.target.value)}/></label>
     <label className="plans-default"><input type="checkbox" checked={isDefault} onChange={e=>setIsDefault(e.target.checked)}/>الخطة الافتراضية</label>
    </div>
    {groups.map(g=><div className="plans-group" key={g.label}><div className="plans-group-title"><Icon name={g.icon}/>{g.label}</div><div className="plans-grid">{g.fields.map(([k,label])=><Num key={k} label={label} value={draft[k]||''} onChange={v=>setDraft(d=>({...d,[k]:v}))}/>)}</div></div>)}
    <footer className="plans-form-actions"><p>{isDefault?'سيتم إلغاء الافتراضية عن أي خطة أخرى عند الحفظ.':'جميع الأسعار بالدولار الأمريكي (USD) داخل المعاينة.'}</p><div><Button type="button" variant="ghost" size="sm" onPress={close}>إلغاء</Button><Button type="submit" size="sm"><Icon name="circle-check"/>{editId?'حفظ التعديلات':'إنشاء الخطة'}</Button></div></footer>
   </form>
  </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>
 </div>;
}
