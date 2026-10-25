import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,replaceCRM} from '../src/data/adminStore.js';
import {updateSellerSelection} from '../src/data/sellerActions.js';
const crmOf=s=>({sellers:s.sellers,tasks:s.tasks,logs:s.logs});
test('bulk plan/status updates affect selected sellers only and append per-seller activity',()=>{
 const state=createInitialState(),crm=crmOf(state);
 for(const patch of [{plan:'Pro Plan'},{status:'متوقف'},{status:'نشط'}]){
  const result=updateSellerSelection(crm,['s1','s2','missing'],patch,'تعديل تجريبي','2026-10-25T00:00:00Z');
  assert.deepEqual(result.sellers.find(s=>s.id==='s1'),{...crm.sellers[0],...patch});
  assert.strictEqual(result.sellers.find(s=>s.id==='s3'),crm.sellers[2]);
  assert.equal(result.logs.length,crm.logs.length+2);
  assert.deepEqual(result.logs.slice(0,2).map(l=>l.sellerId),['s1','s2']);
  assert.strictEqual(result.tasks,crm.tasks);
 }
});
test('manager assignment propagates through shared CRM to selected seller orders and shipments',()=>{
 const state=createInitialState(),crm=updateSellerSelection(crmOf(state),['s1'],{managerId:'am2'},'تغيير مدير الحساب');
 const result=replaceCRM(state,crm);
 for(const o of result.orders.filter(o=>o.sellerId==='s1'))assert.equal(o.managerId,'am2');
 for(const s of result.shipments.filter(s=>s.sellerId==='s1'))assert.equal(s.managerId,'am2');
 assert.equal(result.sellers.find(s=>s.id==='s3').managerId,state.sellers.find(s=>s.id==='s3').managerId);
});
test('unsupported credential properties are not applied by local bulk actions',()=>{
 const crm=crmOf(createInitialState()),result=updateSellerSelection(crm,['s1'],{password:'not-saved',status:'نشط'},'تفعيل');
 assert.equal(result.sellers[0].password,undefined);
 assert.equal(result.sellers[0].status,'نشط');
});
