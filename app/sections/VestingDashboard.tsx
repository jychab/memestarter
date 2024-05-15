import Link from "next/link";
import { FC } from "react";
import { Tooltip } from "../components/Tooltip";
import {
  convertSecondsToNearestUnit,
  convertToCustomFormat,
  creatorsShareTooltipContent,
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
  totalLpClaimed: number;
  totalMintClaimed: number;
  initialSupply: number;
  liquidityPoolSupply: number;
  amountLpReceived: number;
  description?: string;
  creatorFeeBasisPoints: number;
  lpMint?: string;
  mint: string;
}

export const VestingDashboard: FC<VestingDashboardProps> = ({
  price,
  vestingStartedAt,
  totalSupply,
  decimal,
  totalLpClaimed,
  amountLpReceived,
  symbol,
  vestingPeriod,
  totalMintClaimed,
  initialSupply,
  description,
  mint,
  lpMint,
  creatorFeeBasisPoints,
  liquidityPoolSupply,
}) => {
  return (
    <div className="grid grid-cols-9 items-end justify-center overflow-x-auto gap-4">
      <div className="col-span-3 flex flex-col gap-1">
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
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm text-black">
            {`${formatLargeNumber(totalSupply / 10 ** decimal)}`}
          </span>
        </div>
        <span className="text-[10px]">{`total supply`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">
          {`${(totalMintClaimed && initialSupply
            ? (totalMintClaimed / initialSupply) * 100
            : 0
          ).toFixed(2)}%`}
        </span>
        <span className="text-[10px]">{`mint claimed`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${(totalLpClaimed &&
        amountLpReceived
          ? (totalLpClaimed / amountLpReceived) * 100
          : 0
        ).toFixed(2)}%`}</span>
        <span className="text-[10px]">{`LP claimed`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-black">
            {creatorFeeBasisPoints / 100 + "%"}
          </span>
          <Tooltip
            content={creatorsShareTooltipContent(
              creatorFeeBasisPoints / 100,
              totalSupply,
              liquidityPoolSupply,
              decimal
            )}
          />
        </div>
        <span className="text-[10px]">{`creator's share`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <Link
            className={
              "text-blue-600 hover:text-blue-700 text-xs truncate max-w-16 md:max-w-24"
            }
            href={`https://solana.fm/address/${mint}`}
            target="_blank"
          >
            {mint}
          </Link>
        </div>
        <span className="text-[10px]">{`mint address`}</span>
      </div>
      {lpMint && (
        <div className="col-span-3 flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <Link
              className={
                "text-blue-600 hover:text-blue-700 text-xs truncate max-w-16 md:max-w-24"
              }
              href={`https://solana.fm/address/${lpMint}`}
              target="_blank"
            >
              {lpMint}
            </Link>
          </div>
          <span className="text-[10px]">{`LP mint address`}</span>
        </div>
      )}
      {description && (
        <span className="uppercase text-xs col-span-10">About</span>
      )}
      {description && (
        <span className="text-xs text-black line-clamp-3 col-span-10">
          {description}
        </span>
      )}
    </div>
  );
};

export default VestingDashboard;
