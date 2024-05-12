import { FC } from "react";
import Image from "next/image";
import { Tooltip } from "../components/Tooltip";

interface MainPaneProps {
  image: string;
  name: string;
  symbol: string;
  decimals?: number;
  authority?: string;
  mint?: string;
  lpMint?: string;
  creatorsFeeBasisPoints?: number;
}

export const MainPane: FC<MainPaneProps> = ({
  image,
  name,
  symbol,
  decimals,
  authority,
  creatorsFeeBasisPoints,
  mint,
  lpMint,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto ">
      <div className="relative h-40 w-40 lg:w-60 lg:h-60">
        <Image
          priority={true}
          className={`rounded object-cover`}
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={image}
          alt={""}
        />
      </div>
      <div className="flex w-1/2 flex-col text-xs gap-2 ">
        <div className="grid grid-cols-3 gap-2">
          <span className="col-span-2">Name</span>
          <span>Symbol</span>
          <span className="col-span-2 text-black">{name}</span>
          <span className="text-black">{symbol}</span>
        </div>
        {decimals && <span>Decimals</span>}
        {decimals && <span className=" text-black">{decimals}</span>}
        {mint && <span>Mint Address</span>}
        {mint && <span className="truncate text-black">{mint}</span>}
        {lpMint && <span>LP Token Address</span>}
        {lpMint && <span className="truncate text-black">{lpMint}</span>}
        {authority && <span>Creator</span>}
        {authority && <span className="truncate text-black">{authority}</span>}
        {creatorsFeeBasisPoints && <span>Creator's share</span>}
        {creatorsFeeBasisPoints && (
          <div className="flex items-center gap-2">
            <span className="truncate text-black">
              {creatorsFeeBasisPoints / 100 + "%"}
            </span>
            <Tooltip
              content={`This denotes the amount of token the creator will get from the total supply.\n\nFor example,\nCreator's share = 5%\nTotal supply = 100M\nInitial Liquidity Pool Supply= 30%\nRemaining Supply Upon Launch = 70%\n\nCreator's Share:\nUpon Launch = 70% * 100M * 5% (Tokens)\nVesting = LP Tokens * 5%`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
