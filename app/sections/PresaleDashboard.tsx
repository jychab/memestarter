import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { FC } from "react";
import Image from "next/image";
import solanaLogo from "./../public/solanaLogoMark.png";
import {
  convertSecondsToNearestUnit,
  separateNumberWithComma,
} from "../utils/helper";

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
}) => {
  return (
    <div className="grid grid-cols-10 items-end justify-center gap-4">
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
            {`${separateNumberWithComma(
              (totalSupply / 10 ** decimal).toString()
            )} ${symbol}`}
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
    </div>
  );
};

export default PresaleDashboard;
