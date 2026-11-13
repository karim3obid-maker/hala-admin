import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,recordValidationAction,addValidationConfirmationReport,validationStatuses,validationReportReasons} from '../src/data/adminStore.js';

const [waiting,active,sent,working,closed]=validationStatuses;
const missed={result:'لم يرد',outcome:'لم نتمكن من الوصول للعميل'};
const cancellation='اعتمدت الإدارة إلغاء الشحنة بعد مراجعة سجل التواصل مع العميل.';
const at='2026-11-12T18:50:00.000Z';

function fixture(status=waiting,count=0){
 const state=createInitialState(),original=state.validations[0];
 const validation={...original,status,attempts:Array.from({length:count},(_,i)=>({...missed,id:'old-'+i,at})),history:[],carrierUpdates:[]};
 return {state:{...state,validations:[validation]},validation,id:validation.id};
}
function save(state,id,payload){
 const result=recordValidationAction(state,id,{...payload,at});
 assert.equal(result.error,undefined);
 return result.state;
}
test('a combined submission saves exactly one call and one carrier action; carrier-only saves no call',()=>{
 const {state,validation,id}=fixture();
 const combined=save(state,id,{call:{...missed,note:'تفاصيل المكالمة'},carrier:{action:'send',details:'أُحيلت الشحنة للشركة'}});
 const v=combined.validations[0];
 assert.equal(v.status,sent);
 assert.equal(v.attempts.length,1);
 assert.equal(v.attempts[0].note,'تفاصيل المكالمة');
 assert.equal(v.carrierUpdates.length,1);
 assert.equal(v.carrierUpdates[0].note,'أُحيلت الشحنة للشركة');
 assert.ok(v.carrierUpdates[0].actor);
 assert.equal(v.carrierUpdates[0].at,at);
 const afterFollowup=save(combined,id,{call:missed});
 assert.equal(afterFollowup.validations[0].status,sent);
 const afterCarrier=save(afterFollowup,id,{carrier:{action:'working',details:'بدأت الشركة المراجعة'}});
 assert.equal(afterCarrier.validations[0].status,working);
 assert.equal(afterCarrier.validations[0].attempts.length,2);
 const resolved=save(afterCarrier,id,{carrier:{action:'resolved',details:'أكدت الشركة اكتمال المعالجة'}});
 assert.equal(resolved.validations[0].status,closed);
 assert.equal(resolved.validations[0].attempts.length,2);
 assert.deepEqual(resolved.validations[0].carrierUpdate,validation.carrierUpdate);
});
test('missing action details or incompatible outcomes reject the entire submission',()=>{
 const {state,id}=fixture();
 for(const payload of [
  {call:missed,carrier:{action:'send',details:'  '}},
  {call:missed,carrier:{action:'working',details:'بدأ العمل'}},
  {call:{...missed,outcome:'العميل استلم فعلًا'}},
 ]){
  const result=recordValidationAction(state,id,payload);
  assert.ok(result.error);
  assert.equal(result.state,state);
 }
 assert.equal(save(state,id,{call:missed}).validations[0].status,active);
});
test('no-answer cancellation requires five attempts, management decision and a detailed reason',()=>{
 const four=fixture(active,3),five=fixture(active,4);
 const input={call:missed,nextAction:'cancel',approvedByManagement:true,decisionNote:cancellation};
 assert.ok(recordValidationAction(four.state,four.id,input).error);
 assert.ok(recordValidationAction(five.state,five.id,{...input,approvedByManagement:false}).error);
 assert.ok(recordValidationAction(five.state,five.id,{...input,decisionNote:'قصير'}).error);
 const next=save(five.state,five.id,input);
 assert.equal(next.validations[0].status,closed);
 assert.equal(next.validations[0].attempts.length,5);
 assert.equal(next.orders.find(o=>o.id===five.validation.orderId).status,five.state.orders.find(o=>o.id===five.validation.orderId).status);
 assert.equal(next.shipments.find(s=>s.id===five.validation.shipmentId).status,'ملغية');
 assert.ok(recordValidationAction(next,five.id,{call:missed}).error);
 assert.ok(recordValidationAction(next,five.id,{carrier:{action:'send',details:'إحالة'}}).error);
});
test('the standalone shipment cancellation uses existing calls and only cancels the shipment',()=>{
 const four=fixture(active,4),five=fixture(working,5);
 const input={nextAction:'cancel',approvedByManagement:true,decisionNote:cancellation};
 assert.equal(recordValidationAction(four.state,four.id,input).state,four.state);
 assert.equal(recordValidationAction(five.state,five.id,{...input,approvedByManagement:false}).state,five.state);
 assert.equal(recordValidationAction(five.state,five.id,{...input,decisionNote:'   '}).state,five.state);
 const next=save(five.state,five.id,input),v=next.validations[0];
 const shipment=next.shipments.find(s=>s.id===v.shipmentId);
 const {activity,...order}=next.orders.find(o=>o.id===v.orderId);
 const {activity:oldActivity,...oldOrder}=five.state.orders.find(o=>o.id===v.orderId);
 assert.equal(v.status,closed);
 assert.deepEqual(v.attempts,five.validation.attempts);
 assert.deepEqual(v.carrierUpdate,five.validation.carrierUpdate);
 assert.equal(shipment.status,'ملغية');
 assert.equal(shipment.cancellationDetails,cancellation);
 assert.deepEqual(order,oldOrder);
 assert.equal(activity[0].summary,cancellation);
 assert.equal(activity.length,(oldActivity||[]).length+1);
});
test('delivery intent keeps validation open without recording a call or changing shipment status',()=>{
 const {state,id,validation}=fixture(working,2);
 const note='العميل يفضّل الاستلام مساءً.';
 const next=save(state,id,{nextAction:'wants-delivery',decisionNote:note});
 const v=next.validations[0];
 assert.equal(v.status,working);
 assert.equal(v.deliveryRequestedAt,at);
 assert.deepEqual(v.attempts,validation.attempts);
 assert.deepEqual(v.carrierUpdate,validation.carrierUpdate);
 assert.equal(v.history.at(-1).summary,note);
 assert.equal(next.shipments,state.shipments);
 assert.equal(next.orders.find(o=>o.id===v.orderId).activity[0].title,'العميل يريد الاستلام');
 assert.equal(recordValidationAction(next,id,{nextAction:'wants-delivery'}).state,next);
});
test('confirmed receipt closes validation and marks the linked shipment and order delivered',()=>{
 const {state,validation,id}=fixture();
 const next=save(state,id,{call:{result:'تم الرد',outcome:'العميل استلم فعلًا'},nextAction:'received'});
 assert.equal(next.validations[0].status,closed);
 assert.equal(next.orders.find(o=>o.id===validation.orderId).status,'تم التسليم');
 assert.equal(next.shipments.find(s=>s.id===validation.shipmentId).status,'تم التسليم');
});
test('a classified confirmation report appears in all three records without changing any status',()=>{
 const {state,validation,id}=fixture(active);
 const details='العميل أوضح أن عنوان التوصيل المسجل مختلف عن العنوان الذي قدمه.';
 const category=validationReportReasons[1],oldOrder=state.orders.find(o=>o.id===validation.orderId),oldShipment=state.shipments.find(s=>s.id===validation.shipmentId);
 assert.ok(addValidationConfirmationReport(state,id,{category:'',details}).error);
 assert.ok(addValidationConfirmationReport(state,id,{category,details:'قصير'}).error);
 const saved=addValidationConfirmationReport(state,id,{category,details,at});
 assert.equal(saved.error,undefined);
 const v=saved.state.validations[0],o=saved.state.orders.find(o=>o.id===oldOrder.id),s=saved.state.shipments.find(s=>s.id===oldShipment.id);
 assert.equal(v.confirmationReports.at(-1).category,category);
 assert.equal(v.history.at(-1).summary,category+' — '+details);
 assert.equal(o.activity[0].summary,v.history.at(-1).summary);
 assert.equal(s.events.at(-1).summary,v.history.at(-1).summary);
 assert.deepEqual([v.status,o.status,s.status],[active,oldOrder.status,oldShipment.status]);
});
