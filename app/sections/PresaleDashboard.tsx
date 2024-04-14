import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { FC } from "react";
import Image from "next/image";
import solanaLogo from "./../public/solanaLogoMark.png";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
} from "../utils/helper";
import { CollectionDetails } from "../utils/types";
import { Chip } from "../components/Chip";

interface PresaleDashboardProps {
  symbol: string;
  decimal: number;
  totalSupply: number;
  vestedSupply: number;
  vestingPeriod: number;
  uniqueBackers: number;
  liquidityCollected: number;
  presaleTimeLimit: number;
  presaleTarget: number;
  description?: string;
  collectionsRequired?: CollectionDetails[] | null;
}

export const PresaleDashboard: FC<PresaleDashboardProps> = ({
  liquidityCollected,
  presaleTarget,
  uniqueBackers,
  presaleTimeLimit,
  totalSupply,
  decimal,
  symbol,
  vestedSupply,
  vestingPeriod,
  description,
  collectionsRequired,
}) => {
  return (
    <div className="grid grid-cols-10 items-end justify-center overflow-x-auto gap-4">
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
      <div className="col-span-4 flex flex-col gap-1">
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
          convertSecondsToNearestUnit(
            presaleTimeLimit - Date.now() / 1000
          ).split(" ")[0]
        }`}</span>
        <span className="text-[10px]">{`${
          convertSecondsToNearestUnit(
            presaleTimeLimit - Date.now() / 1000
          ).split(" ")[1]
        } to go`}</span>
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
          {((vestedSupply / totalSupply) * 100).toString() + "%"}
        </span>
        <span className="text-[10px]">{`vested supply`}</span>
      </div>
      <div className="col-span-3 flex flex-col gap-1">
        <span className="text-sm text-black">{`${convertSecondsToNearestUnit(
          vestingPeriod
        )}`}</span>
        <span className="text-[10px]">{`vesting period`}</span>
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

export default PresaleDashboard;
