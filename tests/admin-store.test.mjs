import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,replaceOrders,replaceShipments,replaceCRM,patchSelectedOrders} from '../src/data/adminStore.js';
import {summarize} from '../src/data/adminAnalytics.js';
test('legacy CRM tasks, seller custom fields and notes survive migration',()=>{
 const legacy={sellers:[{id:'custom',name:'بائع محلي',managerId:'am2',custom:'keep'}],tasks:[{id:'task',title:'متابعة'}],logs:[{id:'note',text:'ملاحظة محفوظة'}]};
 const state=createInitialState(legacy);
 assert.deepEqual(state.tasks,legacy.tasks);assert.deepEqual(state.logs,legacy.logs);assert.equal(state.sellers[0].custom,'keep');assert.equal(state.sellers[0].dataSource,'غير محدد');
});
test('shipment delivery changes order, scoped seller revenue and linked detail together',()=>{
 const state=createInitialState(),shipment=state.shipments.find(s=>s.status==='جاهز للشحن'),order=state.orders.find(o=>o.id===shipment.orderId);
 const old=summarize(state.orders.filter(o=>o.sellerId===order.sellerId));
 const next=replaceShipments(state,state.shipments.map(s=>s.id===shipment.id?{...s,status:'تم التسليم'}:s));
 assert.equal(next.orders.find(o=>o.id===order.id).status,'تم التسليم');assert.equal(summarize(next.orders.filter(o=>o.sellerId===order.sellerId)).revenue,old.revenue+order.amount);
 assert.equal(state.orders.find(o=>o.id===order.id).status,'جاهز للشحن');
});
test('editing an order updates linked contact, items and currency without losing shipment metadata',()=>{
 const state=createInitialState(),shipment=state.shipments[0],order=state.orders.find(o=>o.id===shipment.orderId);
 const next=replaceOrders(state,state.orders.map(o=>o.id===order.id?{...o,customer:'عميل محدث',amount:151,currency:'USD',items:[{productId:o.productId,quantity:3,price:50.333}]}:o));
 const changed=next.shipments.find(s=>s.id===shipment.id);
 assert.equal(changed.customer,'عميل محدث');assert.equal(changed.amount,151);assert.equal(changed.tracking,shipment.tracking);assert.deepEqual(changed.items,next.orders.find(o=>o.id===order.id).items);
});
test('bulk assignment updates only selected orders and adds their activity',()=>{
 const state=createInitialState(),ids=state.orders.slice(0,2).map(o=>o.id),next=patchSelectedOrders(state,ids,{employeeId:''},'إلغاء التعيين');
 assert.ok(next.orders.filter(o=>ids.includes(o.id)).every(o=>o.employeeId===''&&o.activity[0].title==='إلغاء التعيين'));
 assert.deepEqual(next.orders.slice(2),state.orders.slice(2));
 for(const s of next.shipments.filter(s=>ids.includes(s.orderId)))assert.equal(s.employeeId,'');
});
test('in-progress returns remain distinct from final returns and arrival at warehouse',()=>{
 const state=createInitialState(),shipment=state.shipments.find(s=>s.status==='جاري الإرجاع');assert.ok(shipment);assert.equal(shipment.arrivedAtWarehouse,false);
 const next=replaceShipments(state,state.shipments.map(s=>s.id===shipment.id?{...s,status:'مرتجع'}:s));
 assert.equal(next.orders.find(o=>o.id===shipment.orderId).status,'مرتجع');assert.equal(next.shipments.find(s=>s.id===shipment.id).arrivedAtWarehouse,false);
});
test('saved shipment edits do not create pending change requests',()=>{
 const state=createInitialState(),shipment=state.shipments.find(s=>s.changeRequests.length===0),next=replaceShipments(state,state.shipments.map(s=>s.id===shipment.id?{...s,tracking:'DEMO-UPDATED',events:[{title:'تعديل التتبع'}]}:s));
 assert.deepEqual(next.shipments.find(s=>s.id===shipment.id).changeRequests,[]);assert.equal(next.shipments.find(s=>s.id===shipment.id).events.length,1);
});
test('changing seller manager propagates to orders, shipments and leaves notes intact',()=>{
 const state=createInitialState(),seller=state.sellers[0],next=replaceCRM(state,{sellers:state.sellers.map(s=>s.id===seller.id?{...s,managerId:'am3'}:s),tasks:state.tasks,logs:state.logs});
 assert.ok(next.orders.filter(o=>o.sellerId===seller.id).every(o=>o.managerId==='am3'));assert.ok(next.shipments.filter(s=>s.sellerId===seller.id).every(s=>s.managerId==='am3'));assert.deepEqual(next.logs,state.logs);
});

test('confirming an order creates one linked pending shipment and later edits reuse it',()=>{
 const state=createInitialState(),order=state.orders.find(o=>o.status==='جديد');
 const next=replaceOrders(state,state.orders.map(o=>o.id===order.id?{...o,status:'مؤكد'}:o));
 const shipment=next.shipments.find(s=>s.orderId===order.id);
 assert.ok(shipment);assert.equal(shipment.status,'قيد الانتظار');
 const updated=replaceOrders(next,next.orders.map(o=>o.id===order.id?{...o,customer:'تعديل بعد التأكيد'}:o));
 assert.equal(updated.shipments.filter(s=>s.orderId===order.id).length,1);
 assert.equal(updated.shipments.find(s=>s.orderId===order.id).customer,'تعديل بعد التأكيد');
});
