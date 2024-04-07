import React, { FC } from "react";

export interface AttributeProps {
  k: string;
  v: string;
  bgColor?: string;
  textColor?: string;
  dismiss?: () => void;
}
export const Chip: FC<AttributeProps> = ({
  k,
  v,
  textColor = "bg-blue-500",
  bgColor = "bg-blue-700",
  dismiss,
}) => (
  <div
    className={`flex items-center gap-2 max-w-28 w-fit overflow-hidden pt-1 pb-1 px-2 text-sm ${bgColor} rounded  ${textColor}`}
  >
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-ellipsis overflow-hidden text-xs whitespace-nowrap">
        {k}
      </span>
      <span className="text-ellipsis overflow-hidden text-xs whitespace-nowrap">
        {v}
      </span>
    </div>

    <button
      className={`${textColor} hover:${textColor}/50 focus:outline-none`}
      hidden={!dismiss}
      onClick={dismiss}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        className="w-4 h-4"
      >
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" />
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" />
      </svg>
    </button>
  </div>
);
