import {orders as seedOrders,sellers as seedSellers,stores,managers,employees,countries,shippingStatuses} from './adminAnalytics.js';
import {marketerProfile} from './sellerSegments.js';
export const shipmentStatuses=['قيد الانتظار','جاهز للشحن','قيد التجهيز','تم الشحن','في الطريق','تحت محاولة التسليم','تم التسليم','فشل التسليم','جاري الإرجاع','مرتجع','ملغية'];
export const validationStatuses=['في الانتظار','قيد التنفيذ','تم الإرسال لشركة الشحن','جاري العمل عليه مع شركة الشحن','تم التصرف'];
export const validationReasons={failed_delivery:'تعذر التسليم',returned:'مرتجع'};
export const orderToShipment={'مؤكد':'قيد الانتظار','جديد':'قيد الانتظار','جاري التأكيد':'قيد الانتظار','تم الالتقاط':'تم الشحن','قيد النقل':'في الطريق','خرج للتسليم':'تحت محاولة التسليم','تعذر التسليم':'فشل التسليم','ملغي':'ملغية'};
export const shipmentToOrder=Object.fromEntries(Object.entries(orderToShipment).filter(([k])=>!['جديد','جاري التأكيد'].includes(k)).map(([k,v])=>[v,k]));
export const unifiedOrderReasons=[
 {id:'reason-view-change',label:'تغيير رأي العميل',description:'العميل تراجع عن الشراء بعد تأكيد الطلب.',system:true,active:true},
 {id:'reason-better-price',label:'وجد سعرًا أفضل',description:'العميل وجد المنتج نفسه بسعر أقل لدى جهة أخرى.',system:true,active:true},
 {id:'reason-delivery-delay',label:'تأخير التوصيل',description:'مدة الشحن طويلة أو تجاوزت الموعد المتفق عليه.',system:true,active:true},
 {id:'reason-no-answer',label:'عدم رد العميل',description:'تعذّر الوصول للعميل بعد عدة محاولات اتصال.',system:true,active:true},
 {id:'reason-wrong-data',label:'خطأ في بيانات الطلب',description:'الاسم أو الهاتف أو بيانات الطلب غير صحيحة أو ناقصة.',system:true,active:true},
 {id:'reason-out-of-stock',label:'المنتج غير متوفر',description:'نفاد المنتج من المخزون أو توقف بيعه.',system:true,active:true},
 {id:'reason-payment-issue',label:'مشكلة في الدفع',description:'رفض الدفع عند الاستلام أو مشكلة في وسيلة الدفع.',system:true,active:true},
 {id:'reason-address-issue',label:'مشكلة في العنوان',description:'العنوان غير مكتمل أو خارج نطاق التغطية.',system:true,active:true},
 {id:'reason-duplicate',label:'طلب مكرر',description:'نفس العميل أنشأ الطلب نفسه أكثر من مرة.',system:true,active:true},
 {id:'reason-refuse-delivery',label:'رفض استلام الطلب',description:'العميل رفض استلام الشحنة عند وصولها.',system:true,active:true},
 {id:'reason-fake',label:'طلب وهمي',description:'طلب تم إنشاؤه بشكل خاطئ أو بإساءة استخدام.',system:true,active:true},
 {id:'reason-other',label:'سبب آخر',description:'أي سبب غير مذكور، مع كتابة التفاصيل في الحقل الإلزامي.',system:true,active:true}
];
export const unifiedShipmentReasons=[
 {id:'ship-reason-no-answer',label:'تعذر الوصول للعميل',description:'فشلت محاولات الاتصال قبل خروج الشحنة.',system:true,active:true},
 {id:'ship-reason-refuse',label:'رفض العميل الاستلام',description:'العميل رفض الشحنة عند محاولة التسليم.',system:true,active:true},
 {id:'ship-reason-address',label:'عنوان غير قابل للتوصيل',description:'العنوان خاطئ أو خارج نطاق تغطية شركة الشحن.',system:true,active:true},
 {id:'ship-reason-carrier',label:'تأخير من شركة الشحن',description:'تأخير الشحنة لدى الناقل أو مشكلة تشغيلية لديه.',system:true,active:true},
 {id:'ship-reason-damaged',label:'تلف المنتج',description:'المنتج تالف ولا يمكن تسليمه للعميل.',system:true,active:true},
 {id:'ship-reason-return-request',label:'طلب إرجاع من العميل',description:'العميل طلب إرجاع الشحنة قبل أو عند التسليم.',system:true,active:true},
 {id:'ship-reason-validation',label:'قرار الفالديشن',description:'قرار نهائي من فريق الفالديشن بإلغاء الشحنة.',system:true,active:true},
 {id:'ship-reason-other',label:'سبب آخر',description:'أي سبب غير مذكور، مع كتابة التفاصيل.',system:true,active:true}
];
/* حالات مشكلات الشحنات: الحالات التي تُعد مشكلة تشغيلية وتُدار من الإعدادات. */
export const shippingProblemStatusOptions=['تحت محاولة التسليم','فشل التسليم','جاري الإرجاع','مرتجع','ملغية'];
export const defaultShippingProblemCases=[
 {id:'spc-attempt',label:'تحت محاولة التسليم',description:'الشحنة خرجت لمحاولة تسليم ولم تُحسم نتيجتها بعد.',status:'تحت محاولة التسليم',kind:'status',system:true,active:true},
 {id:'spc-failed',label:'فشل التسليم',description:'تعذّر على شركة الشحن تسليم الشحنة للعميل بعد المحاولات.',status:'فشل التسليم',kind:'status',system:true,active:true},
 {id:'spc-returning',label:'جاري الإرجاع',description:'الشحنة في طريق عودتها إلى المخزن ولم تُسجّل كمرتجع نهائي.',status:'جاري الإرجاع',kind:'status',system:true,active:true},
 {id:'spc-returned',label:'مرتجع نهائي',description:'وصلت الشحنة للمخزن وأُقفلت كمرتجع نهائي.',status:'مرتجع',kind:'status',system:true,active:true},
 {id:'spc-cancelled',label:'شحنة ملغية',description:'أُلغيت الشحنة قبل التسليم ولا تستكمل دورة التوصيل.',status:'ملغية',kind:'status',system:true,active:true},
 {id:'spc-late',label:'شحنة متأخرة',description:'تجاوزت تاريخ التوصيل المتوقع ولم تصل لحالة نهائية.',status:'متأخرة',kind:'late',system:true,active:true},
 {id:'spc-action',label:'تحتاج إجراء',description:'فشل تسليم أو طلب تعديل معلق أو شحنة مشحونة بدون رقم تتبع.',status:'تحتاج إجراء',kind:'action',system:true,active:true}
];
export const defaultPricingPlans=[
 {id:'plan-vip',name:'vip plan',expiry:'2027-07-28',packing:0.80,shipped:1.20,delivery:5.00,return:3.00,codPercent:3.00,storageCbm:1.20,storageItem:0.15,callFixed:1.00,callLead:0.50,callConfirm:1.50,callDelivered:2.00,callUpsell:2.50,default:false},
 {id:'plan-customized',name:'Customized plan',expiry:'2026-12-31',packing:0.70,shipped:1.10,delivery:5.00,return:3.00,codPercent:5.00,storageCbm:1.00,storageItem:0.12,callFixed:0.80,callLead:0.40,callConfirm:1.20,callDelivered:1.80,callUpsell:2.00,default:false},
 {id:'plan-shipping',name:'Shipping / Fulfillment',expiry:'2026-12-31',packing:1.00,shipped:1.40,delivery:5.99,return:3.50,codPercent:5.00,storageCbm:1.40,storageItem:0.18,callFixed:1.20,callLead:0.60,callConfirm:1.60,callDelivered:2.20,callUpsell:2.80,default:false},
 {id:'plan-basic',name:'Basic Plan',expiry:'2026-12-15',packing:0.60,shipped:1.00,delivery:5.00,return:3.00,codPercent:5.00,storageCbm:0.90,storageItem:0.10,callFixed:0.00,callLead:0.35,callConfirm:1.00,callDelivered:1.50,callUpsell:1.75,default:true},
 {id:'plan-standard',name:'Standard Plan',expiry:'2026-12-15',packing:0.90,shipped:1.30,delivery:8.00,return:4.00,codPercent:3.00,storageCbm:1.10,storageItem:0.14,callFixed:1.00,callLead:0.50,callConfirm:1.40,callDelivered:2.00,callUpsell:2.40,default:false},
 {id:'plan-premium',name:'Premium Plan',expiry:'2026-12-15',packing:1.10,shipped:1.50,delivery:6.00,return:3.00,codPercent:2.50,storageCbm:1.30,storageItem:0.16,callFixed:1.50,callLead:0.70,callConfirm:1.80,callDelivered:2.50,callUpsell:3.00,default:false}
];
const crmStages=['نشط','يحتاج متابعة','قيد التفعيل','نشط','جاري التواصل','نشط','جديد','متوقف'];
/* طلبات المحفظة: السحب طلب من البائع إلى الشركة، والإيداع طلب من الشركة إلى البائع (العكس حرفيًا).
   المراحل موحدة بالمفاتيح new/review/proof/completed/rejected والترتيب يختلف حسب النوع:
   سحب: جديد ← قيد المراجعة ← بانتظار صورة التحويل ← مكتمل. إيداع: جديد ← بانتظار صورة التحويل ← بانتظار التحقق ← مكتمل. */
