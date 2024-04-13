import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  buildAndSendTransaction,
  convertSecondsToNearestUnit,
  createMarket,
  formatLargeNumber,
  getStatus,
  launchTokenAmm,
  sendTransactions,
} from "../utils/helper";
import { MarketDetails, PoolType, Status } from "../utils/types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../hooks/useLogin";
import { toast } from "react-toastify";
import { buildSimpleTransaction, TxVersion } from "@raydium-io/raydium-sdk";
import { getDoc, doc } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db } from "../utils/firebase";
import { getCustomErrorMessage } from "../utils/error";

interface CreatorTableRowProps {
  pool: PoolType;
  timer?: number;
}

export const CreatorTableRow: FC<CreatorTableRowProps> = ({ pool, timer }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>();
  const { publicKey, signTransaction, signIn, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();
  const { user } = useLogin();
  const [unlockedMint, setUnlockedMint] = useState<number>();
  const router = useRouter();

  useEffect(() => {
    if (pool) {
      setStatus(getStatus(pool));
    }
  }, [pool]);

  useEffect(() => {
    if (
      pool.vestingStartedAt &&
      pool.vestingPeriod &&
      pool.vestedSupply &&
      timer
    ) {
      setUnlockedMint(
        ((timer / 1000 - pool.vestingStartedAt) * pool.vestedSupply) /
          pool.vestingPeriod
      );
    }
  }, [timer, pool]);

  const launch = async () => {
    try {
      if (
        status &&
        publicKey &&
        user &&
        connection &&
        pool &&
        signIn &&
        signTransaction &&
        signAllTransactions
      ) {
        setLoading(true);
        const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
        const docRef = await getDoc(
          doc(db, `Pool/${pool.pool}/Market/${pool.mint}`)
        );
        let marketId;
        if (
          (!amountOfSolInWallet ||
            amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 3) &&
          !docRef.exists()
        ) {
          toast.error("Insufficient Sol. You need at least 3 Sol.");
          return;
        } else if (
          (!amountOfSolInWallet ||
            amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 0.2) &&
          docRef.exists()
        ) {
          toast.error("Insufficient Sol. You need at least 0.2 Sol.");
          return;
        }
        if (!docRef.exists()) {
          const { innerTransactions, address } = await createMarket(
            {
              signer: publicKey,
              mint: new PublicKey(pool.mint),
              decimal: pool.decimal,
              lotSize: 1,
              tickSize: Math.max(10 ^ -pool.decimal, 10 ^ -6),
            },
            connection
          );
          const txs = await buildSimpleTransaction({
            connection: connection,
            makeTxVersion: TxVersion.V0,
            payer: publicKey,
            innerTransactions,
          });
          await sendTransactions(
            connection,
            txs as VersionedTransaction[],
            signAllTransactions
          );
          const updateMarket = httpsCallable(
            getFunctions(),
            "updateMarketDetails"
          );
          const payload = {
            pubKey: publicKey.toBase58(),
            poolId: pool.pool,
            marketDetails: {
              marketId: address.marketId.toBase58(),
              requestQueue: address.requestQueue.toBase58(),
              eventQueue: address.eventQueue.toBase58(),
              bids: address.bids.toBase58(),
              asks: address.asks.toBase58(),
              baseVault: address.baseVault.toBase58(),
              quoteVault: address.quoteVault.toBase58(),
              baseMint: address.baseMint.toBase58(),
              quoteMint: address.quoteMint.toBase58(),
            } as MarketDetails,
          };
          await updateMarket(payload);
          marketId = address.marketId.toBase58();
        } else {
          marketId = (docRef.data() as MarketDetails).marketId;
        }
        let ix = [];
        ix.push(
          await launchTokenAmm(
            {
              marketId: new PublicKey(marketId),
              mint: new PublicKey(pool.mint),
              signer: publicKey,
              poolAuthority: new PublicKey(pool.authority),
              poolId: new PublicKey(pool.pool),
            },
            connection
          )
        );
        await buildAndSendTransaction(
          connection,
          ix,
          publicKey,
          signTransaction
        );
        toast.success("Success!");
      }
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    pool &&
    timer && (
      <tr className="text-[10px] sm:text-xs text-black hover:bg-gray-100">
        <td
          onClick={() => router.push(`/project/${pool.pool}`)}
          scope="row"
          className="cursor-pointer hidden sm:table-cell p-2"
        >
          <div className="relative w-8 h-8">
            <Image
              className={`rounded object-cover cursor-pointer`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={pool.image}
              alt={""}
            />
          </div>
        </td>
        <td
          onClick={() => router.push(`/project/${pool.pool}`)}
          scope="row"
          className="cursor-pointer p-2"
        >
          {pool.name}
        </td>
        {status !== Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {`${
              (pool.liquidityCollected * parseInt(pool.creatorFeeBasisPoints)) /
              (LAMPORTS_PER_SOL * 10000)
            } 
               Sol ${
                 pool.amountLpWithdrawn
                   ? `& ${
                       (pool.amountLpWithdrawn *
                         parseInt(pool.creatorFeeBasisPoints)) /
                       (10000 * 10 ** pool.decimal)
                     } 
                      ${pool.symbol}`
                   : ""
               }`}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet ||
          status === Status.ReadyToLaunch ||
          status === Status.Expired) && (
          <td scope="row" className="p-2 text-center">
            {pool.liquidityCollected / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}

        {(status === Status.PresaleInProgress ||
          status === Status.ReadyToLaunch ||
          status === Status.PresaleTargetMet) && (
          <td scope="row" className="p-2 text-center">
            {pool.presaleTarget / LAMPORTS_PER_SOL + " Sol"}
          </td>
        )}
        {(status === Status.PresaleInProgress ||
          status === Status.ReadyToLaunch ||
          status === Status.PresaleTargetMet) && (
          <td className="p-2 text-center">
            {pool.presaleTimeLimit - timer / 1000 > 0
              ? convertSecondsToNearestUnit(
                  pool.presaleTimeLimit - timer / 1000
                )
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")
              : "Ended"}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(pool.totalSupply / 10 ** pool.decimal)}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (pool.totalSupply -
                pool.vestedSupply +
                (pool.totalClaimed ? pool.totalClaimed : 0)) /
                10 ** pool.decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (pool.vestedSupply - (unlockedMint ? unlockedMint : 0)) /
                10 ** pool.decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {formatLargeNumber(
              (unlockedMint ? unlockedMint : 0) / 10 ** pool.decimal
            )}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td scope="row" className="p-2 text-center">
            {convertSecondsToNearestUnit(pool.vestingEndingAt - timer / 1000)
              .split(" ")
              .slice(0, 2)
              .join(" ")}
          </td>
        )}
        {status === Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {(pool.amountWsolWithdrawn ? pool.amountWsolWithdrawn : 0) /
              LAMPORTS_PER_SOL +
              " Sol"}
          </td>
        )}
        {status === Status.Expired && (
          <td scope="row" className="p-2 text-center">
            {(pool.liquidityCollected -
              (pool.amountWsolWithdrawn ? pool.amountWsolWithdrawn : 0)) /
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
              <span>{status}</span>
            )}
          </div>
        </td>
      </tr>
    )
  );
};
