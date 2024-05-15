import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC } from "react";
import { Chip } from "../components/Chip";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
} from "../utils/helper";
import { CollectionDetails } from "../utils/types";
import { MainPane } from "./MainPane";

interface ReviewPaneProps {
  authority?: string;
  image: string;
  name: string;
  symbol: string;
  decimal: number;
  externalUrl?: string;
  totalSupply: number;
  creatorFees: string;
  vestingPeriod: number;
  presaleTime: number;
  presaleTarget: number;
  liquidityPoolSupplyInPercentage: string;
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
  vestingPeriod,
  externalUrl,
  creatorFees,
  presaleTime,
  presaleTarget = 0,
  decimal: decimals,
  liquidityPoolSupplyInPercentage,
  description,
  collectionsRequired,
  maxAmountPerPurchase,
}) => {
  return (
    <div className="flex flex-col text-gray-400 font-medium rounded gap-8 overflow-x-auto">
      <MainPane
        image={image}
        name={name}
        symbol={symbol}
        authority={authority}
      />
      <div className="grid grid-cols-6 items-center gap-4 text-xs">
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
        <span className="col-span-2 sm:col-span-1">Total Supply</span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {formatLargeNumber(totalSupply) + ` ${symbol}`}
        </span>
        <span className="col-span-2 sm:col-span-1">
          Initial Liquidity Pool Supply
        </span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {liquidityPoolSupplyInPercentage + "%"}
        </span>
        <span className="col-span-2 sm:col-span-1">Creator's Share</span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {creatorFees + "%"}
        </span>
        <span className="col-span-2 sm:col-span-1">Presale Target</span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {presaleTarget / LAMPORTS_PER_SOL + ` Sol`}
        </span>
        <span className="col-span-2 sm:col-span-1">Presale Duration</span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {convertSecondsToNearestUnit(presaleTime)}
        </span>
        <span className="col-span-2 sm:col-span-1">Vesting Duration</span>
        <span className="col-span-4 sm:col-span-2 text-black">
          {convertSecondsToNearestUnit(vestingPeriod)}
        </span>
        {decimals && <span className="col-span-2 sm:col-span-1">Decimal</span>}
        {decimals && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {decimals}
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
        {externalUrl && (
          <span className="col-span-2 sm:col-span-1">External Url</span>
        )}
        {externalUrl && (
          <span className="col-span-4 sm:col-span-5 text-black">
            {externalUrl}
          </span>
        )}
        {description && (
          <span className="col-span-2 sm:col-span-1">Description</span>
        )}
        {description && (
          <span className="col-span-4 sm:col-span-5 text-black line-clamp-3">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
