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
  getCollectionMintAddress,
} from "../../../utils/helper";
import {
  MarketDetails,
  MintType,
  PoolType,
  Status,
} from "../../../utils/types";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { TxVersion, buildSimpleTransaction } from "@raydium-io/raydium-sdk";
import { getFunctions, httpsCallable } from "firebase/functions";
import { User } from "firebase/auth";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { MainBtn } from "../../../components/buttons/MainBtn";
import Link from "next/link";

export function Pool() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>();
  const [uniqueBackers, setUniqueBackers] = useState<number>(0);
  const [mint, setMint] = useState<MintType>();
  const [amountToPurchase, setAmountToPurchase] = useState<string>("");
  const { publicKey, signTransaction, signMessage, signAllTransactions } =
    useWallet();
  const {
    nft,
    user,
    setSignedMessage,
    signedMessage,
    setSessionKey,
    sessionKey,
  } = useLogin();
  const [pool, setPool] = useState<PoolType>();
  const router = useRouter();
  const { poolId } = router.query;

  useEffect(() => {
    if (nft && pool) {
      getDoc(doc(db, `Mint/${nft.id}/Pool/${pool.pool}`)).then((doc) => {
        if (doc.exists()) {
          const data = doc.data() as MintType;
          setMint(data);
        }
      });
    }
  }, [nft, pool]);

  useEffect(() => {
    if (poolId) {
      getDoc(doc(db, `Pool/${poolId}`)).then((doc) => {
        if (doc.exists()) {
          setPool(doc.data() as PoolType);
        }
      });
      const coll = collection(db, `Pool/${poolId}/Mint`);
      getCountFromServer(coll).then((result) =>
        setUniqueBackers(result.data().count)
      );
    }
  }, [poolId]);
  useEffect(() => {
    if (pool) {
      setStatus(getStatus(pool));
    }
  }, [pool]);

  async function buyPresale(
    amount: number,
    nft: DasApiAsset,
    pool: PoolType,
    publicKey: PublicKey,
    signTransaction: any
  ) {
    const nftCollection = getCollectionMintAddress(nft);
    if (!nftCollection) {
      throw Error("NFT has no collection");
    }
    console.log(amount);
    const ix = await buyPresaleIx(
      {
        amount: amount,
        nft: new PublicKey(nft.id),
        nftCollection: new PublicKey(nftCollection),
        poolId: new PublicKey(pool.pool),
        signer: publicKey,
      },
      connection
    );

    await buildAndSendTransaction(connection, [ix], publicKey, signTransaction);
  }

  const launch = async () => {
    try {
      if (
        status &&
        publicKey &&
        user &&
        connection &&
        pool &&
        signMessage &&
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
          toast.error("Insufficient SOL. You need at least 3 Sol.");
          return;
        } else if (
          (!amountOfSolInWallet ||
            amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 0.2) &&
          docRef.exists()
        ) {
          toast.error("Insufficient SOL. You need at least 0.2 Sol.");
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
      console.log(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const buy = async () => {
    try {
      if (
        status &&
        publicKey &&
        user &&
        connection &&
        pool &&
        amountToPurchase &&
        signMessage &&
        signTransaction
      ) {
        setLoading(true);
        if (!nft) {
          toast.error("Missing Profile...");
          router.push("/profile");
          return;
        }
        const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
        if (
          !amountOfSolInWallet ||
          amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL
        ) {
          toast.error(
            `Insufficient SOL. You need at least ${amountToPurchase} Sol.`
          );
          return;
        }
        await buyPresale(
          parseFloat(amountToPurchase) * LAMPORTS_PER_SOL,
          nft,
          pool,
          publicKey,
          signTransaction
        );
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

  function getButton(
    status: Status,
    pool: PoolType,
    nft: DasApiAsset | undefined,
    loading: boolean
  ) {
    if (!nft) {
      return (
        <div className="flex items-center justify-center">
          <Link
            href={"/profile"}
            className="text-gray-100 bg-gray-700 hover:bg-gray-800 text-sm sm:text-base rounded p-2"
          >
            {"Missing Profile!"}
          </Link>
        </div>
      );
    }
    if (
      status === Status.PresaleInProgress ||
      status === Status.PresaleTargetMet
    ) {
      if (
        pool.collectionsRequired === null ||
        (pool.collectionsRequired &&
          pool.collectionsRequired.find(
            (item) => item.mintAddress === getCollectionMintAddress(nft)
          ) !== undefined)
      ) {
        return (
          <MainBtn
            handleClick={buy}
            color={"text-green-100 bg-green-700 hover:bg-green-800"}
            loading={loading}
            disabled={false}
            amount={mint?.amount}
            maxAllowedPerPurchase={pool.maxAmountPerPurchase}
            amountToPurchase={amountToPurchase}
            setAmountToPurchase={setAmountToPurchase}
            text={loading ? "" : "Fund"}
            creatorFeeBasisPoints={pool.creatorFeeBasisPoints}
          />
        );
      }
      return (
        <MainBtn
          color={"text-gray-100 bg-gray-700 hover:bg-gray-800"}
          text={"Not part of whitelisted collection"}
        />
      );
    } else if (status === Status.Expired) {
      return (
        <MainBtn
          color={"text-gray-100 bg-gray-700 hover:bg-gray-800"}
          text={"Expired"}
        />
      );
    } else if (status === Status.VestingCompleted) {
      return (
        <MainBtn
          color={"text-blue-100 bg-blue-700 hover:bg-blue-800"}
          text={"Vesting Completed"}
        />
      );
    } else if (status === Status.VestingInProgress) {
      return (
        <MainBtn
          color={"text-yellow-100 bg-yellow-700 hover:bg-yellow-800"}
          text={"Vesting In Progress"}
        />
      );
    } else if (status === Status.ReadyToLaunch) {
      if (publicKey?.toBase58() === pool.authority) {
        return (
          <MainBtn
            handleClick={launch}
            loading={loading}
            disabled={false}
            color={"text-red-100 bg-red-700 hover:bg-red-800"}
            text={loading ? "" : "Launch"}
          />
        );
      } else {
        return (
          <MainBtn
            color={"text-red-100 bg-red-700 hover:bg-red-800"}
            text={"Awaiting Creator To Launch"}
          />
        );
      }
    }
  }

  return (
    pool && (
      <div className="flex flex-1 items-center justify-center gap-4 max-w-screen-sm w-full h-full">
        <div className="flex flex-col gap-8 rounded border w-full shadow-sm p-4">
          <ReviewPane
            collectionsRequired={pool.collectionsRequired}
            authority={pool.authority}
            uniqueBackers={uniqueBackers}
            decimal={pool.decimal}
            mint={pool.mint}
            image={pool.image}
            name={pool.name}
            symbol={pool.symbol}
            externalUrl={""}
            totalSupply={pool.totalSupply}
            vestedSupply={pool.vestedSupply}
            vestingPeriod={pool.vestingPeriod}
            presaleTimeLimit={pool.presaleTimeLimit}
            presaleTarget={pool.presaleTarget}
            description={pool.description}
            liquidityCollected={pool.liquidityCollected}
            status={status}
          />

          {status && getButton(status, pool, nft, loading)}
        </div>
      </div>
    )
  );
}

export default Pool;
