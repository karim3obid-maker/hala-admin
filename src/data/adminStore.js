import {orders as seedOrders,sellers as seedSellers,stores,managers,employees,countries,shippingStatuses} from './adminAnalytics.js';
import {marketerProfile} from './sellerSegments.js';
export const shipmentStatuses=['قيد الانتظار','جاهز للشحن','قيد التجهيز','تم الشحن','في الطريق','تحت محاولة التسليم','تم التسليم','فشل التسليم','جاري الإرجاع','مرتجع','ملغية'];
export const orderToShipment={'مؤكد':'قيد الانتظار','جديد':'قيد الانتظار','جاري التأكيد':'قيد الانتظار','تم الالتقاط':'تم الشحن','قيد النقل':'في الطريق','خرج للتسليم':'تحت محاولة التسليم','تعذر التسليم':'فشل التسليم','ملغي':'ملغية'};
export const shipmentToOrder=Object.fromEntries(Object.entries(orderToShipment).filter(([k])=>!['جديد','جاري التأكيد'].includes(k)).map(([k,v])=>[v,k]));
const crmStages=['نشط','يحتاج متابعة','قيد التفعيل','نشط','جاري التواصل','نشط','جديد','متوقف'];
const tasks=[{id:'t1',sellerId:'s2',title:'مراجعة تراجع الطلبات وخطة التفعيل',type:'مكالمة',priority:'مرتفعة',managerId:'am2',due:'2026-10-23T12:00',done:false},{id:'t2',sellerId:'s3',title:'متابعة تجهيز أول حملة بيع',type:'واتساب',priority:'متوسطة',managerId:'am3',due:'2026-10-25T11:00',done:false},{id:'t3',sellerId:'s1',title:'مراجعة أداء الشحن مع البائع',type:'اجتماع',priority:'متوسطة',managerId:'am1',due:'2026-10-24T16:00',done:false}];
export function createInitialState(legacy){
 const sellers=(legacy?.sellers||seedSellers.map((s,i)=>({...s,code:`SL-${String(i+1).padStart(4,'0')}`,business:stores.find(t=>t.sellerId===s.id)?.name||s.name,country:countries[i%4],plan:i%3?'Basic Plan':'Pro Plan',phone:'',email:'',status:i===7?'متوقف':'نشط',crm:crmStages[i],priority:['مرتفعة','متوسطة','منخفضة'][i%3],description:'',created:'2026-10-01'}))).map(marketerProfile);
 const orders=seedOrders.map((o,i)=>({...o,currency:'USD',phone:'',city:['الرياض','دبي','الكويت','مسقط'][countries.indexOf(o.country)],address:`عنوان تجريبي ${i+1}`,duplicate:i%19===0,upsell:o.quantity>1,changeRequested:i%31===0}));
 const shipments=orders.filter(o=>['مؤكد','قيد التجهيز',...shippingStatuses].includes(o.status)).map((o,i)=>({...o,id:o.id.replace('HL-','SHP-'),orderId:o.id,status:orderToShipment[o.status]||o.status,tracking:['مؤكد','قيد التجهيز','جاهز للشحن'].includes(o.status)?'':`DEMO-${610000+i}`,events:[],changeRequests:o.changeRequested?[{id:`change-${i}`,title:'مراجعة عنوان التوصيل',status:'معلق',at:o.date}]:[],arrivedAtWarehouse:o.status==='مرتجع'&&i%2===0}));
 const validations=shipments.filter(s=>['فشل التسليم','جاري الإرجاع','مرتجع'].includes(s.status)).slice(0,24).map((s,i)=>({id:`VAL-${i+1}`,shipmentId:s.id,orderId:s.orderId,status:i%4===0?'قيد التنفيذ':'في الانتظار',entryReason:s.status==='فشل التسليم'?'failed_delivery':'returned',enteredAt:s.date,employeeId:s.employeeId,attempts:[],finalAction:'',source:'',classification:''}));
 return {version:2,orders,shipments,sellers,stores,managers,employees,tasks:legacy?.tasks||tasks,logs:legacy?.logs||[],validations};
}
const sharedKeys=['customer','phone','extraPhone','country','region','city','district','address','nationalAddress','items','quantity','amount','currency','sellerId','storeId','managerId','employeeId','productId'];
const contactPatch=o=>Object.fromEntries(sharedKeys.filter(k=>k in o).map(k=>[k,o[k]]));
export function replaceOrders(state,orders){
 const byId=new Map(orders.map(o=>[o.id,o]));
 const linked=new Set(state.shipments.map(s=>s.orderId));
 const added=orders.filter(o=>!linked.has(o.id)&&['مؤكد','قيد التجهيز',...shippingStatuses].includes(o.status)).map(o=>({...o,id:o.id.startsWith('HL-')?o.id.replace('HL-','SHP-'):'SHP-'+o.id,orderId:o.id,status:orderToShipment[o.status]||o.status,tracking:'',events:[],changeRequests:[],arrivedAtWarehouse:false}));
 return {...state,orders,shipments:[...state.shipments.map(s=>{const o=byId.get(s.orderId),old=state.orders.find(x=>x.id===s.orderId);if(!o)return s;return {...s,...contactPatch(o),...(old?.status!==o.status&&['قيد التجهيز','جاهز للشحن',...shippingStatuses,'ملغي'].includes(o.status)?{status:orderToShipment[o.status]||o.status}:{})}}),...added]};
}
export function replaceShipments(state,shipments){
 let orders=state.orders;
 for(const s of shipments){const old=state.shipments.find(x=>x.id===s.id);if(!old||old===s)continue;orders=orders.map(o=>o.id===s.orderId?{...o,...contactPatch(s),...(s.status!==old.status?{status:shipmentToOrder[s.status]||s.status}:{} )}:o)}
 return {...state,shipments,orders};
}
export function replaceCRM(state,crm){
 const bySeller=new Map(crm.sellers.map(s=>[s.id,s]));
 const orders=state.orders.map(o=>bySeller.has(o.sellerId)?{...o,managerId:bySeller.get(o.sellerId).managerId}:o);
 return replaceOrders({...state,...crm},orders);
}
export const csvCell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
export function downloadCSV(headers,rows,name){const blob=new Blob(['\ufeff'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function patchSelectedOrders(state,ids,patch,title){const selected=new Set(ids),at=new Date().toISOString();return replaceOrders(state,state.orders.map(o=>selected.has(o.id)?{...o,...patch,updatedAt:at,activity:[{id:crypto.randomUUID(),title,user:'مدير النظام',time:new Date(at).toLocaleTimeString('ar-EG'),at},...(o.activity||[])]}:o))}
let memory;
function read(){if(memory)return memory;let current,legacy;try{current=JSON.parse(sessionStorage.getItem('hala-admin-v2'));legacy=JSON.parse(sessionStorage.getItem('hala-seller-crm-v1'))}catch{}memory=current?.version===2&&['orders','shipments','sellers','tasks','logs','validations'].every(k=>Array.isArray(current[k]))?current:createInitialState(legacy);return memory}
const listeners=new Set();
export const getSnapshot=()=>read();
export const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
export function updateStore(updater){memory=updater(read());try{sessionStorage.setItem('hala-admin-v2',JSON.stringify(memory));sessionStorage.setItem('hala-seller-crm-v1',JSON.stringify({sellers:memory.sellers,tasks:memory.tasks,logs:memory.logs}))}catch{}listeners.forEach(fn=>fn())}
export const setOrders=fn=>updateStore(s=>replaceOrders(s,typeof fn==='function'?fn(s.orders):fn));
export const setShipments=fn=>updateStore(s=>replaceShipments(s,typeof fn==='function'?fn(s.shipments):fn));
export const setCRM=fn=>updateStore(s=>replaceCRM(s,typeof fn==='function'?fn({sellers:s.sellers,tasks:s.tasks,logs:s.logs}):fn));
