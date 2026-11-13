const KEY='hala-product-categories-v1';
export const seedCategories=[
 ['toys','ألعاب','ألعاب وهدايا للترفيه وتنمية المهارات.'],
 ['beauty','منتجات تجميل','منتجات التجميل والعناية بالبشرة والشعر.'],
 ['electronics','إلكترونيات','أجهزة إلكترونية وإكسسوارات تقنية.'],
 ['fashion','ملابس وأزياء','ملابس وإكسسوارات لمختلف الأذواق.'],
 ['travel','مستلزمات رحلات','تجهيزات السفر والتخييم والرحلات.'],
 ['baby','مستلزمات أطفال','احتياجات الأطفال والعناية اليومية.'],
 ['variety','منتجات متنوعة','منتجات متنوعة للاستخدام اليومي.'],
 ['test','test','منتجات الاختبار والتجربة قبل اعتمادها.'],
 ['health','صحة','مستلزمات الصحة والعناية الشخصية.'],
 ['home','المنزل','أدوات وتنظيم واحتياجات المنزل.'],
].map(([id,name,description],order)=>({id,name,description,order,active:true,image:`/assets/categories/${id}.jpg`,aliases:[]}));
export function readCategories(){try{const saved=JSON.parse(sessionStorage.getItem(KEY));return Array.isArray(saved)?saved:seedCategories;}catch{return seedCategories;}}
export function saveCategories(items){sessionStorage.setItem(KEY,JSON.stringify(items));}
export function resolveCategoryName(name,items=readCategories()){return items.find(c=>c.name===name||c.aliases?.includes(name))?.name||name;}
export function categoryUsage(category){
 const names=[category.name,...(category.aliases||[])];
 const seeded=['إلكترونيات','إلكترونيات','منتجات متنوعة','test','المنزل','ألعاب'];
 let saved=[];try{saved=JSON.parse(sessionStorage.getItem('hala-products-v1'))||[];}catch{}
 return seeded.filter(n=>names.includes(n)).length+saved.filter(p=>names.includes(p.category)).length;
}
