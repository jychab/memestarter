import React, { FC } from "react";
import Image from "next/image";
import { CollectionDetails, Status } from "../utils/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
} from "../utils/helper";
import { Chip } from "../components/Chip";
import { MainPane } from "./MainPane";

interface ReviewPaneProps {
  authority?: string;
  image: string;
  name: string;
  symbol: string;
  decimal: number;
  externalUrl?: string;
  totalSupply: number;
  vestedSupply: number;
  creatorFees: number;
  vestingPeriod: number;
  presaleTime: number;
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
  vestedSupply,
  vestingPeriod,
  externalUrl,
  creatorFees,
  presaleTime,
  presaleTarget = 0,
  decimal: decimals,
  description,
  collectionsRequired,
  maxAmountPerPurchase,
}) => {
  return (
    <div className="flex flex-col text-gray-400 font-medium rounded gap-8">
      <MainPane
        image={image}
        name={name}
        symbol={symbol}
        decimals={decimals}
        authority={authority}
      />
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
          {formatLargeNumber(totalSupply) + ` ${symbol}`}
        </span>
        {creatorFees && (
          <span className="col-span-2 sm:col-span-1">Creator Fees</span>
        )}

        <span className="col-span-4 sm:col-span-2 text-black">
          {creatorFees / 100 + "%"}
        </span>

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

        <span className="col-span-2 sm:col-span-1">Presale Duration</span>

        <span className="col-span-4 sm:col-span-2 text-black">
          {convertSecondsToNearestUnit(presaleTime)}
        </span>

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
    </div>
  );
};
