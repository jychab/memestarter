import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import solanaLogo from "../public/solanaLogoMark.png";
import { convertSecondsToNearestUnit, getStatus } from "../utils/helper";
import { PoolType, Status } from "../utils/types";
import { Chip } from "./Chip";

interface CardItemProps {
  pool: PoolType;
  timer: number | undefined;
}

export const CardItem: FC<CardItemProps> = ({ pool, timer }) => {
  const [percentage, setPercentage] = useState<number>(0);
  const [status, setStatus] = useState<Status>();
  const [presaleDurationLeft, setPresaleDurationLeft] = useState<
    string | undefined
  >();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (
      timer &&
      (status === Status.PresaleInProgress ||
        status === Status.PresaleTargetMet ||
        status === Status.ReadyToLaunch) &&
      pool.presaleTimeLimit - timer / 1000 > 0
    ) {
      setPresaleDurationLeft(
        convertSecondsToNearestUnit(pool.presaleTimeLimit - timer / 1000)
          .split(" ")
          .slice(0, 2)
          .join(" ") + " left"
      );
    } else {
      setPresaleDurationLeft(undefined);
    }
  }, [status, timer, pool]);

  useEffect(() => {
    if (pool) {
      const percent = pool.liquidityCollected
        ? (pool.liquidityCollected / pool.presaleTarget) * 100
        : 0;
      setPercentage(percent);
      setStatus(getStatus(pool));
    }
  }, [pool]);

  return (
    pool && (
      <Link className="cursor-pointer" href={`project/${pool.pool}`}>
        <div className="group cursor overflow-hidden rounded group-hover:shadow-xl duration-200 hover:-translate-y-2 p-2 lg:p-4 hover:border hover:border-gray-300">
          <div className="relative w-full max-w-72 h-40 overflow-hidden">
            <Image
              priority={true}
              className={`rounded object-cover cursor-pointer`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={pool.image}
              alt={""}
            />
            {pool.authority === publicKey?.toBase58() && (
              <div className="absolute right-2 top-2 lg:right-4 lg:top-4 ">
                <Chip k={"YOURS"} textColor="text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col w-full max-w-72 min-h-16 h-fit group-hover:max-h-36 gap-2 overflow-hidden bg-white p-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 relative">
                  <Image
                    className={`rounded-full object-cover hover:border-2 hover:border-gray-400`}
                    fill={true}
                    priority={true}
                    sizes="33vw"
                    quality={100}
                    src={pool.image}
                    alt={"project"}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="group-hover:text-gray-900 max-w-24 lg:max-w-36 truncate text-gray-800 text-sm md:text-base">
                    {pool.name}
                  </span>
                  <span className="max-w-24 lg:max-w-36 truncate text-gray-400 text-[10px] lg:text-xs">
                    {pool.name}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-900 text-xs lg:text-sm hidden truncate text-wrap group-hover:block">
              {pool.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-none items-center gap-1 text-gray-800 focus:text-gray-900 hover:text-gray-800">
                {presaleDurationLeft && (
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" />
                    <path
                      d="M16.5 12H12.25C12.1119 12 12 11.8881 12 11.75V8.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <span className="text-[10px] md:text-xs w-full truncate">
                  {presaleDurationLeft || status}
                </span>
              </div>
              {presaleDurationLeft && (
                <div className="hidden gap-1 group-hover:flex flex-none items-center">
                  <span className="text-[10px] lg:text-xs text-gray-900 ">
                    {`${
                      pool.liquidityCollected
                        ? pool.liquidityCollected / LAMPORTS_PER_SOL
                        : 0
                    } / ${pool.presaleTarget / LAMPORTS_PER_SOL}`}
                  </span>
                  <Image
                    width={16}
                    height={16}
                    src={solanaLogo}
                    alt={"solana logo"}
                  />
                </div>
              )}
              {presaleDurationLeft && (
                <span className="text-[10px] lg:text-xs group-hover:hidden text-gray-900">
                  {`${percentage}% funded`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  );
};

export default CardItem;
