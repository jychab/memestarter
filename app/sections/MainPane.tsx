import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface MainPaneProps {
  image: string;
  name: string;
  symbol: string;
  authority?: string;
}

export const MainPane: FC<MainPaneProps> = ({
  image,
  name,
  symbol,
  authority,
}) => {
  return (
    <div className="flex w-full flex-col text-xs gap-2 ">
      <div className="flex gap-4 items-center">
        <div className="relative h-12 w-12">
          <Image
            priority={true}
            className={`rounded object-cover`}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={image}
            alt={""}
          />
        </div>
        <div className="grid grid-cols-4 md:grid-cols-3 gap-2 w-4/5 md:w-full">
          <span className="col-span-2 md:col-span-1">Name</span>
          <span>Symbol</span>
          <span>Creator</span>
          <span className="col-span-2 md:col-span-1 text-black">{name}</span>
          <span className="text-black">{symbol}</span>
          {authority && (
            <Link
              className={
                "text-blue-600 hover:text-blue-700 truncate max-w-16 md:max-w-24"
              }
              href={`https://solana.fm/address/${authority}`}
              target="_blank"
            >
              {authority}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