export const walletStageCards={
 withdrawal:[
  {key:'new',label:'طلب جديد من البائع',tone:'blue',note:'البائع مقدم الطلب — يحدد المبلغ والطريقة وسبب الطلب.'},
  {key:'review',label:'قيد المراجعة لدى الشركة',tone:'pending',note:'مراجعة الرصيد والبيانات قبل تنفيذ أي تحويل.'},
  {key:'proof',label:'بانتظار صورة التحويل',tone:'pending',note:'تحويل الشركة للبائع يجب إرفاق إيصاله بالطلب.'},
  {key:'completed',label:'تم التحويل — مكتمل',tone:'success',note:'المبلغ حُوِّل للبائع وصق الإيصال محفوظ داخل الطلب.'},
  {key:'rejected',label:'مرفوض',tone:'danger',note:'الطلب مرفوض مع سبب مسجل — لا ينتقل له بعد المكتمل.'}],
 deposit:[
  {key:'new',label:'طلب جديد من الشركة',tone:'blue',note:'الشركة مقدم الطلب — تطلب من البائع مبلغًا محددًا بسبب مسجل.'},
  {key:'review',label:'بانتظار تحويل البائع',tone:'pending',note:'طلبت الشركة المبلغ ولم يُرفق إثبات تحويل البائع بعد.'},
  {key:'proof',label:'بانتظار التحقق من التحويل',tone:'pending',note:'أُرفقت صورة تحويل البائع وعليها التأكد من مطابقة الأرقام.'},
  {key:'completed',label:'تم الإيداع — مكتمل',tone:'success',note:'أُضيف الرصيد لمحفظة البائع وصق الإيداع محفوظ بالطلب.'},
  {key:'rejected',label:'مرفوض',tone:'danger',note:'الطلب مرفوض مع سبب مسجل — لا ينتقل له بعد المكتمل.'}]
};
export const walletStageOrder={withdrawal:['new','review','proof'],deposit:['new','review','proof']};
export const walletMethods=['تحويل بنكي','محفظة إلكترونية (STC Pay)','Western Union','USDT','كاش'];
export function defaultPaymentMethods(){return [
 {id:'pm-payoneer',type:'payoneer',label:'Payoneer',enabled:true,fields:{account:''}},
 {id:'pm-bank',type:'bank',label:'حساب بنكي',enabled:true,fields:{bankName:'',accountNumber:'',accountHolder:''}},
 {id:'pm-instapay',type:'instapay',label:'InstaPay',enabled:true,fields:{phone:''}},
 {id:'pm-wallet',type:'wallet',label:'محفظة',enabled:true,fields:{provider:'',number:''}}
];}
export const walletRejectionReasons=['بيانات الصورة غير مقروءة أو ناقصة','رقم مرجع التحويل غير مطابق','المبلغ المحوَّل لا يطابق المطلوب','البائع أرسل التحويل إلى جهة خاطئة','رحلة طويلة بدون متابعة من البائع','سبب آخر'];
function seedWalletRequests(){
 const sellerReq=(i)=>{const s=seedSellers[i];return {sellerId:s.id,sellerName:s.name,sellerCode:`SL-${String(i+1).padStart(4,'0')}`,phone:`+966 5X XXX ${1000+i*7}`,plan:i%3?'Basic Plan':'Pro Plan',country:countries[i%4]}};
 const act=(title,at)=>[{id:crypto.randomUUID(),title,user:'مدير النظام',at}];
 return [
  {id:'WD-1003',type:'withdrawal',...sellerReq(3),amount:760,currency:'USD',method:'تحويل بنكي',reference:'TRX-774512',stage:'completed',proofDemo:'withdrawal',proofName:'إيصال تحويل الشركة — نموذج تجريبي',reason:'سحب أرباح بعد إقفال حملة سبتمبر.',notes:'',rejectReason:'',createdAt:'2026-11-02T11:20',activity:[...act('طلب جديد من البائع','02/11 11:20'),...act('اعتماد الطلب بعد مراجعة الرصيد','02/11 15:05'),...act('تحويل المبلغ وإرفاق إيصال التحويل','03/11 09:31')]},
  {id:'WD-1001',type:'withdrawal',...sellerReq(0),amount:1850,currency:'SAR',method:'تحويل بنكي',reference:'TRX-889231',stage:'proof',reason:'سحب أرباح موسم الذروة',notes:'',rejectReason:'',createdAt:'2026-11-04T13:42',activity:[...act('طلب جديد من البائع','04/11 13:42'),...act('اجتياز المراجعة — بانتظار رفع صورة التحويل','05/11 10:15')]},
  {id:'WD-1002',type:'withdrawal',...sellerReq(1),amount:2400,currency:'SAR',method:'محفظة إلكترونية (STC Pay)',reference:'STC-556701',stage:'review',reason:'تغطية مصاريف تشغيل المخزن',notes:'',rejectReason:'',createdAt:'2026-11-05T09:05',activity:act('طلب جديد من البائع','05/11 09:05')},
  {id:'WD-1004',type:'withdrawal',...sellerReq(4),amount:3200,currency:'SAR',method:'Western Union',reference:'WU-902448',stage:'rejected',reason:'',notes:'الطلب نُقل للمراجعة ثم وقف بسبب مكرر.',rejectReason:'طلب مكرر مع طلب السحب WD-1001 لنفس الفترة — بعد الربط تم إلغاء الزائد',createdAt:'2026-11-06T14:30',activity:[...act('طلب جديد من البائع','06/11 14:30'),...act('رفض الطلب مع تسجيل السبب','07/11 09:12')]},
  {id:'WD-1005',type:'withdrawal',...sellerReq(6),amount:1100,currency:'SAR',method:'كاش',reference:'',stage:'new',reason:'سحب جزئي لتجريب دورة السحب',notes:'',rejectReason:'',createdAt:'2026-11-09T16:48',activity:act('طلب جديد من البائع','09/11 16:48')},
  {id:'DP-2001',type:'deposit',...sellerReq(2),amount:900,currency:'SAR',method:'تحويل بنكي',reference:'DEP-412057',stage:'completed',proofDemo:'deposit',proofName:'إيثبت إيداع البائع — نموذج تجريبي',reason:'رصيد الشحن نفد — يلزم تغطية الشحنات الجارية.',notes:'',rejectReason:'',createdAt:'2026-11-05T10:07',activity:[...act('طلب إيداع من الشركة موجه للبائع','05/11 10:07'),...act('رفع البائع صورة إثبات التحويل','05/11 12:22'),...act('التحقق من التحويل وإضافة الرصيد','05/11 13:40')]},
  {id:'DP-2002',type:'deposit',...sellerReq(5),amount:500,currency:'USD',method:'USDT',reference:'',stage:'review',reason:'المحفظة وصلت للحد الأدنى — توقف تجهيز الشحنات.',notes:'',rejectReason:'',createdAt:'2026-11-07T11:15',activity:act('طلب إيداع من الشركة موجه للبائع','07/11 11:15')},
  {id:'DP-2003',type:'deposit',...sellerReq(7),amount:2000,currency:'SAR',method:'تحويل بنكي',reference:'',stage:'new',reason:'تعويض عمولة الشحن المتراكمة عن أكتوبر.',notes:'',rejectReason:'',createdAt:'2026-11-09T09:32',activity:act('طلب إيداع من الشركة موجه للبائع','09/11 09:32')},
  {id:'DP-2004',type:'deposit',...sellerReq(1),amount:450,currency:'SAR',method:'محفظة إلكترونية (STC Pay)',reference:'',stage:'rejected',reason:'استكمال حد الإيداع قبل تفعيل المتجر الموسمي.',notes:'',rejectReason:'انتهت مهلة الإيداع المحددة (7 أيام) دون تنفيذ البائع للتحويل',createdAt:'2026-11-01T08:50',activity:[...act('طلب إيداع من الشركة موجه للبائع','01/11 08:50'),...act('رفض الطلب — انتهت المهلة وسبق رفض طلب مشابه','08/11 10:00')]}
 ];
}/* placeholder */
const tasks=[{id:'t1',sellerId:'s2',title:'مراجعة تراجع الطلبات وخطة التفعيل',type:'مكالمة',priority:'مرتفعة',managerId:'am2',due:'2026-10-23T12:00',done:false},{id:'t2',sellerId:'s3',title:'متابعة تجهيز أول حملة بيع',type:'واتساب',priority:'متوسطة',managerId:'am3',due:'2026-10-25T11:00',done:false},{id:'t3',sellerId:'s1',title:'مراجعة أداء الشحن مع البائع',type:'اجتماع',priority:'متوسطة',managerId:'am1',due:'2026-10-24T16:00',done:false}];
export const citiesByCountry={'السعودية':['الرياض','جدة','الدمام'],'الإمارات':['دبي','أبوظبي','الشارقة'],'الكويت':['الكويت','حولي'],'عُمان':['مسقط','صلالة']};
export const paymentStatuses=['COD','مدفوع'];
export const paymentStatusOf=o=>{const n=parseInt((String(o.id).match(/\d+/g)||['0']).join('').slice(-3),10);return Number.isFinite(n)&&n%3===1?'مدفوع':'COD'};
export function createInitialState(legacy){
 const sellers=(legacy?.sellers||seedSellers.map((s,i)=>({...s,code:`SL-${String(i+1).padStart(4,'0')}`,business:stores.find(t=>t.sellerId===s.id)?.name||s.name,country:countries[i%4],plan:i%3?'Basic Plan':'Pro Plan',phone:'',email:'',status:i===7?'متوقف':'نشط',crm:crmStages[i],priority:['مرتفعة','متوسطة','منخفضة'][i%3],description:'',created:'2026-10-01'}))).map(marketerProfile);
 const orders=seedOrders.map((o,i)=>({...o,currency:'USD',phone:'',city:(citiesByCountry[o.country]||['الرياض'])[i%(citiesByCountry[o.country]?.length||1)],paymentStatus:paymentStatusOf(o),address:`عنوان تجريبي ${i+1}`,duplicate:i%19===0,upsell:o.quantity>1,changeRequested:i%31===0,...(!['جديد','جاري التأكيد'].includes(o.status)?{confirmedById:o.employeeId,confirmedAt:o.date+'T10:00:00.000Z'}:{})}));
 const shipments=orders.filter(o=>['مؤكد','قيد التجهيز',...shippingStatuses].includes(o.status)).map((o,i)=>({...o,id:o.id.replace('HL-','SHP-'),orderId:o.id,status:orderToShipment[o.status]||o.status,tracking:['مؤكد','قيد التجهيز','جاهز للشحن'].includes(o.status)?'':`DEMO-${610000+i}`,events:[],changeRequests:o.changeRequested?[{id:`change-${i}`,title:'مراجعة عنوان التوصيل',status:'معلق',at:o.date}]:[],arrivedAtWarehouse:o.status==='مرتجع'&&i%2===0,carrier:['أرامكس','سمسا','ناقل'][i%3],expectedDelivery:i%3===0&&o.date?new Date(Date.parse(o.date)+3*864e5).toISOString().slice(0,10):''}));
 const validations=shipments.filter(s=>['فشل التسليم','جاري الإرجاع','مرتجع'].includes(s.status)).slice(0,24).map((s,i)=>{
  const count=i%6===0?5:i%4,answered=i%3===1&&count>0;
  const attempts=Array.from({length:count},(_,n)=>({id:`VAL-${i+1}-A${n+1}`,result:n===count-1&&answered?'تم الرد':'لا يرد',outcome:n===count-1&&answered?'العميل أكد رغبته في الطلب':'لم نتمكن من الوصول للعميل',note:'سجل اتصال تجريبي',at:s.date+'T10:00:00.000Z'}));
  const status=i%7===2?'تم الإرسال لشركة الشحن':i%7===3?'جاري العمل عليه مع شركة الشحن':count?'قيد التنفيذ':'في الانتظار';
  const carrierUpdate={status:s.status,carrier:s.carrier||'غير محدد',tracking:s.tracking||'',at:s.failedAt||s.returnedAt||s.date};
  return {id:`VAL-${i+1}`,shipmentId:s.id,orderId:s.orderId,status,entryReason:s.status==='فشل التسليم'?'failed_delivery':'returned',enteredAt:s.date,employeeId:s.employeeId,attempts,carrierUpdate,carrierUpdates:['تم الإرسال لشركة الشحن','جاري العمل عليه مع شركة الشحن'].includes(status)?[{id:`VAL-${i+1}-C1`,status,note:'سجل إرسال تجريبي للمندوب المسؤول بالشركة',at:s.date+'T12:00:00.000Z'}]:[],history:[],confirmationReports:[],finalAction:'',source:'',classification:''};
 });
 return {version:3,orders,shipments,sellers,stores,managers,employees,tasks:legacy?.tasks||tasks,logs:legacy?.logs||[],validations,walletRequests:legacy?.walletRequests||seedWalletRequests(),orderReasons:legacy?.orderReasons||unifiedOrderReasons,shipmentReasons:legacy?.shipmentReasons||unifiedShipmentReasons,shippingProblemCases:legacy?.shippingProblemCases||defaultShippingProblemCases,pricingPlans:legacy?.pricingPlans||defaultPricingPlans,paymentMethods:legacy?.paymentMethods||defaultPaymentMethods()};
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
export const validationCallResults=['تم الرد','لم يرد','مشغول','رقم خطأ','الهاتف مغلق'];
export const validationCallOutcomes=result=>result==='تم الرد'
 ?['العميل أكد رغبته في الطلب','جاء مندوب فعلًا','لم يأتِ مندوب — الأبديت غير صحيح','العميل استلم فعلًا','العميل طلب الإلغاء','لم يتأكد بعد']
 :['لم نتمكن من الوصول للعميل','إعادة المحاولة لاحقًا'];
export const validationReportReasons=['العميل نفى تأكيد الطلب','بيانات التوصيل غير صحيحة','المنتج أو الكمية غير مطابقة','السعر أو طريقة الدفع غير مطابقة','أخرى'];
export const validationFinalActions=['إعادة شحن','تصعيد','متابعة'];
export const validationDecisionSources=['عميل','شحن','تأكيد','منتج'];
export const validationDecisionClassifications=['رقم خطأ','عنوان خطأ','غير جاد','لم يتصل','تأخير','رفض','تالف','تسليم مؤكد'];
const carrierSteps={
 send:{status:validationStatuses[2],title:'تسجيل الإحالة لشركة الشحن'},
 working:{status:validationStatuses[3],title:'بدء المتابعة مع شركة الشحن'},
 resolved:{status:validationStatuses[4],title:'تسجيل اكتمال معالجة شركة الشحن'},
};
export function validationCarrierOptions(status){
 const step=validationStatuses.indexOf(status);
 const key=step===0||step===1?'send':step===2?'working':step===3?'resolved':'';
 return key?[[key,carrierSteps[key].title]]:[];
}
export const validationDeliveryIntentTitle='العميل يريد الاستلام';
const validationDecisionTitles={received:'تأكيد استلام العميل',cancel:'إلغاء الشحن بقرار الإدارة','wants-delivery':validationDeliveryIntentTitle,final:'إغلاق حالة التحقق'};
export function canCancelValidationShipment(attempts,call){
 const last=call||attempts.at(-1);
 if(!last)return false;
 if(last.result==='تم الرد')return last.outcome==='العميل طلب الإلغاء';
 return [...validationCallResults.slice(1),'لا يرد'].includes(last.result)&&attempts.length+Number(Boolean(call))>=5;
}
const validationActor=(state,v)=>(state.employees||[]).find(e=>e.id===v.employeeId)?.name||'مدير النظام';
const validationActivity=(title,actor,at,summary)=>({id:crypto.randomUUID(),title,user:actor,time:new Date(at).toLocaleTimeString('ar-EG'),at,summary});

/* Commit the call and carrier action together only after validating both. */
export function recordValidationAction(state,id,{call,carrier,nextAction='followup',decisionNote='',approvedByManagement=false,finalAction:finalChoice,source,classification,at=new Date().toISOString()}){
 const current=state.validations.find(v=>v.id===id);
 const fail=error=>({state,error});
 if(!current||current.status===validationStatuses[4])return fail('حالة التحقق مغلقة أو غير متاحة.');
 const action=nextAction,attempts=current.attempts||[];
 if(!call&&!carrier&&action!=='cancel'&&action!=='wants-delivery')return fail('اختر إجراءً للحفظ.');
 if(call&&(!validationCallResults.includes(call.result)||!validationCallOutcomes(call.result).includes(call.outcome)))return fail('اختر حالة الاتصال ونتيجة التواصل.');
 if(action!=='followup'&&!Object.hasOwn(validationDecisionTitles,action))return fail('القرار غير متاح.');
 if(['received','final'].includes(action)&&!call)return fail('القرار يتطلب محاولة اتصال.');
 if(action==='wants-delivery'&&(call||current.deliveryRequestedAt))return fail('تم تسجيل رغبة العميل أو أن الإجراء غير متاح.');
 if(carrier&&(!validationCarrierOptions(current.status).some(([key])=>key===carrier.action)||!carrier.details?.trim()))return fail('اختر إجراءً متاحًا للشركة واكتب تفاصيله.');
 if(carrier&&action!=='followup')return fail('احفظ إجراء الشركة أو القرار بشكل منفصل.');
 if(nextAction==='received'&&call.outcome!=='العميل استلم فعلًا')return fail('أكد استلام العميل في نتيجة التواصل أولًا.');
 decisionNote=decisionNote.trim();
 if(action==='cancel'&&(!canCancelValidationShipment(attempts,call)||!approvedByManagement||decisionNote.length<20))return fail('إلغاء الشحن يحتاج طلب إلغاء من العميل أو خمس محاولات على الأقل عند عدم الرد، مع قرار الإدارة وسبب من 20 حرفًا على الأقل.');
 if(action==='final'&&(!validationFinalActions.includes(finalChoice)||!validationDecisionSources.includes(source)||!validationDecisionClassifications.includes(classification)))return fail('أكمل بيانات القرار النهائي.');
 const actor=validationActor(state,current),actorId=current.employeeId||'';
 const note=call?.note?.trim()||'';
 const attempt=call?{id:crypto.randomUUID(),result:call.result,outcome:call.outcome,note,nextAction:action,actor,actorId,at}:null;
 const step=carrier?carrierSteps[carrier.action]:null;
 const carrierEvent=step?{id:crypto.randomUUID(),type:'carrier',action:carrier.action,status:step.status,title:step.title,note:carrier.details.trim(),actor,actorId,at}:null;
 const closed=['received','cancel','final'].includes(action)||carrier?.action==='resolved';
 const finalAction=action==='received'?'تأكيد استلام العميل':action==='cancel'?'إلغاء نهائي':action==='final'?finalChoice:closed?'تمت معالجة شركة الشحن':current.finalAction;
 const decision=action!=='followup'?{id:crypto.randomUUID(),type:'decision',title:validationDecisionTitles[action],summary:action==='cancel'?decisionNote:action==='wants-delivery'?decisionNote||'يرغب العميل في استلام الشحنة.':finalAction,actor,actorId,at}:null;
 const validation={...current,status:closed?validationStatuses[4]:step?.status||(current.status===validationStatuses[0]?validationStatuses[1]:current.status),
  attempts:attempt?[...attempts,attempt]:attempts,carrierUpdates:carrierEvent?[...(current.carrierUpdates||[]),carrierEvent]:current.carrierUpdates||[],
  history:decision?[...(current.history||[]),decision]:current.history||[],
  ...(action==='wants-delivery'?{deliveryRequestedAt:at}:{}),
  ...(closed?{finalAction,source:action==='received'?'عميل':source||current.source,classification:action==='received'?'تسليم مؤكد':classification||current.classification,cancellationDetails:action==='cancel'?decisionNote:current.cancellationDetails||'',closedAt:at}:{})};
 let orders=state.orders,shipments=state.shipments;
 if(closed&&(['received','cancel'].includes(action)||finalAction==='إعادة شحن')){
  const received=action==='received',cancelled=action==='cancel';
  const nextStatus=received?'تم التسليم':cancelled?'ملغية':'قيد الانتظار',orderStatus=received?'تم التسليم':'مؤكد';
  const event={at,title:received?'تأكيد استلام العميل عبر الفالديشن':cancelled?'إلغاء الشحنة عبر الفالديشن':'إعادة الشحن عبر الفالديشن',summary:received?'أكد العميل استلام الشحنة أثناء التحقق؛ أُغلقت حالة الفالديشن.':cancelled?`قرار الفالديشن — ${decisionNote}`:'قرار فريق الفالديشن بإعادة الشحنة.'};
  shipments=shipments.map(s=>s.id===current.shipmentId?{...s,status:nextStatus,modified:true,...(received?{deliveredAt:at.slice(0,10),cancellationCategory:'',cancellationDetails:''}:cancelled?{cancellationCategory:'قرار الفالديشن',cancellationDetails:decisionNote}:{tracking:'',shippedAt:''}),events:[...(s.events||[]),event]}:s);
  if(!cancelled)orders=orders.map(o=>o.id===current.orderId?{...o,status:orderStatus,updatedAt:at,cancellationCategory:'',cancellationDetails:'',cancellationReason:''}:o);
 }
 const entries=[attempt&&['تسجيل محاولة اتصال',`${attempt.result} · ${attempt.outcome}${note?' — '+note:''}`],carrierEvent&&[carrierEvent.title,carrierEvent.note],decision&&[decision.title,decision.summary]].filter(Boolean);
 orders=orders.map(o=>o.id===current.orderId?{...o,activity:[...entries.map(([title,summary])=>validationActivity(title,actor,at,summary)),...(o.activity||[])]}:o);
 return {state:{...state,validations:state.validations.map(v=>v.id===id?validation:v),orders,shipments}};
}
export function applyValidationAction(id,payload){
 const result=recordValidationAction(read(),id,payload);
 if(!result.error)updateStore(()=>result.state);
 return result.error;
}
export function addValidationConfirmationReport(state,id,{category,details,at=new Date().toISOString()}){
 const current=state.validations.find(v=>v.id===id);
 if(!current||!validationReportReasons.includes(category)||details.trim().length<20)return {state,error:'اختر نوع المشكلة واكتب تفاصيلها في 20 حرفًا على الأقل.'};
 const actor=validationActor(state,current);
 const report={id:crypto.randomUUID(),validationId:id,orderId:current.orderId,category,details:details.trim(),reportedById:current.employeeId||'',reportedAt:at,confirmedById:state.orders.find(o=>o.id===current.orderId)?.confirmedById||''};
 const title='بلاغ عن مشكلة في تأكيد الطلب',summary=category+' — '+report.details;
 return {state:{...state,validations:state.validations.map(v=>v.id===id?{...v,confirmationReports:[...(v.confirmationReports||[]),report],history:[...(v.history||[]),{id:report.id,type:'confirmation-report',title,summary,actor,at}]}:v),orders:state.orders.map(o=>o.id===current.orderId?{...o,confirmationReports:[...(o.confirmationReports||[]),report],activity:[validationActivity(title,actor,at,summary),...(o.activity||[])]}:o),shipments:state.shipments.map(s=>s.id===current.shipmentId?{...s,events:[...(s.events||[]),{at,title,summary,actor}]}:s)}};
}
export function reportConfirmationIssue(id,payload){
 const result=addValidationConfirmationReport(read(),id,payload);
 if(!result.error)updateStore(()=>result.state);
 return result.error;
}
let memory;
function read(){if(memory)return memory;let current,legacy;try{current=JSON.parse(sessionStorage.getItem('hala-admin-v2'));legacy=JSON.parse(sessionStorage.getItem('hala-seller-crm-v1'))}catch{}if(current?.version===2)current={...current,version:3,orderReasons:current.orderReasons||unifiedOrderReasons,shipmentReasons:current.shipmentReasons||unifiedShipmentReasons};if(current?.version===3&&!Array.isArray(current.pricingPlans))current={...current,pricingPlans:defaultPricingPlans};if(current?.version===3&&current.pricingPlans&&Array.isArray(current.pricingPlans)&&current.pricingPlans[0]&&!('packing' in current.pricingPlans[0]))current={...current,pricingPlans:current.pricingPlans.map(p=>({packing:0,shipped:0,...defaultPricingPlans.find(x=>x.id===p.id),...p}))};if(current?.version===3&&Array.isArray(current.orders))current={...current,orders:current.orders.map(o=>{let next=o.paymentStatus?o:{...o,paymentStatus:paymentStatusOf(o)};if(!next.confirmedById&&!['جديد','جاري التأكيد'].includes(next.status))next={...next,confirmedById:next.employeeId||'',confirmedAt:next.confirmedAt||(next.date?next.date+'T10:00:00.000Z':'')};return next})};if(current?.version===3&&Array.isArray(current.shipments))current={...current,shipments:current.shipments.map((s,i)=>s.carrier!==undefined&&s.expectedDelivery!==undefined?s:{...s,carrier:s.carrier!==undefined?s.carrier:['أرامكس','سمسا','ناقل'][i%3],expectedDelivery:s.expectedDelivery!==undefined?s.expectedDelivery:i%3===0&&s.date?new Date(Date.parse(s.date)+3*864e5).toISOString().slice(0,10):''})};if(current?.version===3&&(['orders','shipments','sellers','tasks','logs','validations'].every(k=>Array.isArray(current[k])))&&!Array.isArray(current.walletRequests))current={...current,walletRequests:seedWalletRequests()};if(current?.version===3&&Array.isArray(current.orders)&&!Array.isArray(current.paymentMethods))current={...current,paymentMethods:defaultPaymentMethods()};if(current?.version===3&&Array.isArray(current.orders)&&!Array.isArray(current.shippingProblemCases))current={...current,shippingProblemCases:defaultShippingProblemCases};if(current?.version===3&&Array.isArray(current.validations)&&Array.isArray(current.shipments))current={...current,validations:current.validations.map(v=>{const s=current.shipments.find(x=>x.id===v.shipmentId);return {...v,attempts:Array.isArray(v.attempts)?v.attempts:[],carrierUpdate:v.carrierUpdate||{status:s?.status||'',carrier:s?.carrier||'غير محدد',tracking:s?.tracking||'',at:s?.failedAt||s?.returnedAt||s?.date||v.enteredAt},carrierUpdates:Array.isArray(v.carrierUpdates)?v.carrierUpdates:[],history:Array.isArray(v.history)?v.history:[],confirmationReports:Array.isArray(v.confirmationReports)?v.confirmationReports:[]}})};memory=current?.version===3&&['orders','shipments','sellers','tasks','logs','validations'].every(k=>Array.isArray(current[k]))?current:createInitialState(legacy);return memory}
const listeners=new Set();
export const getSnapshot=()=>read();
export const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
export function updateStore(updater){memory=updater(read());try{sessionStorage.setItem('hala-admin-v2',JSON.stringify(memory));sessionStorage.setItem('hala-seller-crm-v1',JSON.stringify({sellers:memory.sellers,tasks:memory.tasks,logs:memory.logs}))}catch{}listeners.forEach(fn=>fn())}
export const setOrders=fn=>updateStore(s=>replaceOrders(s,typeof fn==='function'?fn(s.orders):fn));
export const setShipments=fn=>updateStore(s=>replaceShipments(s,typeof fn==='function'?fn(s.shipments):fn));
export const setCRM=fn=>updateStore(s=>replaceCRM(s,typeof fn==='function'?fn({sellers:s.sellers,tasks:s.tasks,logs:s.logs}):fn));
export const setReasons=(kind,fn)=>updateStore(s=>({...s,[kind]:typeof fn==='function'?fn(s[kind]||[]):fn}));
export const setPlans=fn=>updateStore(s=>({...s,pricingPlans:typeof fn==='function'?fn(s.pricingPlans||[]):fn}));
export const setWalletRequests=fn=>updateStore(s=>({...s,walletRequests:typeof fn==='function'?fn(s.walletRequests||[]):fn}));
export const setPaymentMethods=fn=>updateStore(s=>({...s,paymentMethods:typeof fn==='function'?fn(s.paymentMethods||defaultPaymentMethods()):fn}));
export const setShippingProblemCases=fn=>updateStore(s=>({...s,shippingProblemCases:typeof fn==='function'?fn(s.shippingProblemCases||[]):fn}));
export function patchWalletRequest(id,patch){const now=new Date();const inTz=new Date(now.getTime()-now.getTimezoneOffset()*60000);const stamp=`${String(inTz.getDate()).padStart(2,'0')}/${String(inTz.getMonth()+1).padStart(2,'0')} ${String(inTz.getHours()).padStart(2,'0')}:${String(inTz.getMinutes()).padStart(2,'0')}`;updateStore(s=>({...s,walletRequests:(s.walletRequests||[]).map(r=>r.id===id?{...r,...patch,activity:[{id:crypto.randomUUID(),title:patch._activityTitle||'تحديث على الطلب',user:'مدير النظام',at:stamp},...(r.activity||[])]}:r)}))}
