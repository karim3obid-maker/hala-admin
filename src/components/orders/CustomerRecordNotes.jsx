export function CustomerRecordNotes({order}){
  const notes=[['ملاحظات العميل',order.customerNote],['ملاحظات الفريق على الطلب',order.teamNote]].filter(([,value])=>value?.trim());
  if(!notes.length)return <p className="fc-empty">لا توجد ملاحظات محفوظة على العميل في هذا الطلب.</p>;
  return <dl className="ow-record-notes">{notes.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
