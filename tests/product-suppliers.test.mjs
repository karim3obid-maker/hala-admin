import test from 'node:test';
import assert from 'node:assert/strict';
import {supplierOrderLines,supplierForProduct,readSupplierDB,saveSupplierDB} from '../src/data/productSuppliers.js';
const products=[{id:'p1'},{id:'p2'}];
const order=(id,status,extra={})=>({id,status,date:'2026-10-24',productId:'p1',quantity:2,...extra});
test('only shipped stages count as withdrawals and lines aggregate per product',()=>{
 const rows=supplierOrderLines(products,[order('new','جديد'),order('ready','جاهز للشحن'),order('sent','قيد النقل',{items:[{productId:'p1',quantity:2},{productId:'p1',quantity:3},{productId:'p2',quantity:1},{productId:'other',quantity:9}]})],[]);
 assert.equal(rows.length,4);
 assert.equal(rows.find(x=>x.orderId==='new').withdrawn,0);
 assert.equal(rows.find(x=>x.orderId==='ready').withdrawn,0);
 assert.equal(rows.find(x=>x.orderId==='sent'&&x.productId==='p1').withdrawn,5);
 assert.equal(rows.find(x=>x.productId==='p2').withdrawn,1);
});
test('shipment stage can establish withdrawal; return requires warehouse arrival',()=>{
 const rows=supplierOrderLines(products,[order('a','مؤكد'),order('b','مرتجع'),order('c','مرتجع'),order('d','تم التسليم')],[{orderId:'a',status:'تم الشحن'},{orderId:'b',status:'مرتجع',arrivedAtWarehouse:false},{orderId:'c',status:'مرتجع',arrivedAtWarehouse:true}]);
 assert.equal(rows.find(x=>x.orderId==='a').withdrawn,2);
 assert.equal(rows.find(x=>x.orderId==='b').returned,0);
 assert.equal(rows.find(x=>x.orderId==='c').returned,2);
 assert.equal(rows.find(x=>x.orderId==='d').delivered,2);
});
test('supplier linkage honors overrides, selected IDs and legacy catalog records',()=>{
 assert.equal(supplierForProduct({id:'p1'},{links:{}}),'sup-1');
 assert.equal(supplierForProduct({id:'x',supplierId:'new'},{links:{}}),'new');
 assert.equal(supplierForProduct({id:'x',supplier:'مورد تجريبي 2'},{links:{}}),'sup-2');
 assert.equal(supplierForProduct({id:'p1',supplierId:'new'},{links:{p1:'override'}}),'override');
 assert.equal(supplierForProduct({id:'x'},{links:{}}),'');
});
test('supplier edits and product associations survive a session read',()=>{
 const memory=new Map();globalThis.sessionStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 const db=readSupplierDB();const next={suppliers:[...db.suppliers,{id:'new',name:'مورد اختبار'}],links:{x:'new'}};
 saveSupplierDB(next);assert.deepEqual(readSupplierDB(),next);delete globalThis.sessionStorage;
});
