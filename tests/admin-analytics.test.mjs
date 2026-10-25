import test from 'node:test';
import assert from 'node:assert/strict';
import {orders,sellers,stores,employees,managers,products,defaultFilters,filterOrders,summarize,groupOrders,dimensions,stageBreakdown,statuses,shippingStatuses} from '../src/data/adminAnalytics.js';
test('demo records have consistent ownership and monetary values',()=>{
 assert.equal(orders.length,480);assert.equal(new Set(orders.map(o=>o.id)).size,480);
 for(const o of orders){
  const seller=sellers.find(x=>x.id===o.sellerId),store=stores.find(x=>x.id===o.storeId),product=products.find(x=>x.id===o.productId);
  assert.equal(store.sellerId,seller.id);assert.equal(o.managerId,seller.managerId);
  assert.ok(employees.some(x=>x.id===o.employeeId));assert.ok(managers.some(x=>x.id===o.managerId));
  assert.equal(o.amount,product.price*o.quantity);assert.equal(o.productCost,product.cost*o.quantity);
  assert.ok(o.date>='2026-10-01'&&o.date<='2026-10-24');
 }
});
test('financial totals count delivered orders only and reconcile across every dimension',()=>{
 const s=summarize(orders),delivered=orders.filter(o=>o.status==='تم التسليم');
 assert.equal(s.total,s.confirmed+s.pending+s.cancelled);
 assert.equal(s.revenue,delivered.reduce((n,o)=>n+o.amount,0));
 assert.equal(s.profit,delivered.reduce((n,o)=>n+o.amount-o.productCost-o.shippingCost,0));
 for(const d of Object.keys(dimensions))for(const key of ['total','revenue','profit','confirmed','cancelled'])assert.equal(groupOrders(orders,d).reduce((n,x)=>n+x[key],0),s[key]);
});
test('person and store filters intersect, with inclusive custom dates',()=>{
 const o=orders[0],filters={...defaultFilters,period:'custom',from:o.date,to:o.date,sellerId:o.sellerId,storeId:o.storeId,managerId:o.managerId,employeeId:o.employeeId};
 const rows=filterOrders(orders,filters);
 assert.ok(rows.length>0);assert.ok(rows.every(x=>x.date===o.date&&x.storeId===o.storeId&&x.employeeId===o.employeeId));
 assert.equal(filterOrders(orders,{...defaultFilters,sellerId:'s1',employeeId:'e1'}).length,13);
 assert.equal(filterOrders(orders,{...defaultFilters,managerId:'am1'}).length,190);
 assert.equal(filterOrders(orders,{...defaultFilters,storeId:o.storeId,sellerId:sellers.find(s=>s.id!==o.sellerId).id}).length,0);
});
test('empty selections and zero delivered revenue produce finite zero-safe rates',()=>{
 for(const rows of [[],orders.filter(x=>x.status==='ملغي')]){
  const s=summarize(rows);for(const v of Object.values(s))assert.ok(Number.isFinite(v));
  assert.equal(s.revenue,0);assert.equal(s.cost,0);assert.equal(s.margin,0);assert.equal(s.deliveryRate,0);
 }
});

test('stage totals partition each scope and preserve the shipping outcome denominator',()=>{
 for(const rows of [orders,filterOrders(orders,{...defaultFilters,sellerId:'s1'}),[]]){
  for(const scope of ['orders','shipping']){
   const breakdown=stageBreakdown(rows,scope);
   assert.equal(breakdown.stages.length,scope==='shipping'?shippingStatuses.length:statuses.length);
   assert.equal(breakdown.stages.reduce((n,x)=>n+x.count,0),breakdown.total);
   assert.ok(Math.abs(breakdown.stages.reduce((n,x)=>n+x.share,0)-(breakdown.total?100:0))<1e-8);
  }
  const summary=summarize(rows),shipment=stageBreakdown(rows,'shipping');
  assert.equal(shipment.total,summary.ready+summary.shipped+summary.delivered+summary.returning+summary.returned);
  assert.equal(summary.shipped,summary.picked+summary.inTransit+summary.outForDelivery+summary.deliveryFailed);
  assert.equal(summary.pending,summary.newOrders+summary.awaitingConfirmation);
  assert.equal(summary.deliveryRate,summary.delivered+summary.returned?summary.delivered/(summary.delivered+summary.returned)*100:0);
 }
 assert.ok(statuses.every(status=>orders.some(o=>o.status===status)));
});
