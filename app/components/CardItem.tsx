import React, { FC, useEffect, useState } from "react";
import { Pool } from "../utils/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import solanaLogo from "../public/solanaLogoMark.png";
import Image from "next/image";
import { convertSecondsToNearestUnit, getMetadata } from "../utils/helper";
import Link from "next/link";

interface CardItemProps {
  pool: Pool;
  timer: number | undefined;
}

export const CardItem: FC<CardItemProps> = ({ pool, timer }) => {
  const [percentage, setPercentage] = useState<number>(0);
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  useEffect(() => {
    if (pool) {
      const percent = pool.liquidityCollected
        ? (pool.liquidityCollected / pool.presaleTarget) * 100
        : 0;
      setPercentage(percent);
      getMetadata(pool).then((response) => {
        if (response) {
          setName(response.name);
          setDescription(response.description);
          setImage(response.image);
        }
      });
    }
  }, [pool]);

  return (
    image &&
    timer && (
      <Link
        className="mx-auto max-w-screen-sm cursor-pointer"
        href={`pool/${pool.pool}`}
      >
        <div className="group cursor overflow-hidden rounded shadow-xl duration-200 hover:-translate-y-4">
          <div className="flex h-40 lg:h-60 flex-col border justify-between overflow-hidden">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              priority={true}
              className="h-full w-full"
              src={image}
              alt={""}
            />
          </div>
          <div className="flex flex-col min-h-16 lg:min-h-16 h-fit group-hover:max-h-64 gap-2 overflow-hidden bg-white px-4 py-2 lg:py-4">
            <div className="flex justify-between">
              <h6 className="group-hover:text-gray-900 text-gray-800 text-sm lg:text-base">
                {name}
              </h6>

              <div className="flex gap-1 items-center group-hover:hidden ">
                <h6 className="text-gray-800 ">
                  {pool.liquidityCollected
                    ? pool.liquidityCollected / LAMPORTS_PER_SOL
                    : 0}
                </h6>
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-3 w-3"
                  src={solanaLogo}
                  alt={"solana logo"}
                />
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
                  {`${convertSecondsToNearestUnit(pool.vestingPeriod)}`}
                </h5>
              </div>
            </div>

            <p className="text-gray-900 text-xs lg:text-sm hidden group-hover:block">
              {description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-none items-center gap-1 text-gray-800 focus:text-gray-900 hover:text-gray-800">
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
                <span className="text-[10px] lg:text-xs">
                  {`${
                    timer / 1000 > pool.presaleTimeLimit
                      ? "Expired"
                      : convertSecondsToNearestUnit(
                          pool.presaleTimeLimit - timer / 1000
                        )
                          .split(" ")
                          .slice(0, 2)
                          .join(" ") + " left"
                  }`}
                </span>
              </div>
              <div className="hidden gap-1 group-hover:flex items-center">
                <span className="text-[10px] lg:text-xs text-gray-900 ">
                  {`${
                    pool.liquidityCollected
                      ? pool.liquidityCollected / LAMPORTS_PER_SOL
                      : 0
                  } / ${pool.presaleTarget / LAMPORTS_PER_SOL}`}
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
