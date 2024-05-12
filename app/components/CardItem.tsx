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
  const { publicKey } = useWallet();

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
    pool &&
    timer && (
      <Link
        className="mx-auto max-w-screen-sm cursor-pointer"
        href={`project/${pool.pool}`}
      >
        <div className="group cursor overflow-hidden rounded shadow-xl duration-200 hover:-translate-y-4">
          <div className="relative w-40 h-40 lg:w-60 lg:h-60 overflow-hidden">
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
          <div className="flex flex-col w-40 lg:w-60 min-h-16 lg:min-h-16 h-fit group-hover:max-h-40 gap-2 overflow-hidden bg-white px-4 py-2 lg:py-4">
            <div className="flex items-center justify-between">
              <h6 className="group-hover:text-gray-900 max-w-36 truncate text-gray-800 text-sm lg:text-base">
                {pool.name}
              </h6>
              <div className="flex gap-1 items-center group-hover:hidden ">
                <h6 className="text-black text-xs">
                  {pool.liquidityCollected
                    ? pool.liquidityCollected / LAMPORTS_PER_SOL
                    : 0}
                </h6>
                <span className="text-gray-400 text-xs">SOL</span>
              </div>

              <div className="items-center gap-1 flex-none text-gray-800 hidden group-hover:flex focus:text-gray-900 hover:text-gray-800">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16px"
                  height="16px"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z"
                    stroke="currentColor"
                  />
                  <path
                    d="M12 14V18"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
                <h5 className="text-[10px] lg:text-xs ">
                  {`${convertSecondsToNearestUnit(pool.vestingPeriod)
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")}`}
                </h5>
              </div>
            </div>

            <p className="text-gray-900 text-xs lg:text-sm hidden truncate text-wrap group-hover:block">
              {pool.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-none items-center gap-1 text-gray-800 focus:text-gray-900 hover:text-gray-800">
                {(status === Status.PresaleInProgress ||
                  status === Status.PresaleTargetMet ||
                  status === Status.ReadyToLaunch) && (
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
                <span className="text-[10px] lg:text-xs w-full group-hover:max-w-32 truncate">
                  {`${
                    status === Status.PresaleInProgress ||
                    status === Status.PresaleTargetMet ||
                    status === Status.ReadyToLaunch
                      ? convertSecondsToNearestUnit(
                          pool.presaleTimeLimit - timer / 1000
                        )
                          .split(" ")
                          .slice(0, 2)
                          .join(" ") + " left"
                      : status
                  }`}
                </span>
              </div>
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
              <span className="text-[10px] lg:text-xs group-hover:hidden text-gray-900">
                {`${percentage}%`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  );
};

export default CardItem;
