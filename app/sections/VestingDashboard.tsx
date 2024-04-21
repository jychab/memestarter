import React, { FC } from "react";
import {
  convertSecondsToNearestUnit,
  convertToCustomFormat,
  formatLargeNumber,
} from "../utils/helper";

interface VestingDashboardProps {
  symbol: string;
  decimal: number;
  price?: number;
  totalSupply: number;
  vestingPeriod: number;
  uniqueBackers: number;
  vestingStartedAt: number;
  totalClaimed: number;
  amountLpReceived: number;
  description?: string;
}

export const VestingDashboard: FC<VestingDashboardProps> = ({
  price,
  vestingStartedAt,
  totalSupply,
  decimal,
  totalClaimed,
  amountLpReceived,
  symbol,
  vestingPeriod,
  description,
}) => {
  return (
    <div className="grid grid-cols-10 items-end justify-center overflow-x-auto gap-4">
      <div className="col-span-4 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm text-black">
            {price
              ? "$" + formatLargeNumber((price * totalSupply) / 10 ** decimal)
              : 0}
          </span>
        </div>
        <span className="text-[10px]">{`market cap`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${
          price ? "$" + convertToCustomFormat(price) : 0
        }`}</span>
        <span className="text-[10px]">{`price`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${
          vestingStartedAt + vestingPeriod > Date.now() / 1000
            ? convertSecondsToNearestUnit(
                vestingStartedAt + vestingPeriod - Date.now() / 1000
              )
                .split(" ")
                .slice(0, 2)
                .join(" ")
            : "Ended"
        }`}</span>
        <span className="text-[10px]">{`till vesting end`}</span>
      </div>
      <div className="col-span-4 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm text-black">
            {`${formatLargeNumber(totalSupply / 10 ** decimal)} ${symbol}`}
          </span>
        </div>
        <span className="text-[10px]">{`total supply`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">
          {Math.min(
            ((Date.now() / 1000 - vestingStartedAt) * 100) / vestingPeriod,
            100
          ).toFixed(2) + "%"}
        </span>
        <span className="text-[10px]">{`LP unlocked`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${(totalClaimed &&
        amountLpReceived
          ? (totalClaimed / amountLpReceived) * 100
          : 0
        ).toFixed(2)}%`}</span>
        <span className="text-[10px]">{`LP claimed`}</span>
      </div>
      {description && (
        <span className="uppercase text-xs col-span-10">About</span>
      )}
      {description && (
        <span className="text-[10px] sm:text-xs text-black text-wrap truncate col-span-10">
          {description}
        </span>
      )}
    </div>
  );
};

export default VestingDashboard;
