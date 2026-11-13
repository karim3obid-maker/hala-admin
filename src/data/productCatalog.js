import {products as seedProducts,countries} from './adminAnalytics';
import {seedCategories,resolveCategoryName} from './productCategories';
const categories=seedCategories.map(c=>c.name);
const countryList=[...countries,'البحرين','قطر'];
export const initial=()=>seedProducts.map((p,i)=>({id:p.id,name:p.name,sku:`DEMO-${String(i+1).padStart(3,'0')}`,stock:[65,600,207,5350,2306,2000][i],cost:p.cost,price:p.price,currency:'SAR',category:resolveCategoryName(categories[[2,2,6,7,9,0][i]]),country:countryList[i%countryList.length],status:i%3?'نشط':'غير نشط',type:i%4===0?'merchant':i%3===0?'test':'affiliate',image:`/assets/demo-products/${p.id}.jpg`,updated:`2026-10-${String(24-i).padStart(2,'0')}`}));
export const readSaved=()=>{try{return (JSON.parse(sessionStorage.getItem('hala-products-v1'))||[]).map(p=>({...p,category:resolveCategoryName(p.category)}))}catch{return[]}};
export const persist=list=>{try{sessionStorage.setItem('hala-products-v1',JSON.stringify(list))}catch{}};

export const readCatalogProducts=()=>[...readSaved(),...initial()];
