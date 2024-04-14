import { FC } from "react";
import Image from "next/image";

interface MainPaneProps {
  image: string;
  name: string;
  symbol: string;
  decimals: number;
  authority?: string;
  mint?: string;
}

export const MainPane: FC<MainPaneProps> = ({
  image,
  name,
  symbol,
  decimals,
  authority,
  mint,
}) => {
  return (
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
        {authority && <span>Creator</span>}
        {authority && (
          <span className="w-48 lg:w-80 truncate text-black">{authority}</span>
        )}
        {mint && <span>Mint Address</span>}
        {mint && (
          <span className="w-48 lg:w-64 truncate text-black">{mint}</span>
        )}
      </div>
    </div>
  );
};
