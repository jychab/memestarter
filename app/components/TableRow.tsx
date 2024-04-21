import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  formatLargeNumber,
  getStatus,
} from "../utils/helper";
import { buildAndSendTransaction } from "../utils/transactions";
import { checkClaimElligibility } from "../utils/instructions";
import { claim } from "../utils/instructions";
import { withdraw } from "../utils/instructions";
import { Status } from "../utils/types";
import { Project } from "../sections/MintDashboard";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { getCustomErrorMessage } from "../utils/error";
import { useData } from "../hooks/useData";

interface TableRowProps {
  project: Project;
  timer?: number;
}

export const TableRow: FC<TableRowProps> = ({ project, timer }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>();
  const [currentLpElligible, setCurrentLpElligible] = useState<number>();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { nft } = useData();
  const router = useRouter();

  useEffect(() => {
    if (project) {
      setStatus(getStatus(project));
    }
  }, [project]);

  useEffect(() => {
    if (
      project.vestingPeriod &&
      project.decimal &&
      timer &&
      project.vestingStartedAt &&
      project.lpElligible
    ) {
      if (
        project.lastClaimedAt &&
        project.lastClaimedAt >=
          project.vestingStartedAt + project.vestingPeriod
      ) {
        setCurrentLpElligible(0);
      } else {
        const durationVested =
          (timer / 1000 -
            (project.lastClaimedAt
              ? project.lastClaimedAt
              : project.vestingStartedAt)) /
          project.vestingPeriod;
        const elligibleAmount =
          Math.min(project.lpElligible, project.lpElligible * durationVested) /
          10 ** project.decimal;
        const amountAfterCreatorFees =
          (elligibleAmount * (10000 - project.creatorFeeBasisPoints)) / 10000;
        setCurrentLpElligible(amountAfterCreatorFees);
      }
    } else {
      setCurrentLpElligible(undefined);
    }
  }, [timer, project]);

  const handleAction = useCallback(
    async (actionType: string) => {
      if (!publicKey || !nft || !project || !signTransaction) return;

      try {
        setLoading(true);
        let ix;

        switch (actionType) {
          case "claim":
            ix = await claim(
              {
                signer: publicKey,
                nftOwner: publicKey,
                nft: new PublicKey(nft.id),
                poolId: new PublicKey(project.pool),
                lpMint: new PublicKey(project.lpMint),
                poolAuthority: new PublicKey(project.authority),
              },
              connection
            );
            break;
          case "checkClaim":
            ix = await checkClaimElligibility(
              {
                signer: publicKey,
                poolId: new PublicKey(project.pool),
                nft: new PublicKey(nft.id),
                mint: new PublicKey(project.mint),
                lpMint: new PublicKey(project.lpMint),
              },
              connection
            );
            break;
          case "withdraw":
            ix = await withdraw(
              {
                poolId: new PublicKey(project.pool),
                signer: publicKey,
                nftOwner: publicKey,
                nft: new PublicKey(nft.id),
              },
              connection
            );
            break;
          default:
            throw new Error("Invalid action type");
        }

        await buildAndSendTransaction(
          connection,
          [ix],
          publicKey,
          signTransaction
        );
        toast.success("Success");
      } catch (error) {
        toast.error(`${getCustomErrorMessage(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [publicKey, nft, project, connection, signTransaction]
  );
  return useMemo(() => {
    if (!project || !status) return null;
    const {
      name,
      amount,
      liquidityCollected,
      presaleTarget,
      presaleTimeLimit,
      decimal,
      amountWsolWithdrawn,
      lpClaimed,
      lpElligible,
      image,
      pool,
      originalMint,
    } = project;

    return (
      <tr className="text-xs text-black hover:bg-gray-100">
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
        <td scope="row" className="p-2 text-center">
          {amount / LAMPORTS_PER_SOL + " Sol"}
        </td>
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
        {(status === Status.VestingInProgress ||
          status === Status.VestingCompleted) && (
          <td className="p-2 text-center">
            {currentLpElligible
              ? formatLargeNumber(currentLpElligible)
              : currentLpElligible === 0
              ? "Fully Claimed"
              : ""}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2 text-center">
            {lpClaimed
              ? formatLargeNumber(
                  (lpClaimed * (10000 - project.creatorFeeBasisPoints)) /
                    (10000 * 10 ** decimal)
                )
              : ""}
          </td>
        )}
        {status === Status.VestingInProgress && (
          <td className="p-2 text-center">
            {lpElligible
              ? formatLargeNumber(
                  (lpElligible * (10000 - project.creatorFeeBasisPoints)) /
                    (10000 * 10 ** decimal)
                )
              : ""}
          </td>
        )}
        {status === Status.VestingInProgress && timer && (
          <td className="p-2 text-center">
            {`${convertSecondsToNearestUnit(
              project.vestingStartedAt + project.vestingPeriod - timer / 1000
            )
              .split(" ")
              .slice(0, 2)
              .join(" ")} left`}
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
        {status === Status.Expired && (
          <td className="p-2 text-center">
            {amountWsolWithdrawn === amount ? "Fully Withdrawn" : ""}
          </td>
        )}
        <td className="p-2 text-center">
          <div className="flex flex-col items-center gap-2">
            {(status === Status.PresaleInProgress ||
              status === Status.ReadyToLaunch ||
              status === Status.PresaleTargetMet) && (
              <span className="text-nowrap">{status}</span>
            )}
            {((nft &&
              nft.id === originalMint &&
              status === Status.VestingInProgress) ||
              status === Status.VestingCompleted) && (
              <button
                onClick={() =>
                  currentLpElligible
                    ? handleAction("claim")
                    : handleAction("checkClaim")
                }
                disabled={currentLpElligible === 0}
                className="text-blue-400 disabled:text-gray-400 flex items-center gap-1"
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
                <span>
                  {`${
                    currentLpElligible !== undefined
                      ? currentLpElligible === 0
                        ? ""
                        : "Claim"
                      : "Check Elligibility"
                  }`}
                </span>
              </button>
            )}
            {nft &&
              nft.id === originalMint &&
              status === Status.Expired &&
              amountWsolWithdrawn !== amount && (
                <button
                  onClick={() => handleAction("withdraw")}
                  className="text-blue-400 disabled:text-gray-400 items-center flex"
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
                  <span>{"Withdraw Funds"}</span>
                </button>
              )}
          </div>
        </td>
      </tr>
    );
  }, [
    project,
    timer,
    status,
    currentLpElligible,
    loading,
    nft,
    router,
    handleAction,
  ]);
};
