import React from 'react';

export default function PassportSummary({ product }: { product: any }) {
  return (
    <div className="bg-[#fdf1ec] rounded-2xl p-6 border border-black/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-[#538ea1] rounded-full" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#538ea1]">Product Passport Data</h3>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        <PassportItem label="GTIN-14" value={product.gtin?.value || '—'} />
        <PassportItem label="Origin" value={product.countryOfOrigin || 'Not set'} />
        <PassportItem label="Material" value={product.materialComposition || 'Not set'} />
        <PassportItem label="Recyclable" value={product.recyclable ? 'Yes' : 'No'} />
      </div>
    </div>
  );
}

function PassportItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-tighter text-[#827376]">{label}</span>
      <span className="text-sm font-medium text-[#201a17]">{value}</span>
    </div>
  );
}
