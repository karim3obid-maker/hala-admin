export function updateSellerSelection(crm,ids,patch,title,at=new Date().toISOString()){
 const allowed=new Set(['plan','managerId','status']);
 const changes=Object.fromEntries(Object.entries(patch).filter(([key])=>allowed.has(key)));
 const selected=new Set(ids),existing=crm.sellers.filter(s=>selected.has(s.id));
 return {...crm,sellers:crm.sellers.map(s=>selected.has(s.id)?{...s,...changes}:s),logs:[...existing.map(s=>({id:crypto.randomUUID(),sellerId:s.id,type:'النظام',text:'إجراء جماعي: '+title,time:new Date(at).toLocaleString('ar-EG',{timeZone:'Africa/Cairo'}),at})),...crm.logs]};
}
