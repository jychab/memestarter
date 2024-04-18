import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useLogin } from "../../../hooks/useLogin";
import {
  getStatus,
  getCollectionMintAddress,
  getMetadata,
} from "../../../utils/helper";
import { MintType, PoolType, Status } from "../../../utils/types";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { MainBtn } from "../../../components/buttons/MainBtn";
import Link from "next/link";
import { getCustomErrorMessage } from "../../../utils/error";
import { useData } from "../../../hooks/useData";
import PresaleDashboard from "../../../sections/PresaleDashboard";
import { MainPane } from "../../../sections/MainPane";
import { buyPresale, launchToken } from "../../../utils/functions";
import { CommentsSection } from "../../../components/commentSection";
import VestingDashboard from "../../../sections/VestingDashboard";
import { getCurrentPrice } from "../../../utils/cloudFunctions";

export function Pool() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>();
  const [uniqueBackers, setUniqueBackers] = useState<number>(0);
  const [mint, setMint] = useState<MintType>();
  const [amountToPurchase, setAmountToPurchase] = useState<string>("");
  const [price, setPrice] = useState<number>();
  const { publicKey, signTransaction, signAllTransactions, signMessage } =
    useWallet();
  const { handleLogin } = useLogin();
  const { nft } = useData();
  const [pool, setPool] = useState<PoolType>();
  const router = useRouter();
  const { poolId } = router.query;

  useEffect(() => {
    if (nft && pool) {
      const unsubscribe = onSnapshot(
        doc(db, `Mint/${nft.id}/Pool/${pool.pool}`),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as MintType;
            setMint(data);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [nft, pool]);

  useEffect(() => {
    if (poolId) {
      const coll = collection(db, `Pool/${poolId}/Mint`);
      getCountFromServer(coll).then((result) =>
        setUniqueBackers(result.data().count)
      );
      const unsubscribe = onSnapshot(doc(db, `Pool/${poolId}`), (doc) => {
        if (doc.exists()) {
          const poolData = doc.data() as PoolType;
          setPool(poolData);
          setStatus(getStatus(poolData));
        }
      });
      return () => unsubscribe();
    }
  }, [poolId]);
  useCallback(() => {
    if (pool) {
      getCurrentPrice(pool.mint).then((res) => setPrice(res.data.value));
    }
  }, [pool]);

  const launch = useCallback(async () => {
    if (
      !(
        publicKey &&
        connection &&
        pool &&
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
        pool,
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
  }, [
    publicKey,
    connection,
    pool,
    signMessage,
    signTransaction,
    signAllTransactions,
  ]);

  const buy = useCallback(async () => {
    if (
      !(
        publicKey &&
        connection &&
        pool &&
        amountToPurchase &&
        nft &&
        signTransaction
      )
    )
      return;
    try {
      setLoading(true);
      await buyPresale(
        pool,
        nft,
        amountToPurchase,
        publicKey,
        connection,
        signTransaction
      );
      toast.success("Success!");
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [pool, nft, amountToPurchase, publicKey, connection, signTransaction]);

  const getButton = useMemo(() => {
    if (!status || !pool) return null;
    if (
      status === Status.PresaleInProgress ||
      status === Status.PresaleTargetMet
    ) {
      if (!publicKey) {
        return (
          <MainBtn
            color={"text-green-100 bg-green-700 hover:bg-green-800"}
            text={"Presale In Progress"}
          />
        );
      }
      if (!nft) {
        return (
          <div className="flex items-center justify-start">
            <Link
              href={"/profile"}
              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm rounded"
            >
              {"You need to set up your profile first!"}
            </Link>
          </div>
        );
      } else {
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
              show={true}
              text={loading ? "" : "Fund"}
            />
          );
        }
        return (
          <MainBtn
            color={"text-gray-100 bg-gray-700 hover:bg-gray-800"}
            text={"Not part of whitelisted collection"}
          />
        );
      }
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
      if (publicKey && publicKey.toBase58() === pool.authority) {
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
  }, [
    status,
    publicKey,
    pool,
    loading,
    nft,
    amountToPurchase,
    mint,
    buy,
    launch,
  ]);

  return (
    pool && (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 max-w-screen-sm w-full h-full">
        <div className="flex flex-col gap-4 rounded border w-full shadow-sm p-4 text-gray-400 font-medium">
          <MainPane
            image={pool.image}
            name={pool.name}
            symbol={pool.symbol}
            decimals={pool.decimal}
            authority={pool.authority}
            mint={pool.mint}
          />
          {(status == Status.PresaleInProgress ||
            status == Status.PresaleTargetMet ||
            status == Status.ReadyToLaunch) && (
            <PresaleDashboard
              creatorFeeBasisPoints={pool.creatorFeeBasisPoints}
              collectionsRequired={pool.collectionsRequired}
              uniqueBackers={uniqueBackers}
              symbol={pool.symbol}
              decimal={pool.decimal}
              totalSupply={pool.totalSupply}
              vestingPeriod={pool.vestingPeriod}
              liquidityCollected={pool.liquidityCollected}
              presaleTimeLimit={pool.presaleTimeLimit}
              presaleTarget={pool.presaleTarget}
              description={pool.description}
            />
          )}
          {(status == Status.VestingInProgress ||
            status == Status.VestingCompleted) && (
            <VestingDashboard
              price={price}
              symbol={pool.symbol}
              decimal={pool.decimal}
              totalSupply={pool.totalSupply}
              vestingPeriod={pool.vestingPeriod}
              uniqueBackers={uniqueBackers}
              vestingStartedAt={pool.vestingStartedAt}
              totalClaimed={pool.totalClaimed}
              amountLpReceived={pool.amountLpReceived}
            />
          )}
          {publicKey &&
            (status == Status.PresaleInProgress ||
              status == Status.PresaleTargetMet ||
              status == Status.ReadyToLaunch) && (
              <span className="uppercase text-xs">Funding</span>
            )}
          {getButton}
        </div>
        <CommentsSection poolId={pool.pool} poolCreator={pool.authority} />
      </div>
    )
  );
}

export default Pool;
