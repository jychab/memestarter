import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  buildAndSendTransaction,
  checkClaimElligibility,
  claim,
  convertSecondsToNearestUnit,
  getMetadata,
  getStatus,
  separateNumberWithComma,
  withdraw,
  withdrawLp,
} from "../utils/helper";
import { Pool, Status } from "../utils/types";
import { Project } from "./InventoryItem";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../hooks/useLogin";
import { toast } from "react-toastify";

interface TableRowProps {
  project: Project;
  timer?: number;
}

export const TableRow: FC<TableRowProps> = ({ project, timer }) => {
  const [status, setStatus] = useState<Status>();
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingLp, setLoadingLp] = useState(false);
  const [currentMintElligible, setCurrentMintElligible] = useState<number>();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { nft } = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (
      project.mintElligible &&
      project.vestingPeriod &&
      project.decimal &&
      timer
    ) {
      if (
        project.lastClaimedAt &&
        project.lastClaimedAt >= project.vestingEndingAt
      ) {
        setCurrentMintElligible(0);
      } else {
        setCurrentMintElligible(
          Math.round(
            ((timer / 1000 -
              (project.lastClaimedAt
                ? project.lastClaimedAt
                : project.vestingStartedAt)) *
              project.mintElligible) /
              (project.vestingPeriod * 10 ** project.decimal)
          )
        );
      }
    }
  }, [timer, project]);

  useEffect(() => {
    if (project) {
      getMetadata(project as Pool).then((response) => {
        if (response) {
          setImage(response.image);
          setName(response.name);
        }
      });
      setStatus(getStatus(project));
    }
  }, [project]);

  const handleMint = async () => {
    if (publicKey && nft && project && signTransaction) {
      try {
        setLoading(true);
        if (project.mintElligible) {
          const ix = await claim(
            {
              signer: publicKey,
              nftOwner: publicKey,
              nft: new PublicKey(nft.id),
              poolId: new PublicKey(project.pool),
              mint: new PublicKey(project.mint),
            },
            connection
          );
          await buildAndSendTransaction(
            connection,
            [ix],
            publicKey,
            signTransaction
          );
        } else {
          const ix = await checkClaimElligibility(
            {
              signer: publicKey,
              poolId: new PublicKey(project.pool),
              nft: new PublicKey(nft.id),
            },
            connection
          );
          await buildAndSendTransaction(
            connection,
            [ix],
            publicKey,
            signTransaction
          );
        }
        toast.success("Success");
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLp = async () => {
    if (publicKey && nft && project && signTransaction) {
      try {
        setLoadingLp(true);
        const ix = await withdrawLp(
          {
            poolId: new PublicKey(project.pool),
            poolAuthority: new PublicKey(project.authority),
            lpMint: new PublicKey(project.lpMint),
            signer: publicKey,
            nft: new PublicKey(nft.id),
          },
          connection
        );
        await buildAndSendTransaction(
          connection,
          [ix],
          publicKey,
          signTransaction
        );
        toast.success("Success");
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setLoadingLp(false);
      }
    }
  };

  const handleExpired = async () => {
    if (publicKey && nft && project && signTransaction) {
      try {
        setLoading(true);
        const ix = await withdraw(
          {
            poolId: new PublicKey(project.pool),
            signer: publicKey,
            nft: new PublicKey(nft.id),
          },
          connection
        );
        await buildAndSendTransaction(
          connection,
          [ix],
          publicKey,
          signTransaction
        );
        toast.success("Success");
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    project &&
    timer &&
    name &&
    image && (
      <tr className="text-[10px] sm:text-xs border-b bg-gray-800 hover:bg-gray-900/50 border-gray-700">
        <td
          onClick={() => router.push(`/pool/${project.pool}`)}
          scope="row"
          className="cursor-pointer hidden sm:table-cell p-2"
        >
          <Image
            width={0}
            height={0}
            sizes="100vw"
            className="w-8 h-auto sm:w-10 rounded"
            src={image}
            alt={""}
          />
        </td>
        <td
          onClick={() => router.push(`/pool/${project.pool}`)}
          scope="row"
          className="cursor-pointer p-2"
        >
          {name}
        </td>
        <td scope="row" className="p-2 text-center">
          {project.amount / LAMPORTS_PER_SOL + " Sol"}
        </td>
        {(status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet ||
          status === Status.Expired) && (
          <td scope="row" className="p-2 text-center">
            {project.liquidityCollected / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet) && (
          <td scope="row" className="p-2 text-center">
            {project.presaleTarget / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet) && (
          <td className="p-2 text-center">
            {convertSecondsToNearestUnit(
              project.presaleTimeLimit - Date.now() / 1000
            )
              .split(" ")
              .slice(0, 2)
              .join(" ")}
          </td>
        )}
        {(status === Status.VestingInProgress ||
          status === Status.VestingCompleted) && (
          <td className="p-2 text-center">
            {currentMintElligible
              ? separateNumberWithComma(currentMintElligible.toString())
              : currentMintElligible === 0
              ? "Claimed"
              : ""}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2 text-center">
            {project.mintClaimed
              ? separateNumberWithComma(
                  Math.round(
                    project.mintClaimed / 10 ** project.decimal
                  ).toString()
                )
              : ""}
          </td>
        )}
        {status === Status.VestingInProgress && (
          <td className="p-2 text-center">
            {project.mintElligible
              ? separateNumberWithComma(
                  (project.mintElligible / 10 ** project.decimal).toString()
                )
              : ""}
          </td>
        )}
        {status === Status.VestingInProgress && timer && (
          <td className="p-2 text-center">
            {`${convertSecondsToNearestUnit(
              project.vestingEndingAt - timer / 1000
            )
              .split(" ")
              .slice(0, 2)
              .join(" ")} left`}
          </td>
        )}
        {status === Status.VestingCompleted && (
          <td className="p-2 text-center">
            {project.lpElligibleAfterFees -
              (project.lpClaimed ? project.lpClaimed : 0) >
            0
              ? separateNumberWithComma(
                  Math.round(
                    project.lpElligibleAfterFees / 10 ** project.decimal
                  ).toString()
                )
              : "Claimed"}
          </td>
        )}
        {status === Status.VestingCompleted && (
          <td className="p-2 text-center">
            {project.lpClaimed
              ? separateNumberWithComma(
                  Math.round(
                    project.lpClaimed / 10 ** project.decimal
                  ).toString()
                )
              : ""}
          </td>
        )}
        {status === Status.Expired && (
          <td className="p-2 text-center">
            {project.amountWsolWithdrawn
              ? separateNumberWithComma(
                  Math.round(
                    project.amountWsolWithdrawn / LAMPORTS_PER_SOL
                  ).toString()
                )
              : ""}
          </td>
        )}
        <td className="p-2 text-center">
          <div className="flex flex-col gap-2">
            {(status === Status.PresaleInProgress ||
              status === Status.PresaleTargetMet) && <span>{status}</span>}
            {(status === Status.VestingInProgress ||
              status === Status.VestingCompleted) && (
              <button
                onClick={handleMint}
                disabled={currentMintElligible === 0}
                className="text-blue-400 disabled:text-gray-400"
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
                    project.mintElligible
                      ? currentMintElligible === 0
                        ? ""
                        : "Claim Mint"
                      : "Check Elligibility"
                  }`}
                </span>
              </button>
            )}
            {status === Status.VestingCompleted &&
              project.lpClaimed !== project.lpElligibleAfterFees && (
                <button
                  onClick={handleLp}
                  className="text-blue-400 disabled:text-gray-400 "
                >
                  {loadingLp && (
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
                  <span>{"Claim LP"}</span>
                </button>
              )}
            {status === Status.Expired && (
              <button
                onClick={handleExpired}
                className="text-blue-400 disabled:text-gray-400"
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
    )
  );
};
