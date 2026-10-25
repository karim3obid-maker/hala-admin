// Illustrative marketer attributes for the existing synthetic sellers only.
export const dataSources=['هلا شير','داتا خاصة','هلا شير + داتا خاصة'];
export const sellerGroups=['المبتدئين','النمو','كبار المسوقين'];
export const sellerPlans=['Basic Plan','Pro Plan'];
export const sellerSorts=[
 {id:'shipments',name:'الأعلى شحنات'},
 {id:'orders',name:'الأعلى طلبات'},
 {id:'revenue',name:'الأعلى مبيعات مسلمة'},
 {id:'delivered',name:'الأعلى تسليمًا'},
 {id:'deliveryRate',name:'الأعلى نسبة تسليم'},
 {id:'confirmed',name:'الأعلى طلبات مؤكدة'},
 {id:'returned',name:'الأعلى مرتجعات نهائية'},
 {id:'name',name:'الاسم: أ–ي'},
];
export function marketerProfile(seller){
 const demoIndex=/^s[1-8]$/.test(seller.id)?Number(seller.id.slice(1))-1:-1;
 return {dataSource:demoIndex>=0?dataSources[demoIndex%3]:'غير محدد',group:demoIndex>=0?sellerGroups[demoIndex%3]:'غير محدد',...seller};
}
// Departed shipments: pickup through delivery/final return. Ready-to-ship is excluded.
export const departedShipments=summary=>summary.shipped+summary.delivered+summary.returning+summary.returned;
export function compareSellerPerformance(a,b,key,stats){
 if(key==='name')return a.name.localeCompare(b.name,'ar');
 const first=stats(a.id),second=stats(b.id);
 const value=s=>key==='shipments'?departedShipments(s):key==='orders'?s.total:s[key]||0;
 return value(second)-value(first)||a.name.localeCompare(b.name,'ar');
}
export function matchesMarketer(seller,{dataSource,group,plan}){
 const sourceMatches=!dataSource||(dataSource==='uses-hala'?['هلا شير','هلا شير + داتا خاصة'].includes(seller.dataSource):dataSource==='uses-private'?['داتا خاصة','هلا شير + داتا خاصة'].includes(seller.dataSource):seller.dataSource===dataSource);
 return sourceMatches&&(!group||seller.group===group)&&(!plan||seller.plan===plan);
}
