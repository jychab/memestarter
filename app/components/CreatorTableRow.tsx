import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
  getStatus,
} from "../utils/helper";
import { PoolType, Status } from "../utils/types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../hooks/useLogin";
import { toast } from "react-toastify";
import { getCustomErrorMessage } from "../utils/error";
import { launchToken } from "../utils/functions";

interface CreatorTableRowProps {
  pool: PoolType;
  timer?: number;
}

export const CreatorTableRow: FC<CreatorTableRowProps> = ({
  pool: project,
  timer,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>();
  const { publicKey, signTransaction, signMessage, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();
  const { handleLogin } = useLogin();
  const [unlockedMint, setUnlockedMint] = useState<number>();
  const router = useRouter();

  useEffect(() => {
    if (project) {
      setStatus(getStatus(project));
    }
  }, [project]);

  useEffect(() => {
    if (
      project.vestingStartedAt &&
      project.vestingPeriod &&
      project.vestedSupply &&
      timer
    ) {
      setUnlockedMint(
        ((timer / 1000 - project.vestingStartedAt) * project.vestedSupply) /
          project.vestingPeriod
      );
    }
  }, [timer, project]);

  const launch = useCallback(async () => {
    if (
      !(
        publicKey &&
        connection &&
        project &&
        signMessage &&
        signTransaction &&
        signAllTransactions
      )
    )
      return;
    try {
      setLoading(true);
      await handleLogin(publicKey, signMessage);
      await launchToken(
        project,
        connection,
        publicKey,
        signTransaction,
        signAllTransactions
      );
      toast.success("Success!");
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, project, connection, signMessage, signTransaction]);

  return useMemo(() => {
    if (!project || !status) return null;
    const {
      name,
      totalClaimed,
      vestedSupply,
      totalSupply,
      creatorFeeBasisPoints,
      liquidityCollected,
      symbol,
      presaleTarget,
      presaleTimeLimit,
      decimal,
      vestingEndingAt,
      amountLpWithdrawn,
      amountWsolWithdrawn,
      image,
      pool,
    } = project;
    return (
      <tr className="text-[10px] sm:text-xs text-black hover:bg-gray-100">
        <td
          onClick={() => router.push(`/project/${pool}`)}
          scope="row"
          className="cursor-pointer hidden sm:table-cell p-2"
        >
          <div className="relative w-8 h-8">
            <Image
              className={`rounded object-cover cursor-pointer`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={image}
              alt={""}
            />
          </div>
        </td>
        <td
          onClick={() => router.push(`/project/${pool}`)}
          scope="row"
          className="cursor-pointer p-2"
        >
          {name}
        </td>
        {status !== Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {`${
              (liquidityCollected * parseInt(creatorFeeBasisPoints)) /
              (LAMPORTS_PER_SOL * 10000)
            } 
               Sol ${
                 amountLpWithdrawn
                   ? `& ${
                       (amountLpWithdrawn * parseInt(creatorFeeBasisPoints)) /
                       (10000 * 10 ** decimal)
                     } 
                      ${symbol}`
                   : ""
               }`}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet ||
          status === Status.ReadyToLaunch ||
          status === Status.Expired) && (
          <td scope="row" className="p-2 text-center">
            {liquidityCollected / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}

        {(status === Status.PresaleInProgress ||
          status === Status.ReadyToLaunch ||
          status === Status.PresaleTargetMet) && (
          <td scope="row" className="p-2 text-center">
            {presaleTarget / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.ReadyToLaunch ||
          status === Status.PresaleTargetMet) &&
          timer && (
            <td className="p-2 text-center">
              {presaleTimeLimit - timer / 1000 > 0
                ? convertSecondsToNearestUnit(presaleTimeLimit - timer / 1000)
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")
                : "Ended"}
            </td>
          )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(totalSupply / 10 ** decimal)}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (totalSupply - vestedSupply + (totalClaimed ? totalClaimed : 0)) /
                10 ** decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (vestedSupply - (unlockedMint ? unlockedMint : 0)) / 10 ** decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (unlockedMint ? unlockedMint : 0) / 10 ** decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) &&
          timer && (
            <td scope="row" className="p-2 text-center">
              {convertSecondsToNearestUnit(vestingEndingAt - timer / 1000)
                .split(" ")
                .slice(0, 2)
                .join(" ")}
            </td>
          )}
        {status === Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {(amountWsolWithdrawn ? amountWsolWithdrawn : 0) /
              LAMPORTS_PER_SOL +
              " Sol"}
          </td>
        )}
        {status === Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {(liquidityCollected -
              (amountWsolWithdrawn ? amountWsolWithdrawn : 0)) /
              LAMPORTS_PER_SOL +
              " Sol"}
          </td>
        )}
        <td className="p-2 text-center">
          <div className="flex flex-col items-center">
            {status === Status.ReadyToLaunch ? (
              <button
                onClick={launch}
                className="text-blue-400 disabled:text-gray-400 items-center flex gap-2"
              >
                {loading && (
                  <svg
                    className="inline w-4 h-4 animate-spin text-gray-600 fill-gray-300"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                )}
                <span>{"Launch"}</span>
              </button>
            ) : (
              <span className="text-nowrap">{status}</span>
            )}
          </div>
        </td>
      </tr>
    );
  }, [project, timer, status, unlockedMint, launch]);
};
