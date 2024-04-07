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
  uniqueWallets?: number;
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
  uniqueWallets = 700,
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
    <div className="flex flex-col text-gray-400 p-4 rounded gap-8">
      <div className="flex gap-8">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          priority={true}
          className="w-2/3 max-w-64 h-auto rounded"
          src={image}
          alt={""}
        />
        <div className="flex flex-col text-xs gap-2 ">
          <span>Name</span>
          <span className=" text-gray-200">{name}</span>
          <span>Symbol</span>
          <span className="text-gray-200">{symbol}</span>
          <span>Decimals</span>
          <span className=" text-gray-200">{decimals}</span>
          {mint && <span>Mint Address</span>}
          {mint && <span className="w-24 truncate text-gray-200">{mint}</span>}
        </div>
      </div>
      {status && (
        <div className="grid grid-cols-10 items-end justify-center gap-4">
          <div className="col-span-4 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-white">
                {`${liquidityCollected / LAMPORTS_PER_SOL}`}
              </span>
              <Image
                width={0}
                height={0}
                sizes="100vw"
                className="h-auto w-4"
                src={solanaLogo}
                alt={"solana logo"}
              />
            </div>
            <span className="text-[10px]">{`of ${
              presaleTarget / LAMPORTS_PER_SOL
            } Sol funded`}</span>
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-sm text-white">{uniqueWallets}</span>
            <span className="text-[10px]">{`unqiue wallets`}</span>
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-sm text-white">{`${
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
              <span className="text-sm text-white">
                {`${separateNumberWithComma(
                  (totalSupply / 10 ** decimals).toString()
                )} ${symbol}`}
              </span>
            </div>
            <span className="text-[10px]">{`total supply`}</span>
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-sm text-white">
              {((vestedSupply / totalSupply) * 100).toString() + "%"}
            </span>
            <span className="text-[10px]">{`vested supply`}</span>
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-sm text-white">{`${convertSecondsToNearestUnit(
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
          <span className="col-span-4 sm:col-span-5 text-gray-200">
            {description}
          </span>
        )}
        {!status && externalUrl && (
          <span className="col-span-2 sm:col-span-1">External Url</span>
        )}
        {!status && externalUrl && (
          <span className="col-span-4 sm:col-span-5 text-gray-200">
            {externalUrl}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Total Supply</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-5 text-gray-200">
            {separateNumberWithComma(totalSupply.toString()) + ` ${symbol}`}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Vested Supply</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-gray-200">
            {((vestedSupply / totalSupply) * 100).toString() + "%"}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Vesting Period</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-gray-200">
            {convertSecondsToNearestUnit(vestingPeriod)}
          </span>
        )}
        {!status && (
          <span className="col-span-2 sm:col-span-1">Presale Target</span>
        )}
        {!status && (
          <span className="col-span-4 sm:col-span-2 text-gray-200">
            {presaleTarget / LAMPORTS_PER_SOL + ` Sol`}
          </span>
        )}
        {maxPresaleTime && (
          <span className="col-span-2 sm:col-span-1">Max Presale Duration</span>
        )}
        {maxPresaleTime && (
          <span className="col-span-4 sm:col-span-2 text-gray-200">
            {convertSecondsToNearestUnit(maxPresaleTime)}
          </span>
        )}
        {creatorFees && (
          <span className="col-span-2 sm:col-span-1">Creator Fees</span>
        )}
        {creatorFees && (
          <span className="col-span-4 sm:col-span-5 text-gray-200">
            {creatorFees / 100 + "%"}
          </span>
        )}
      </div>
    </div>
  );
};
