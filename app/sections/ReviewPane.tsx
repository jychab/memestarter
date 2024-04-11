import React, { FC } from "react";
import Image from "next/image";
import { CollectionDetails, Status } from "../utils/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  separateNumberWithComma,
} from "../utils/helper";
import PresaleDashboard from "./PresaleDashboard";
import { Chip } from "../components/Chip";

interface ReviewPaneProps {
  authority: string;
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
  presaleTime?: number;
  presaleTarget: number;
  description?: string;
  maxAmountPerPurchase?: number;
  collectionsRequired?: CollectionDetails[] | null;
}

export const ReviewPane: FC<ReviewPaneProps> = ({
  authority,
  image,
  name,
  symbol,
  totalSupply,
  mint,
  vestedSupply,
  vestingPeriod,
  externalUrl,
  creatorFees,
  presaleTime,
  uniqueBackers = 0,
  vestingStartedAt,
  vestingEndingAt,
  liquidityCollected = 0,
  presaleTimeLimit = 0,
  presaleTarget = 0,
  status,
  decimal: decimals,
  description,
  collectionsRequired,
  maxAmountPerPurchase,
}) => {
  return (
    <div className="flex flex-col text-gray-400 font-medium rounded gap-8">
      <div className="flex gap-4">
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
          <span>Creator</span>
          <span className="w-24 lg:w-64 truncate text-black">{authority}</span>
          {mint && <span>Mint Address</span>}
          {mint && (
            <span className="w-24 lg:w-64 truncate text-black">{mint}</span>
          )}
        </div>
      </div>
      {(status == Status.PresaleInProgress ||
        status == Status.PresaleTargetMet) && (
        <PresaleDashboard
          collectionsRequired={collectionsRequired}
          uniqueBackers={uniqueBackers}
          symbol={symbol}
          decimal={decimals}
          totalSupply={totalSupply}
          vestedSupply={vestedSupply}
          vestingPeriod={vestingPeriod}
          liquidityCollected={liquidityCollected}
          presaleTimeLimit={presaleTimeLimit}
          presaleTarget={presaleTarget}
        />
      )}
      {!status && (
        <div className="grid grid-cols-6 items-center gap-4 text-xs">
          {description && (
            <span className="col-span-2 sm:col-span-1">Description</span>
          )}
          {description && (
            <span className="col-span-4 sm:col-span-5 text-black">
              {description}
            </span>
          )}
          {externalUrl && (
            <span className="col-span-2 sm:col-span-1">External Url</span>
          )}
          {externalUrl && (
            <span className="col-span-4 sm:col-span-5 text-black">
              {externalUrl}
            </span>
          )}
          <span className="col-span-2 sm:col-span-1">Total Supply</span>
          <span className="col-span-4 sm:col-span-2 text-black">
            {separateNumberWithComma(totalSupply.toString()) + ` ${symbol}`}
          </span>
          {creatorFees && (
            <span className="col-span-2 sm:col-span-1">Creator Fees</span>
          )}
          {creatorFees && (
            <span className="col-span-4 sm:col-span-2 text-black">
              {creatorFees / 100 + "%"}
            </span>
          )}
          <span className="col-span-2 sm:col-span-1">Vested Supply</span>
          <span className="col-span-4 sm:col-span-2 text-black">
            {((vestedSupply / totalSupply) * 100).toString() + "%"}
          </span>
          <span className="col-span-2 sm:col-span-1">Vesting Period</span>
          <span className="col-span-4 sm:col-span-2 text-black">
            {convertSecondsToNearestUnit(vestingPeriod)}
          </span>
          <span className="col-span-2 sm:col-span-1">Presale Target</span>
          <span className="col-span-4 sm:col-span-2 text-black">
            {presaleTarget / LAMPORTS_PER_SOL + ` Sol`}
          </span>
          {presaleTime && (
            <span className="col-span-2 sm:col-span-1">Presale Duration</span>
          )}
          {presaleTime && (
            <span className="col-span-4 sm:col-span-2 text-black">
              {convertSecondsToNearestUnit(presaleTime)}
            </span>
          )}
          {maxAmountPerPurchase && (
            <span className="col-span-2 sm:col-span-1">
              Max Allowed Per Purchase
            </span>
          )}
          {maxAmountPerPurchase && (
            <span className="col-span-4 sm:col-span-5 text-black">
              {maxAmountPerPurchase / LAMPORTS_PER_SOL + " Sol"}
            </span>
          )}
          {collectionsRequired && collectionsRequired.length > 0 && (
            <span className="col-span-2 sm:col-span-1">
              Whitelisted Collections
            </span>
          )}
          {collectionsRequired && collectionsRequired.length > 0 && (
            <div className="col-span-4 sm:col-span-5 flex gap-2 flex-wrap">
              {collectionsRequired.map((collection) => (
                <Chip
                  key={collection.mintAddress}
                  k={collection.name}
                  textColor="text-white"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
