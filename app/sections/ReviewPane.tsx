import React, { FC } from "react";
import Image from "next/image";
import { Status } from "../utils/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  separateNumberWithComma,
} from "../utils/helper";
import solanaLogo from "./../public/solanaLogoMark.png";

interface ReviewPaneProps {
  image: string;
  name: string;
  symbol: string;
  mint?: string;
  decimal: number;
  externalUrl?: string;
  totalSupply: number;
  vestedSupply: number;
  creatorFees?: number;
  vestingPeriod: number;
  uniqueBackers?: number;
  vestingStartedAt?: number;
  vestingEndingAt?: number;
  liquidityCollected?: number;
  status?: Status;
  presaleTimeLimit?: number;
  maxPresaleTime?: number;
  presaleTarget: number;
  description?: string;
}

export const ReviewPane: FC<ReviewPaneProps> = ({
  image,
  name,
  symbol,
  totalSupply,
  mint,
  vestedSupply,
  vestingPeriod,
  externalUrl,
  creatorFees,
  maxPresaleTime,
  uniqueBackers,
  vestingStartedAt,
  vestingEndingAt,
  liquidityCollected = 0,
  presaleTimeLimit = 0,
  presaleTarget = 0,
  status,
  decimal: decimals,
  description,
}) => {
  return (
    <div className="flex flex-col text-gray-400 font-medium p-4 rounded gap-8">
      <div className="flex gap-8">
        <div className="relative h-40 w-40 lg:w-60 lg:h-60">
          <Image
            className={`rounded object-cover cursor-pointer`}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={image}
            alt={""}
          />
        </div>
        <div className="flex flex-col text-xs gap-2 ">
          <span>Name</span>
          <span className=" text-black">{name}</span>
          <span>Symbol</span>
          <span className="text-black">{symbol}</span>
          <span>Decimals</span>
          <span className=" text-black">{decimals}</span>
          {mint && <span>Mint Address</span>}
          {mint && (
            <span className="w-24 lg:w-full truncate text-black">{mint}</span>
          )}
        </div>
      </div>
      {status && (
        <div className="grid grid-cols-10 items-end justify-center gap-4">
          <div className="col-span-4 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-black">
                {`${liquidityCollected / LAMPORTS_PER_SOL}`}
              </span>
              <Image
                width={16}
                height={16}
                src={solanaLogo}
                alt={"solana logo"}
              />
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
                  (totalSupply / 10 ** decimals).toString()
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
      )}
      <div className="grid grid-cols-6 items-center gap-4 text-xs">
        {!status && description && (
          <span className="col-span-2 sm:col-span-1">Description</span>
        )}
        {!status && description && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {description}
          </span>
        )}
        {!status && externalUrl && (
          <span className="col-span-2 sm:col-span-1">External Url</span>
        )}
        {!status && externalUrl && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {externalUrl}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Total Supply</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {separateNumberWithComma(totalSupply.toString()) + ` ${symbol}`}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Vested Supply</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-black">
            {((vestedSupply / totalSupply) * 100).toString() + "%"}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Vesting Period</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-black">
            {convertSecondsToNearestUnit(vestingPeriod)}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Presale Target</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-black">
            {presaleTarget / LAMPORTS_PER_SOL + ` Sol`}
          </span>
        )}
        {maxPresaleTime && (
          <span className="col-span-2 sm:col-span-1">Max Presale Duration</span>
        )}
        {maxPresaleTime && (
          <span className="col-span-4 sm:col-span-2 text-black">
            {convertSecondsToNearestUnit(maxPresaleTime)}
          </span>
        )}
        {creatorFees && (
          <span className="col-span-2 sm:col-span-1">Creator Fees</span>
        )}
        {creatorFees && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {creatorFees / 100 + "%"}
          </span>
        )}
      </div>
    </div>
  );
};
