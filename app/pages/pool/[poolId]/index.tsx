import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { useRouter } from "next/router";
import { FC, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLogin } from "../../../hooks/useLogin";
import { ReviewPane } from "../../../sections/ReviewPane";
import {
  buyPresaleIx,
  buildAndSendTransaction,
  getStatus,
  createMarket,
  sendTransactions,
  getSignature,
  launchTokenAmm,
  getMetadata,
} from "../../../utils/helper";
import { MarketDetails, PoolType, Status } from "../../../utils/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import {
  TxVersion,
  buildSimpleTransaction,
  buildTransaction,
} from "@raydium-io/raydium-sdk";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAccount } from "@solana/spl-token";

export function Pool() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>();
  const { publicKey, signTransaction, signMessage } = useWallet();
  const {
    nft,
    user,
    setSignedMessage,
    signedMessage,
    setSessionKey,
    sessionKey,
  } = useLogin();
  const [pool, setPool] = useState<PoolType>();
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [symbol, setSymbol] = useState();
  const router = useRouter();
  const { poolId } = router.query;

  useEffect(() => {
    if (pool) {
      getMetadata(pool).then((response) => {
        if (response) {
          setName(response.name);
          setDescription(response.description);
          setImage(response.image);
          setSymbol(response.symbol);
        }
      });
    }
  }, [pool]);

  useEffect(() => {
    if (poolId) {
      getDoc(doc(db, `Pool/${poolId}`)).then((doc) => {
        if (doc.exists()) {
          setPool(doc.data() as PoolType);
        }
      });
    }
  }, [poolId]);
  useEffect(() => {
    if (pool) {
      setStatus(getStatus(pool));
    }
  }, [pool]);

  const handleClick = async (e: any) => {
    e.preventDefault();
    try {
      if (
        publicKey &&
        user &&
        connection &&
        pool &&
        signMessage &&
        signTransaction
      ) {
        setLoading(true);
        const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
        if (
          status === Status.PresaleTargetMet &&
          pool.authority === publicKey.toBase58()
        ) {
          if (
            !amountOfSolInWallet ||
            amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 3
          ) {
            toast.error("Insufficient SOL. You need at least 3 Sol.");
            return;
          }
          const docRef = await getDoc(
            doc(db, `Pool/${pool.pool}/Market/${pool.mint}`)
          );
          let marketId;
          if (!docRef.exists()) {
            const { innerTransactions, address } = await createMarket(
              {
                signer: publicKey,
                mint: new PublicKey(pool.mint),
                decimal: pool.mintMetadata.token_info.decimals,
                lotSize: 1,
                tickSize: Math.max(
                  10 ^ -pool.mintMetadata.token_info.decimals,
                  10 ^ -6
                ),
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
              signTransaction
            );
            const updateMarket = httpsCallable(
              getFunctions(),
              "updateMarketDetails"
            );
            let sig = await getSignature(
              user,
              signedMessage,
              sessionKey,
              signMessage,
              setSignedMessage,
              setSessionKey
            );
            const payload = {
              signature: sig,
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
        } else if (status === Status.PresaleInProgress) {
          if (!nft) {
            toast.error("Missing Profile...");
            router.push("/profile");
            return;
          }
          if (
            !amountOfSolInWallet ||
            amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL
          ) {
            toast.error("Insufficient SOL. You need at least 1 Sol.");
            return;
          }

          let ix = [];
          ix.push(
            await buyPresaleIx(
              {
                amount: LAMPORTS_PER_SOL,
                nft: new PublicKey(nft.id),
                poolId: new PublicKey(pool.pool),
                signer: publicKey,
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
        }

        toast.success("Success!");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  function getColorfromStatus(status: Status | undefined, pool: PoolType) {
    if (
      status === Status.PresaleInProgress ||
      (status === Status.PresaleTargetMet &&
        pool.authority !== publicKey?.toBase58())
    ) {
      return "text-green-100 bg-green-700 hover:bg-green-800";
    } else if (
      status === Status.PresaleTargetMet &&
      pool.authority === publicKey?.toBase58()
    ) {
      return "text-red-100 bg-red-700 hover:bg-red-800";
    } else if (status === Status.VestingInProgress) {
      return "text-yellow-100 bg-yellow-700 hover:bg-yellow-800";
    } else if (status === Status.Expired) {
      return "text-gray-100 bg-gray-700 hover:bg-gray-800";
    } else {
      return "text-blue-100 bg-blue-700 hover:bg-blue-800";
    }
  }

  return (
    pool &&
    image &&
    name &&
    symbol && (
      <div className="flex flex-1 items-center justify-center gap-4 max-w-screen-sm w-full h-full">
        <div className="rounded border w-full shadow-sm">
          <ReviewPane
            decimal={pool.decimal}
            mint={pool.mint}
            image={image!}
            name={name!}
            symbol={symbol!}
            externalUrl={""}
            totalSupply={pool.totalSupply}
            vestedSupply={pool.vestedSupply}
            vestingPeriod={pool.vestingPeriod}
            presaleTimeLimit={pool.presaleTimeLimit}
            presaleTarget={pool.presaleTarget}
            description={description}
            liquidityCollected={pool.liquidityCollected}
            status={status}
          />
          <div className="flex flex-col pb-4 items-center">
            <button
              onClick={handleClick}
              className={`${getColorfromStatus(
                status,
                pool
              )} flex items-center justify-center rounded max-w-64 gap-1 px-4 py-1`}
              disabled={
                !(
                  status === Status.PresaleInProgress ||
                  status === Status.PresaleTargetMet
                )
              }
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
              {(status === Status.PresaleInProgress ||
                (status === Status.PresaleTargetMet &&
                  pool.authority !== publicKey?.toBase58())) && (
                <span>{loading ? "Funding..." : "Fund for 1 SOL"}</span>
              )}
              {status === Status.Expired && <span>{"Expired"}</span>}
              {status === Status.VestingCompleted && (
                <span>{"Vesting Completed"}</span>
              )}
              {status === Status.VestingInProgress && (
                <span>{"Vesting in Progress"}</span>
              )}
              {status === Status.PresaleTargetMet &&
                pool.authority === publicKey?.toBase58() && (
                  <span>{loading ? "Launching..." : "Launch Token"}</span>
                )}
            </button>
            <span
              hidden={status !== Status.PresaleInProgress}
              className="text-[10px] text-gray-400"
            >
              {"Creator Fees: " +
                parseInt(pool.creatorFeeBasisPoints) / 100 +
                "%"}
            </span>
          </div>
        </div>
      </div>
    )
  );
}

export default Pool;
