import React,{useEffect,useState} from 'react';
import {Button,Modal} from '@heroui/react';
import {Icon} from '../ui/Icon';
import {
 applyValidationAction,validationCallResults,validationCallOutcomes,validationCarrierOptions,
 validationFinalActions,validationDecisionSources,validationDecisionClassifications,canCancelValidationShipment,validationDeliveryIntentTitle,
} from '../../data/adminStore';

const emptyForm={result:'',outcome:'',note:'',nextAction:'followup',carrierAction:'',carrierDetails:'',decisionNote:'',approvedByManagement:false,finalAction:'',source:'',classification:''};

function SelectField({label,value,options,onChange,placeholder='اختر',required=false}){
 return <label className="settings-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)} required={required}>
  <option value="">{placeholder}</option>
  {options.map(option=>{const [key,text]=Array.isArray(option)?option:[option,option];return <option value={key} key={key}>{text}</option>})}
 </select></label>;
}

export default function ValidationAttemptModal({validation,mode,onClose,notify}){
 const [form,setForm]=useState(emptyForm),[error,setError]=useState('');
 const callMode=mode==='call',cancelMode=mode==='cancel',carrierOptions=validationCarrierOptions(validation.status);
 const heading=callMode?'تسجيل اتصال وإجراء':cancelMode?'إلغاء الشحن':validationDeliveryIntentTitle;
 useEffect(()=>{
  if(!mode)return;
  setForm(emptyForm);
  setError('');
 },[mode,validation.id,validation.status]);
 const change=patch=>{setForm(current=>({...current,...patch}));setError('')};
 const {result,outcome,note,nextAction,carrierAction,carrierDetails,decisionNote,approvedByManagement,finalAction,source,classification}=form;
 const missed=result&&result!=='تم الرد',five=validation.attempts.length+1>=5;
 const canReceive=outcome==='العميل استلم فعلًا',canCancel=canCancelValidationShipment(validation.attempts,{result,outcome});
 const cancelEligible=canCancelValidationShipment(validation.attempts);
 const decisions=[['followup','متابعة التحقق'],...(canReceive?[['received','تأكيد استلام العميل وإغلاق الحالة']]:[]),...(canCancel?[['cancel','إلغاء الشحن بقرار الإدارة']]:[]),['final','قرار نهائي آخر']];
 const submit=e=>{
  e.preventDefault();
  const failure=applyValidationAction(validation.id,{
   nextAction:callMode?nextAction:mode,decisionNote,approvedByManagement,
   ...(callMode?{call:{result,outcome,note},finalAction,source,classification}:{}),
   ...(callMode&&carrierAction?{carrier:{action:carrierAction,details:carrierDetails}}:{}),
  });
  if(failure){setError(failure);return}
  notify(cancelMode?'تم إلغاء الشحن':!callMode?'تم تسجيل رغبة العميل في الاستلام':nextAction==='cancel'?'تم تسجيل الاتصال وإلغاء الشحن':carrierAction?'تم تسجيل الاتصال وإجراء الشركة':'تم تسجيل الاتصال والقرار');
  onClose();
 };
 return <Modal><Modal.Backdrop isOpen={Boolean(mode)} onOpenChange={value=>{if(!value)onClose()}}>
  <Modal.Container><Modal.Dialog className="analytics-detail-modal orders-dialog vd-attempt-dialog">
   <Modal.CloseTrigger aria-label="إغلاق نموذج التحقق"/>
   <Modal.Heading>{heading}</Modal.Heading>
   <p className="analytics-detail-intro"><bdi>{validation.orderId}</bdi> · {callMode?'المحاولة '+(validation.attempts.length+1):validation.status}</p>
   <form className="od-action-form" onSubmit={submit}>
    {callMode&&<>
     <div className="vd-form-grid">
      <SelectField label="حالة الاتصال" value={result} options={validationCallResults} required onChange={value=>change({result:value,outcome:'',nextAction:'followup',approvedByManagement:false})}/>
      <SelectField label="نتيجة التواصل" value={outcome} options={result?validationCallOutcomes(result):[]} required onChange={value=>{
       const next=value==='العميل استلم فعلًا'?'received':'followup';
       change({outcome:value,nextAction:next,approvedByManagement:false,...(next==='received'?{carrierAction:'',carrierDetails:''}:{})});
      }}/>
     </div>
     <label className="settings-field"><span>ملاحظة المكالمة (اختيارية)</span><textarea value={note} onChange={e=>change({note:e.target.value})} maxLength={1000}/></label>
     {missed&&five&&<p className="vd-five-warning">وصلت الحالة إلى خمس محاولات على الأقل. الإلغاء لعدم الرد يحتاج قرار الإدارة.</p>}
     <SelectField label="القرار بعد الاتصال" value={nextAction} options={decisions} required onChange={value=>change({nextAction:value,approvedByManagement:false,...(value!=='followup'?{carrierAction:'',carrierDetails:''}:{})})}/>
     {nextAction==='final'&&<div className="vd-form-grid">
      <SelectField label="الإجراء النهائي" value={finalAction} options={validationFinalActions} required onChange={value=>change({finalAction:value})}/>
      <SelectField label="المصدر" value={source} options={validationDecisionSources} required onChange={value=>change({source:value})}/>
      <SelectField label="التصنيف" value={classification} options={validationDecisionClassifications} required onChange={value=>change({classification:value})}/>
     </div>}
    </>}
    {cancelMode&&<p className="od-muted">سيتم إلغاء الشحنة وإغلاق حالة الفالديشن. تظل حالة الطلب كما هي.</p>}
    {cancelMode&&!cancelEligible&&<p className="vd-five-warning">سجّل طلب الإلغاء من العميل، أو أكمل خمس محاولات على الأقل في حال عدم الرد.</p>}
     {(cancelMode||nextAction==='cancel')&&<>
      <label className="settings-field"><span>سبب الإلغاء (20 حرفًا على الأقل)</span><textarea required minLength={20} maxLength={1000} value={decisionNote} onChange={e=>change({decisionNote:e.target.value})}/></label>
      <label className="vd-approval"><input type="checkbox" required checked={approvedByManagement} onChange={e=>change({approvedByManagement:e.target.checked})}/> أؤكد أن الإدارة اتخذت قرار الإلغاء</label>
     </>}
    {mode==='wants-delivery'&&<>
     <p className="od-muted">سجّل أن العميل يرغب في استلام الشحنة. تظل حالة الشحنة كما هي.</p>
     <label className="settings-field"><span>ملاحظة (اختيارية)</span><textarea value={decisionNote} onChange={e=>change({decisionNote:e.target.value})} maxLength={1000}/></label>
    </>}
    {callMode&&nextAction==='followup'&&carrierOptions.length>0&&<>
     <SelectField label="إجراء شركة الشحن (اختياري)" value={carrierAction} options={carrierOptions} placeholder="بدون إجراء للشركة" onChange={value=>change({carrierAction:value,carrierDetails:''})}/>
     {carrierAction&&<label className="settings-field"><span>تفاصيل إجراء الشركة</span><textarea required maxLength={1000} value={carrierDetails} onChange={e=>change({carrierDetails:e.target.value})} placeholder="اكتب الإجراء المتخذ أو رد شركة الشحن…"/></label>}
     {carrierAction==='resolved'&&<p className="od-muted">حفظ اكتمال المعالجة يغلق حالة الفالديشن.</p>}
    </>}
    {error&&<p className="orders-error" role="alert">{error}</p>}
    <p className="od-muted">الحفظ داخل المعاينة. لا يُجرى اتصال ولا تُرسل رسالة للشركة.</p>
    <footer className="vd-dialog-footer"><Button type="button" size="sm" variant="secondary" onPress={onClose}>رجوع</Button><Button type="submit" size="sm" isDisabled={cancelMode&&!cancelEligible} className={cancelMode?'vd-shipment-cancel':callMode?undefined:'vd-shipment-accept'}><Icon name={cancelMode?'circle-x':callMode?'headset':'circle-check'}/>{cancelMode?'تأكيد إلغاء الشحن':!callMode?'حفظ رغبة العميل':carrierAction?'حفظ الاتصال وإجراء الشركة':'حفظ الاتصال'}</Button></footer>
   </form>
  </Modal.Dialog></Modal.Container>
 </Modal.Backdrop></Modal>;
}
