import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Chip } from "../components/Chip";
import { Tooltip } from "../components/Tooltip";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
} from "../utils/helper";
import { CollectionDetails } from "../utils/types";
import solanaLogo from "./../public/solanaLogoMark.png";

interface PresaleDashboardProps {
  symbol: string;
  decimal: number;
  totalSupply: number;
  vestingPeriod: number;
  uniqueBackers: number;
  liquidityCollected: number;
  presaleTimeLimit: number;
  presaleTarget: number;
  liquidityPoolSupply: number;
  description?: string;
  creatorFeeBasisPoints: number;
  lpMint?: string;
  mint: string;
  collectionsRequired?: CollectionDetails[] | null;
}

export const PresaleDashboard: FC<PresaleDashboardProps> = ({
  liquidityCollected,
  presaleTarget,
  uniqueBackers,
  presaleTimeLimit,
  totalSupply,
  liquidityPoolSupply,
  decimal,
  mint,
  lpMint,
  creatorFeeBasisPoints,
  description,
  vestingPeriod,
  collectionsRequired,
}) => {
  const creatorsShareTooltipContent = (
    creatorFee: number,
    supply: number,
    initialLpSupply: number
  ) => {
    return `This denotes the amount of tokens the creator will receive from the total supply.\n\nUpon Launch = ${formatLargeNumber(
      ((supply - initialLpSupply) * (creatorFee / 100)) / 10 ** decimal
    )} in tokens\nVesting = ${creatorFee}% of LP tokens`;
  };
  return (
    <div className="grid grid-cols-9 items-center justify-evenly overflow-x-auto gap-x-2 gap-y-4">
      {collectionsRequired && (
        <div className="col-span-10">
          <div className="flex-col flex gap-2 bg-gray-100 rounded p-2">
            <span className="text-[10px] sm:text-xs font-medium">
              Whitelisted Collections:
            </span>
            <div className="flex flex-wrap gap-2 ">
              {collectionsRequired.map((item) => (
                <Chip
                  key={item.mintAddress}
                  k={item.name}
                  textColor="text-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm text-black">
            {`${liquidityCollected / LAMPORTS_PER_SOL}`}
          </span>
          <Image width={16} height={16} src={solanaLogo} alt={"solana logo"} />
        </div>
        <span className="text-[10px]">{`of ${
          presaleTarget / LAMPORTS_PER_SOL
        } Sol funded`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{uniqueBackers}</span>
        <span className="text-[10px]">{`unique backers`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${
          presaleTimeLimit - Date.now() / 1000 > 0
            ? convertSecondsToNearestUnit(presaleTimeLimit - Date.now() / 1000)
                .split(" ")
                .slice(0, 2)
                .join(" ")
            : "Ended"
        }`}</span>
        <span className="text-[10px]">{`till presale end`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm text-black">
            {formatLargeNumber(totalSupply / 10 ** decimal)}
          </span>
        </div>
        <span className="text-[10px]">{`total supply`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-black">
            {((liquidityPoolSupply * 100) / totalSupply).toString() + "%"}
          </span>
          <Tooltip
            content={
              "This denotes the amount of tokens used to create the initial liquidity pool."
            }
          />
        </div>
        <span className="text-[10px]">{`initial LP supply`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-black">{`${convertSecondsToNearestUnit(
            vestingPeriod
          )}`}</span>
          <Tooltip
            content={"LP tokens will be unlocked linearly over this duration."}
          />
        </div>
        <span className="text-[10px]">{`vesting duration`}</span>
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
              liquidityPoolSupply
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
        <span className="text-xs text-black text-wrap truncate col-span-10">
          {description}
        </span>
      )}
    </div>
  );
};

export default PresaleDashboard;
