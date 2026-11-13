import React,{useState,useMemo,useEffect} from 'react';
import {Button,Card,Chip,Modal} from '@heroui/react';
import {Icon,IconButton} from '../ui/Icon';
import useAdminStore from '../../data/useAdminStore';
import {walletStageCards,walletMethods,walletRejectionReasons,patchWalletRequest,setWalletRequests,downloadCSV} from '../../data/adminStore';
import demoWithdrawal from '../../assets/demo-transfer-withdrawal.svg';
import demoDeposit from '../../assets/demo-transfer-deposit.svg';

const demoProof={withdrawal:demoWithdrawal,deposit:demoDeposit};
const money=v=>new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
const fmt=d=>{if(!d)return '—';const [date,time]=String(d).split('T');return time?`${date} · ${time.slice(0,5)}`:date};
export const proofSrc=r=>r?.proofData||(r?.proofDemo?demoProof[r.proofDemo]:'');
const hasProof=r=>!!proofSrc(r);
const stageTone=s=>({new:'info',review:'warning',proof:'warning',completed:'success',rejected:'danger'})[s]||'info';

const unifiedStages=[
 {key:'الكل',label:'الكل'},
 {key:'new',label:'جديد'},
 {key:'review',label:'قيد المراجعة'},
 {key:'proof',label:'صورة التحويل'},
 {key:'completed',label:'مكتمل'},
 {key:'rejected',label:'مرفوض'}
];

function StageBadge({stage,type}){
 const card=(walletStageCards[type]||walletStageCards.withdrawal).find(c=>c.key===stage);
 return <span className={'analytics-status '+stageTone(stage)}>{card?.label||stage}</span>;
}

