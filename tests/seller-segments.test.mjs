import test from 'node:test';
import assert from 'node:assert/strict';
import {orders,sellers,summarize} from '../src/data/adminAnalytics.js';
import {marketerProfile,matchesMarketer,compareSellerPerformance,departedShipments} from '../src/data/sellerSegments.js';
test('migration retains saved marketer attributes and leaves new sellers unspecified',()=>{
 assert.equal(marketerProfile({id:'s1',dataSource:'داتا خاصة',group:'جروب محفوظ'}).group,'جروب محفوظ');
 assert.equal(marketerProfile({id:'local-new'}).dataSource,'غير محدد');
});
test('source, group and plan filters intersect',()=>{
 const seller={dataSource:'هلا شير',group:'النمو',plan:'Pro Plan'};
 assert.equal(matchesMarketer(seller,{dataSource:'هلا شير',group:'النمو',plan:'Pro Plan'}),true);
 for(const key of ['dataSource','group','plan'])assert.equal(matchesMarketer(seller,{[key]:'different'}),false);
});
test('shipment ranking reconciles to departed status records and sorts descending',()=>{
 const stats=id=>summarize(orders.filter(o=>o.sellerId===id));
 const allowed=['تم الالتقاط','قيد النقل','خرج للتسليم','تعذر التسليم','تم التسليم','جاري الإرجاع','مرتجع'];
 for(const s of sellers)assert.equal(departedShipments(stats(s.id)),orders.filter(o=>o.sellerId===s.id&&allowed.includes(o.status)).length);
 const ranked=[...sellers].sort((a,b)=>compareSellerPerformance(a,b,'shipments',stats));
 for(let i=1;i<ranked.length;i++)assert.ok(departedShipments(stats(ranked[i-1].id))>=departedShipments(stats(ranked[i].id)));
 assert.equal(departedShipments(summarize([])),0);
});
test('uses Hala Share includes mixed-source marketers, and exclusive selection remains precise',()=>{
 const seller={dataSource:'هلا شير + داتا خاصة'};
 assert.equal(matchesMarketer(seller,{dataSource:'uses-hala'}),true);
 assert.equal(matchesMarketer(seller,{dataSource:'uses-private'}),true);
 assert.equal(matchesMarketer(seller,{dataSource:'هلا شير'}),false);
});
