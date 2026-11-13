const KEY='hala-product-suppliers-v1';
export const supplierTypes=['مصنّع','موزّع','تاجر جملة'];
const seeds=[['sup-1','مورد المنزل التجريبي','موزّع'],['sup-2','مورد التقنية التجريبي','تاجر جملة'],['sup-3','مورد العناية التجريبي','مصنّع']].map(([id,name,type])=>({id,name,type,contact:'',phone:'',email:'',website:'',country:'السعودية',address:'',active:true,created:'2026-10-01'}));
export const seedSupplierId=id=>({p1:'sup-1',p5:'sup-1',p2:'sup-2',p4:'sup-2',p3:'sup-3',p6:'sup-3'}[id]||'');
export function readSupplierDB(){try{const data=JSON.parse(sessionStorage.getItem(KEY));if(data?.suppliers)return data;}catch{}return {suppliers:seeds,links:{}};}
export function saveSupplierDB(data){sessionStorage.setItem(KEY,JSON.stringify(data));}
export function supplierForProduct(product,db){return db.links?.[product.id]??product.supplierId??({'مورد تجريبي 1':'sup-1','مورد تجريبي 2':'sup-2','مورد تجريبي 3':'sup-3'}[product.supplier]||seedSupplierId(product.id));}
const shippedOrders=['تم الالتقاط','قيد النقل','خرج للتسليم','تعذر التسليم','تم التسليم','جاري الإرجاع','مرتجع'];
const shippedShipments=['تم الشحن','في الطريق','تحت محاولة التسليم','فشل التسليم','تم التسليم','جاري الإرجاع','مرتجع'];
export function supplierOrderLines(products,orders,shipments){
 const ids=new Set(products.map(p=>p.id));
 return orders.flatMap(order=>{
  const shipment=shipments.find(s=>s.orderId===order.id);
  const shipped=shippedOrders.includes(order.status)||shippedShipments.includes(shipment?.status);
  const quantities=new Map();
  for(const item of order.items||[{productId:order.productId,quantity:order.quantity}])if(ids.has(item.productId))quantities.set(item.productId,(quantities.get(item.productId)||0)+Math.max(0,Number(item.quantity)||0));
  return [...quantities].map(([productId,quantity])=>({orderId:order.id,date:order.date,productId,quantity,status:order.status,withdrawn:shipped?quantity:0,returned:shipped&&shipment?.arrivedAtWarehouse?quantity:0,delivered:order.status==='تم التسليم'?quantity:0,sellerId:order.sellerId}));
 }).sort((a,b)=>b.date.localeCompare(a.date)||b.orderId.localeCompare(a.orderId));
}