function readImageFile(file){
 return new Promise(resolve=>{
  if(!file||!file.type.startsWith('image/'))return resolve(null);
  const reader=new FileReader();
  reader.onload=()=>{
   const data=String(reader.result);
   if(data.length<420000||file.type==='image/svg+xml')return resolve({data,name:file.name});
   const img=new Image();
   img.onload=()=>{
    const scale=Math.min(1,1000/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(img.width*scale);
    canvas.height=Math.round(img.height*scale);
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    resolve({data:canvas.toDataURL('image/jpeg',.75),name:file.name});
   };
   img.onerror=()=>resolve({data,name:file.name});
   img.src=data;
  };
  reader.onerror=()=>resolve(null);
  reader.readAsDataURL(file);
 });
}

function SimpleStepper({request,onJump}){
 const isWithdrawal=request.type==='withdrawal';
 const steps=isWithdrawal?[
  {key:'new',label:'طلب جديد من البائع'},
  {key:'review',label:'قيد المراجعة'},
  {key:'proof',label:'رفع صورة التحويل'},
  request.stage==='rejected'?{key:'rejected',label:'مرفوض'}:{key:'completed',label:'تم التحويل (مكتمل)'}
 ]:[
  {key:'new',label:'طلب جديد من الشركة'},
  {key:'review',label:'بانتظار تحويل البائع'},
  {key:'proof',label:'مراجعة صورة التحويل'},
  request.stage==='rejected'?{key:'rejected',label:'مرفوض'}:{key:'completed',label:'تم الإيداع (مكتمل)'}
 ];
 const isRejected=request.stage==='rejected';
 const currentIdx=isRejected?3:steps.findIndex(s=>s.key===request.stage);
 return <ol className="wr-simple-steps" aria-label="مراحل الطلب">
  {steps.map((step,i)=>{
   const state=isRejected&&i===3?'is-rejected':!isRejected&&i<currentIdx?'is-done':!isRejected&&i===currentIdx?'is-current':'is-pending';
   return <li key={step.key} className={'wr-sstep '+state}>
    <button type="button" disabled={!onJump||step.key==='rejected'} onClick={()=>onJump&&onJump(step.key)}>
     <span className="wr-sstep-dot">{state==='is-done'?<Icon name="circle-check"/>:state==='is-rejected'?<Icon name="circle-x"/>:i+1}</span>
     <strong>{step.label}</strong>
    </button>
   </li>;
  })}
 </ol>;
}

function RequestProcessView({request,notify,onBack,onPreviewImage}){
 const isWithdrawal=request.type==='withdrawal';
 const cards=walletStageCards[request.type];
 const [method,setMethod]=useState(request.method||walletMethods[0]);
 const [reference,setReference]=useState(request.reference||'');
 const [reason,setReason]=useState(request.reason||'');
 const [notes,setNotes]=useState(request.notes||'');
 const [rejecting,setRejecting]=useState(false);
 const [rejectCause,setRejectCause]=useState('');
 const [rejectDetail,setRejectDetail]=useState('');

 const dirty=method!==(request.method||'')||reference!==(request.reference||'')||reason!==(request.reason||'')||notes!==(request.notes||'');

 const patch=(props,title)=>{
  patchWalletRequest(request.id,{...props,_activityTitle:title});
  notify(title);
 };

 const saveEdits=e=>{
  e.preventDefault();
  if(reason.trim().length<5)return notify('سبب الطلب يجب ألا يقل عن 5 أحرف');
  patch({method,reference:reference.trim(),reason:reason.trim(),notes:notes.trim()},'تم حفظ بيانات الطلب');
 };

 const advanceStage=()=>{
  if(dirty){
   if(reason.trim().length<5)return notify('أكمل سبب الطلب أولًا (5 أحرف على الأقل)');
   patchWalletRequest(request.id,{method,reference:reference.trim(),reason:reason.trim(),notes:notes.trim(),_activityTitle:'تحديث بيانات التحويل'});
  }
  if(request.stage==='new')return patch({stage:'review'},isWithdrawal?'نقل الطلب إلى المراجعة':'إرسال طلب الإيداع للبائع');
  if(request.stage==='review')return patch({stage:'proof'},isWithdrawal?'اعتماد المراجعة — بانتظار رفع صورة التحويل':'بانتظار مراجعة صورة التحويل');
  if(!hasProof(request))return notify('يرجى إرفاق صورة التحويل أولًا قبل إقفال الطلب');
  return patch({stage:'completed'},isWithdrawal?'تم التحويل وإقفال طلب السحب':'تم الإيداع وإقفال الطلب');
 };

 const stepBack=()=>{
  const prev={review:'new',proof:'review',completed:'proof',rejected:'review'}[request.stage];
  if(!prev)return;
  const label=cards.find(c=>c.key===prev)?.label||prev;
  patch({stage:prev},`إرجاع الطلب إلى «${label}»`);
 };

 const jumpToStage=targetKey=>{
  if(targetKey===request.stage)return;
  if(targetKey==='completed'&&!hasProof(request))return notify('أرفق صورة التحويل أولًا قبل إقفال الطلب');
  const label=cards.find(c=>c.key===targetKey)?.label||targetKey;
  patch({stage:targetKey},`تغيير المرحلة إلى «${label}»`);
 };

 const submitReject=e=>{
  e.preventDefault();
  if(!rejectCause)return notify('اختر سبب الرفض');
  if(rejectDetail.trim().length<10)return notify('اكتب تفصيل السبب (10 أحرف على الأقل)');
  setRejecting(false);
  patch({stage:'rejected',rejectReason:`${rejectCause} — ${rejectDetail.trim()}`},'تم رفض الطلب مع تسجيل السبب');
 };

 const attachDemoProof=()=>{
  const demoKey=isWithdrawal?'withdrawal':'deposit';
  const demoName=isWithdrawal?'إيصال تحويل الشركة للبائع — تجريبي.svg':'إثبات إيداع البائع للشركة — تجريبي.svg';
  patch({proofDemo:demoKey,proofData:'',proofName:demoName},'تم إرفاق صورة تحويل تجريبية');
 };

 const nextLabel=request.stage==='new'
  ?(isWithdrawal?'قبول ونقل للمراجعة':'إرسال للبائع للتنفيذ')
  :request.stage==='review'
  ?(isWithdrawal?'اعتماد والانتقال لرفع التحويل':'تأكيد وصول التحويل للمراجعة')
  :(isWithdrawal?'تأكيد التحويل وإقفال الطلب':'اعتماد الإيداع وإقفال الطلب');

 const src=proofSrc(request);

 return <div className="wr-workspace">
  <div className="wr-ws-topbar">
   <div className="wr-ws-heading">
    <Button size="sm" variant="secondary" onPress={onBack}><Icon name="chevron-right"/>رجوع للقائمة</Button>
    <h2>{isWithdrawal?'طلب سحب':'طلب إيداع'} <bdi>#{request.id}</bdi></h2>
    <span className={'wr-role-pill '+(isWithdrawal?'is-seller':'is-company')}>
     {isWithdrawal?'من البائع ← إلى الشركة':'من الشركة ← إلى البائع'}
    </span>
    <StageBadge stage={request.stage} type={request.type}/>
   </div>
   <div className="wr-ws-amount-pill">
    <span>المبلغ:</span>
    <bdi dir="ltr">{money(request.amount)} <small>{request.currency}</small></bdi>
   </div>
  </div>

  <SimpleStepper request={request} onJump={jumpToStage}/>

  {request.stage==='rejected'&&<div className="wr-alert wr-alert-danger">
   <Icon name="warning"/>
   <div><strong>الطلب مرفوض:</strong> {request.rejectReason||'بدون سبب مسجل'}</div>
  </div>}

  <div className="wr-simple-grid">
   {/* البطاقة اليمنى: من مين ولمين + بيانات الطلب والسبب */}
   <Card className="wr-box">
    <header className="wr-box-head">
     <h3><Icon name="person"/>بيانات صاحب الطلب والتحويل</h3>
     <span>تاريخ الطلب: <bdi>{fmt(request.createdAt)}</bdi></span>
    </header>

    <div className="wr-from-to">
     <div>
      <small>مقدم الطلب (من مين)</small>
      <strong>{isWithdrawal?`البائع: ${request.sellerName}`:'الشركة (إدارة هلا كوميرس)'}</strong>
     </div>
     <Icon name="chevron-left"/>
     <div>
      <small>الجهة المستهدفة (إلى مين)</small>
      <strong>{isWithdrawal?'الشركة (إدارة هلا كوميرس)':`البائع: ${request.sellerName}`}</strong>
     </div>
    </div>

    <dl className="wr-mini-facts">
     <div><dt>اسم البائع وكوده</dt><dd>{request.sellerName} (<bdi>{request.sellerCode}</bdi>)</dd></div>
     <div><dt>رقم الهاتف</dt><dd><bdi dir="ltr">{request.phone||'غير مسجل'}</bdi></dd></div>
     <div><dt>الدولة والخطة</dt><dd>{(request.country||'—')+' · '+(request.plan||'—')}</dd></div>
    </dl>

    <form className="wr-compact-form" onSubmit={saveEdits}>
     <div className="wr-form-grid-2">
      <label className="settings-field">
       <span>طريقة التحويل</span>
       <select value={method} onChange={e=>setMethod(e.target.value)}>
        {walletMethods.map(m=><option key={m} value={m}>{m}</option>)}
       </select>
      </label>
      <label className="settings-field">
       <span>رقم مرجع التحويل</span>
       <input dir="ltr" value={reference} onChange={e=>setReference(e.target.value)} placeholder="TRX-889231"/>
      </label>
     </div>
     <label className="settings-field">
      <span>سبب الطلب *</span>
      <input required value={reason} onChange={e=>setReason(e.target.value)} placeholder="سبب طلب السحب أو الإيداع…"/>
     </label>
     <label className="settings-field">
      <span>ملاحظات المراجعة</span>
      <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="أي ملاحظات إضافية…"/>
     </label>
     {dirty&&<div className="wr-save-row">
      <Button type="submit" size="sm"><Icon name="circle-check"/>حفظ التعديلات</Button>
     </div>}
    </form>

    <div className="wr-mini-log">
     <h4>سجل الحركات ({(request.activity||[]).length})</h4>
     <ul>
      {(request.activity||[]).slice(0,4).map(item=><li key={item.id}>
       <span>{item.title}</span>
       <small>{item.user} · <bdi>{item.at}</bdi></small>
      </li>)}
     </ul>
    </div>
   </Card>

   {/* البطاقة اليسرى: صورة التحويل + قرار المرحلة */}
   <Card className="wr-box">
    <header className="wr-box-head">
     <h3><Icon name="maximize"/>صورة التحويل وقرار المرحلة</h3>
     <span className={hasProof(request)?'wr-ok-text':'wr-warn-text'}>
      {hasProof(request)?'الصورة مرفقة ✓':'بدون صورة تحويل'}
     </span>
    </header>

    <div className="wr-proof-section">
     <input id={'ws-proof-'+request.id} type="file" accept="image/*" hidden onChange={async e=>{
      const shot=await readImageFile(e.target.files?.[0]);
      e.target.value='';
      if(!shot)return notify('اختر ملف صورة صالح');
      patch({proofData:shot.data,proofName:shot.name,proofDemo:''},'تم إرفاق صورة التحويل');
     }}/>
     {src?(
      <div className="wr-proof-card">
       <img src={src} alt="صورة التحويل" onClick={()=>onPreviewImage(request)}/>
       <div className="wr-proof-bar">
        <Button size="sm" variant="secondary" onPress={()=>onPreviewImage(request)}><Icon name="eye"/>تكبير</Button>
        <label htmlFor={'ws-proof-'+request.id} className="wr-upload-btn"><Icon name="edit"/>تغيير الصورة</label>
        <IconButton icon="trash" label="حذف الصورة" onPress={()=>patch({proofData:'',proofName:'',proofDemo:''},'تم حذف صورة التحويل')}/>
       </div>
      </div>
     ):(
      <div className="wr-proof-missing">
       <label htmlFor={'ws-proof-'+request.id} className="wr-proof-dropzone">
        <Icon name="maximize"/>
        <strong>اضغط لرفع صورة التحويل / الإيصال</strong>
        <small>{isWithdrawal?'إيصال تحويل الشركة للبائع':'إيصال تحويل البائع للشركة'}</small>
       </label>
       <Button size="sm" variant="secondary" onPress={attachDemoProof}><Icon name="plus"/>إرفاق نموذج إيصال تجريبي</Button>
      </div>
     )}
    </div>

    <div className="wr-decision-box">
     {request.stage!=='completed'&&request.stage!=='rejected'?(
      <>
       <Button className="wr-primary-action" onPress={advanceStage}>
        {nextLabel}<Icon name="chevron-left"/>
       </Button>
       <div className="wr-secondary-actions">
        {request.stage!=='new'&&<Button size="sm" variant="secondary" onPress={stepBack}><Icon name="chevron-right"/>المرحلة السابقة</Button>}
        {!rejecting&&<Button size="sm" variant="ghost" className="wr-danger-btn" onPress={()=>setRejecting(true)}><Icon name="circle-x"/>رفض الطلب</Button>}
       </div>
      </>
     ):(
      <div className="wr-closed-bar">
       <span>{request.stage==='completed'?'تم إقفال الطلب كمكتمل ✓':'الطلب مرفوض'}</span>
       <Button size="sm" variant="secondary" onPress={stepBack}><Icon name="reset"/>إعادة فتح للمراجعة</Button>
      </div>
     )}

     {rejecting&&<form className="wr-reject-box" onSubmit={submitReject}>
      <label className="settings-field">
       <span>سبب الرفض *</span>
       <select required value={rejectCause} onChange={e=>setRejectCause(e.target.value)}>
        <option value="">اختر السبب…</option>
        {walletRejectionReasons.map(r=><option key={r} value={r}>{r}</option>)}
       </select>
      </label>
      <label className="settings-field">
       <span>تفاصيل الرفض (10 أحرف على الأقل) *</span>
       <textarea required value={rejectDetail} onChange={e=>setRejectDetail(e.target.value)} placeholder="وضح سبب الرفض…"/>
      </label>
      <div className="wr-reject-btns">
       <Button type="button" size="sm" variant="ghost" onPress={()=>setRejecting(false)}>إلغاء</Button>
       <Button type="submit" size="sm" className="wr-danger-solid">تأكيد الرفض</Button>
      </div>
     </form>}
    </div>
   </Card>
  </div>
 </div>;
}

function NewRequestModal({open,setOpen,initialType,notify,store,onCreated}){
 const sellers=store.sellers||[];
 const [type,setType]=useState(initialType||'withdrawal');
 const [sellerId,setSellerId]=useState(''),[amount,setAmount]=useState(''),[currency,setCurrency]=useState('SAR'),[method,setMethod]=useState(walletMethods[0]),[reference,setReference]=useState(''),[reason,setReason]=useState(''),[notes,setNotes]=useState(''),[proof,setProof]=useState(null);

 useEffect(()=>{if(initialType)setType(initialType)},[initialType]);
 const isWithdrawal=type==='withdrawal';
 const seller=sellers.find(s=>s.id===sellerId);
 const reset=()=>{setSellerId('');setAmount('');setCurrency('SAR');setMethod(walletMethods[0]);setReference('');setReason('');setNotes('');setProof(null)};
 const close=()=>{reset();setOpen(false)};

 const save=e=>{
  e.preventDefault();
  if(!seller)return notify('اختر البائع المرتبط بالطلب');
  const value=Number(amount);
  if(!(value>0))return notify('أدخل مبلغًا أكبر من صفر');
  if(reason.trim().length<5)return notify('اكتب سبب الطلب (5 أحرف على الأقل)');
  const now=new Date();
  const inTz=new Date(now.getTime()-now.getTimezoneOffset()*60000);
  const stamp=`${String(inTz.getDate()).padStart(2,'0')}/${String(inTz.getMonth()+1).padStart(2,'0')} ${String(inTz.getHours()).padStart(2,'0')}:${String(inTz.getMinutes()).padStart(2,'0')}`;
  const card=walletStageCards[type][0];
  let createdId='';
  setWalletRequests(rs=>{
   const existing=(rs||[]).filter(x=>x.type===type);
   const base=existing.reduce((m,x)=>{const n=parseInt(String(x.id).replace(/\D/g,''),10);return isFinite(n)?Math.max(m,n):m},isWithdrawal?1000:2000);
   createdId=(isWithdrawal?'WD-':'DP-')+(base+1);
   return [{
    id:createdId,type,sellerId:seller.id,sellerName:seller.name,sellerCode:seller.code||'—',
    phone:seller.phone||'+966 50 000 0000',plan:seller.plan||'Basic Plan',country:seller.country||'السعودية',
    amount:value,currency,method,reference:reference.trim(),stage:card.key,
    proofData:proof?.data||'',proofName:proof?.name||'',proofDemo:'',
    reason:reason.trim(),notes:notes.trim(),rejectReason:'',createdAt:stamp,
    activity:[{id:crypto.randomUUID(),title:card.label,user:isWithdrawal?'البائع '+seller.name:'مدير النظام (الشركة)',at:stamp}]
   },...(rs||[])];
  });
  notify('تم إنشاء الطلب '+createdId+' بنجاح');
  close();
  if(onCreated&&createdId)onCreated(createdId);
 };

 return <Modal><Modal.Backdrop isOpen={open} onOpenChange={o=>{if(!o)close()}}><Modal.Container><Modal.Dialog className="crm-dialog wr-dialog">
  <Modal.CloseTrigger aria-label="إغلاق النافذة"/>
  <Modal.Heading>إضافة طلب سحب أو إيداع جديد</Modal.Heading>
  <form className="wr-new-form" onSubmit={save}>
   <div className="wr-type-Segment" role="radiogroup" aria-label="نوع الطلب">
    <button type="button" className={isWithdrawal?'is-active':''} onClick={()=>setType('withdrawal')}>
     <strong>طلب سحب</strong>
     <small>من البائع (السيلر) ← إلى الشركة</small>
    </button>
    <button type="button" className={!isWithdrawal?'is-active':''} onClick={()=>setType('deposit')}>
     <strong>طلب إيداع</strong>
     <small>من الشركة ← إلى البائع (السيلر)</small>
    </button>
   </div>

   <div className="wr-form-grid-2">
    <label className="settings-field">
     <span>{isWithdrawal?'البائع مقدم الطلب *':'البائع المطلوب منه الإيداع *'}</span>
     <select autoFocus required value={sellerId} onChange={e=>setSellerId(e.target.value)}>
      <option value="">اختر البائع…</option>
      {sellers.map(s=><option key={s.id} value={s.id}>{s.name} ({s.code||'—'})</option>)}
     </select>
    </label>
    <label className="settings-field">
     <span>طريقة التحويل *</span>
     <select value={method} onChange={e=>setMethod(e.target.value)}>
      {walletMethods.map(x=><option key={x} value={x}>{x}</option>)}
     </select>
    </label>
   </div>

   <div className="wr-form-grid-3">
    <label className="settings-field">
     <span>المبلغ *</span>
     <input type="number" min="1" step="0.01" inputMode="decimal" dir="ltr" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/>
    </label>
    <label className="settings-field">
     <span>العملة</span>
     <select value={currency} onChange={e=>setCurrency(e.target.value)}>
      {['SAR','USD','AED','KWD','OMR'].map(x=><option key={x} value={x}>{x}</option>)}
     </select>
    </label>
    <label className="settings-field">
     <span>رقم مرجع التحويل</span>
     <input dir="ltr" value={reference} onChange={e=>setReference(e.target.value)} placeholder="TRX-889231"/>
    </label>
   </div>

   <label className="settings-field">
    <span>سبب الطلب (إلزامي) *</span>
    <input required value={reason} onChange={e=>setReason(e.target.value)} placeholder={isWithdrawal?'مثال: سحب صافي أرباح الشحنات المسلمة…':'مثال: تغطية رصيد الشحن المتراكم…'}/>
   </label>

   <div className="wr-new-proof">
    <input id="wr-new-proof-file" type="file" accept="image/*" hidden onChange={async e=>{
     const shot=await readImageFile(e.target.files?.[0]);
     e.target.value='';
     if(!shot)return notify('اختر ملف صورة صالح');
     setProof(shot);
    }}/>
    {proof?(
     <div className="wr-new-proof-box">
      <img src={proof.data} alt={proof.name}/>
      <div><strong>{proof.name}</strong><small>جاهزة للإرفاق مع الطلب</small></div>
      <Button type="button" size="sm" variant="ghost" className="wr-danger-btn" onPress={()=>setProof(null)}><Icon name="trash"/>حذف</Button>
     </div>
    ):(
     <label htmlFor="wr-new-proof-file" className="wr-proof-dropzone compact">
      <Icon name="maximize"/>
      <div>
       <strong>إرفاق صورة التحويل (اختياري الآن)</strong>
       <small>يمكنك رفعها الآن أو أثناء مراجعة الطلب</small>
      </div>
     </label>
    )}
   </div>

   <footer className="wr-modal-footer">
    <span>{isWithdrawal?'صاحب الطلب: البائع ← المستلم: الشركة':'صاحب الطلب: الشركة ← المستهدف: البائع'}</span>
    <div>
     <Button type="button" size="sm" variant="ghost" onPress={close}>إلغاء</Button>
     <Button type="submit" size="sm"><Icon name="circle-check"/>حفظ وإنشاء الطلب</Button>
    </div>
   </footer>
  </form>
 </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>;
}

export default function WalletRequests({kind,notify}){
 const store=useAdminStore();
 const sellers=store.sellers||[];
 const allRequests=store.walletRequests||[];

 const initialTab=kind==='طلبات السحب'?'withdrawal':kind==='طلبات الإيداع'?'deposit':'all';
 const [typeFilter,setTypeFilter]=useState(initialTab);
 useEffect(()=>{
  if(kind==='طلبات السحب')setTypeFilter('withdrawal');
  else if(kind==='طلبات الإيداع')setTypeFilter('deposit');
  else setTypeFilter('all');
 },[kind]);

 const [stageFilter,setStageFilter]=useState('الكل');
 const [sellerFilter,setSellerFilter]=useState('');
 const [query,setQuery]=useState('');
 const [newModalType,setNewModalType]=useState(null);
 const [activeId,setActiveId]=useState(null);
 const [previewReq,setPreviewReq]=useState(null);

 const scopedByType=useMemo(()=>allRequests.filter(r=>typeFilter==='all'||r.type===typeFilter),[allRequests,typeFilter]);

 const rows=useMemo(()=>scopedByType.filter(r=>{
  if(stageFilter!=='الكل'&&r.stage!==stageFilter)return false;
  if(sellerFilter&&r.sellerId!==sellerFilter)return false;
  if(!query.trim())return true;
  const q=query.trim().toLowerCase();
  return [r.id,r.sellerName,r.sellerCode,r.phone,r.reference,r.method,r.reason,r.rejectReason,r.amount,r.currency].join(' ').toLowerCase().includes(q);
 }),[scopedByType,stageFilter,sellerFilter,query]);

 const activeRequest=allRequests.find(r=>r.id===activeId)||null;

 const withdrawalsCount=allRequests.filter(r=>r.type==='withdrawal').length;
 const depositsCount=allRequests.filter(r=>r.type==='deposit').length;
 const pendingCount=allRequests.filter(r=>!['completed','rejected'].includes(r.stage)).length;

 const metrics=[
  {label:'الكل',value:allRequests.length},
  {label:'سحب',value:withdrawalsCount},
  {label:'إيداع',value:depositsCount},
  {label:'قيد التنفيذ',value:pendingCount}
 ];

 const exportData=()=>{
  const headers=['رقم الطلب','النوع','من (مقدم الطلب)','إلى (المستلم)','اسم البائع','كود البائع','المبلغ','العملة','الطريقة','المرجع','السبب','صورة التحويل','الحالة','التاريخ'];
  const csvRows=rows.map(r=>{
   const isW=r.type==='withdrawal';
   const card=(walletStageCards[r.type]||[]).find(c=>c.key===r.stage);
   return [r.id,isW?'سحب':'إيداع',isW?r.sellerName:'الشركة',isW?'الشركة':r.sellerName,r.sellerName,r.sellerCode,r.amount,r.currency,r.method,r.reference||'—',r.reason||'—',hasProof(r)?'مرفقة':'غير مرفقة',card?.label||r.stage,r.createdAt];
  });
  downloadCSV(headers,csvRows,'hala-wallet-requests.csv');
  notify(`تم تصدير ${rows.length} طلب بصيغة CSV`);
 };

 const imageModal=<Modal><Modal.Backdrop isOpen={!!previewReq} onOpenChange={o=>{if(!o)setPreviewReq(null)}}><Modal.Container><Modal.Dialog className="crm-dialog wr-dialog wr-image-dialog">
  <Modal.CloseTrigger aria-label="إغلاق معاينة الصورة"/>
  <Modal.Heading>{previewReq?`صورة التحويل · طلب ${previewReq.id}`:'صورة التحويل'}</Modal.Heading>
  {previewReq&&<div className="wr-lightbox">
   <p className="wr-lightbox-meta">
    <span><strong>النوع:</strong> {previewReq.type==='withdrawal'?'سحب (من البائع للشركة)':'إيداع (من الشركة للبائع)'}</span>
    <span><strong>البائع:</strong> {previewReq.sellerName} ({previewReq.sellerCode})</span>
    <span><strong>المبلغ:</strong> <bdi dir="ltr">{money(previewReq.amount)} {previewReq.currency}</bdi></span>
   </p>
   {hasProof(previewReq)?(
    <figure className="wr-lightbox-figure">
     <img src={proofSrc(previewReq)} alt={'صورة التحويل لطلب '+previewReq.id}/>
     {!previewReq.proofData&&<figcaption>نموذج إيصال تجريبي للمعاينة</figcaption>}
    </figure>
   ):<p className="wr-empty-note">لا توجد صورة مرفقة بعد.</p>}
   <div className="wr-lightbox-actions">
    <Button size="sm" variant="secondary" onPress={()=>setPreviewReq(null)}>إغلاق</Button>
    <Button size="sm" onPress={()=>{const id=previewReq.id;setPreviewReq(null);setActiveId(id);}}>فتح الطلب</Button>
   </div>
  </div>}
 </Modal.Dialog></Modal.Container></Modal.Backdrop></Modal>;

 if(activeRequest){
  return <div className="crm-page wr-page">
   <RequestProcessView
    key={activeRequest.id}
    request={activeRequest}
    notify={notify}
    onBack={()=>setActiveId(null)}
    onPreviewImage={req=>setPreviewReq(req)}
   />
   {imageModal}
  </div>;
 }

 return <div className="crm-page wr-page">
  <div className="orders-intro">
   <div>
    <h2>إدارة طلبات السحب والإيداع</h2>
    <p>صفحة موحدة وبسيطة — طلب السحب يكون من البائع إلى الشركة، وطلب الإيداع يكون من الشركة إلى البائع، مع مراحل وصورة التحويل لكل طلب.</p>
   </div>
   <div className="orders-actions">
    <Button size="sm" variant="secondary" onPress={()=>setNewModalType('deposit')}><Icon name="plus"/>طلب إيداع (شركة ← بائع)</Button>
    <Button size="sm" onPress={()=>setNewModalType('withdrawal')}><Icon name="plus"/>طلب سحب (بائع ← شركة)</Button>
   </div>
  </div>

  <div className="wr-header-stats">{metrics.map(m=><div key={m.label}><bdi>{m.value}</bdi><span>{m.label}</span></div>)}</div>

  <Card className="crm-panel wr-panel">
   {/* شريط التبويبات السريع: الكل / السحب / الإيداع + فلاتر المراحل */}
   <div className="wr-tabs-bar">
    <div className="wr-type-tabs" role="tablist" aria-label="نوع الطلبات">
     {[
      ['all',`الكل (${allRequests.length})`],
      ['withdrawal',`طلبات السحب · بائع ← شركة (${withdrawalsCount})`],
      ['deposit',`طلبات الإيداع · شركة ← بائع (${depositsCount})`]
     ].map(([key,label])=>(
      <button key={key} type="button" role="tab" aria-selected={typeFilter===key} className={'wr-type-tab'+(typeFilter===key?' is-active':'')} onClick={()=>setTypeFilter(key)}>
       {label}
      </button>
     ))}
    </div>

    <div className="wr-stage-pills" role="group" aria-label="تصفية حسب المرحلة">
     {unifiedStages.map(s=>{
      const cnt=s.key==='الكل'?scopedByType.length:scopedByType.filter(r=>r.stage===s.key).length;
      const active=stageFilter===s.key;
      return <button key={s.key} type="button" className={'wr-stage-pill'+(active?' is-active':'')} onClick={()=>setStageFilter(active&&s.key!=='الكل'?'الكل':s.key)}>
       <span>{s.label}</span>
       <bdi>{cnt}</bdi>
      </button>;
     })}
    </div>
   </div>

   {/* شريط البحث والفلترة */}
   <div className="wr-toolbar">
    <div className="wr-search">
     <Icon name="search"/>
     <input
      aria-label="بحث في طلبات السحب والإيداع"
      value={query}
      onChange={e=>setQuery(e.target.value)}
      placeholder="ابحث برقم الطلب، اسم البائع، الكود، مرجع التحويل، أو السبب…"
     />
    </div>
    <select aria-label="تصفية حسب البائع" className="wr-select" value={sellerFilter} onChange={e=>setSellerFilter(e.target.value)}>
     <option value="">كل البائعين</option>
     {sellers.map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
    </select>
    <Button size="sm" variant="secondary" onPress={exportData} isDisabled={!rows.length}><Icon name="download"/>تصدير CSV</Button>
   </div>

   {rows.length?(
    <div className="analytics-table-scroll">
     <table className="analytics-table wr-table">
      <thead>
       <tr>
        <th>رقم الطلب</th>
        <th>النوع</th>
        <th>البائع</th>
        <th>المبلغ</th>
        <th>الحالة</th>
        <th>إجراء</th>
       </tr>
      </thead>
      <tbody>
       {rows.map(r=>{
        const isW=r.type==='withdrawal';
        return <tr key={r.id} className="wr-clickable-row" onClick={()=>setActiveId(r.id)}>
         <td>
          <button type="button" className="wr-id-link" onClick={()=>setActiveId(r.id)}><bdi>{r.id}</bdi></button>
          <small className="wr-sub"><bdi>{fmt(r.createdAt)}</bdi></small>
         </td>
         <td>
          <span className={'wr-role-pill '+(isW?'is-seller':'is-company')}>
           {isW?'سحب · بائع ← شركة':'إيداع · شركة ← بائع'}
          </span>
         </td>
         <td>
          <strong>{r.sellerName} <span className="wr-code-tag"><bdi>{r.sellerCode}</bdi></span></strong>
         </td>
         <td>
          <bdi dir="ltr" className="wr-amount">{money(r.amount)} <small>{r.currency}</small></bdi>
          <small className="wr-sub">{r.method}</small>
         </td>
         <td>
          <StageBadge stage={r.stage} type={r.type}/>
          {hasProof(r)&&<small className="wr-sub">صورة مرفقة</small>}
         </td>
         <td>
          <div className="wr-row-actions">
           <Button size="sm" variant="secondary" onPress={()=>setActiveId(r.id)}>فتح</Button>
          </div>
         </td>
        </tr>;
       })}
      </tbody>
     </table>
    </div>
   ):(
    <div className="admin-record-empty">
     <Icon name="wallet"/>
     <h3>لا توجد طلبات مطابقة</h3>
     <p>جرّب تغيير الفلتر أو أضف طلب سحب أو إيداع جديد.</p>
    </div>
   )}

   <footer className="wr-table-footer">
    <span>عرض {rows.length} من أصل {allRequests.length} طلب (سحب وإيداع)</span>
    <span>سجلات محلية للمعاينة</span>
   </footer>
  </Card>

  <NewRequestModal
   open={!!newModalType}
   setOpen={o=>{if(!o)setNewModalType(null)}}
   initialType={newModalType||'withdrawal'}
   notify={notify}
   store={store}
   onCreated={id=>setActiveId(id)}
  />
  {imageModal}
 </div>;
}
