import React, { ReactNode } from "react";

export default function Header({
  heading,
  description,
  leftComponent,
  type
}: {
  heading: ReactNode;
  description?: string;
  leftComponent: ReactNode;
  type?: 'less-padding'
}) {
  return (
    <div className={`w-full border-b border-b-[#E5E7EB] flex justify-between items-center ${type === 'less-padding' ? " p-3" : "p-5"}`}>
      <div>
        <h1 className="text-[#424242] text-[28px] font-bold">{heading}</h1>
        <p className="text-[#D3D1CB] text-[16px] font-semibold">
          {description}
        </p>
      </div>
      <div>{leftComponent}</div>
    </div>
  );
}
