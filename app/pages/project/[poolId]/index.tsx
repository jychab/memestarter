import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useLogin } from "../../../hooks/useLogin";
import { getStatus, getCollectionMintAddress } from "../../../utils/helper";
import { MintType, PoolType, Status } from "../../../utils/types";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { MainBtn } from "../../../components/buttons/MainBtn";
import Link from "next/link";
import { getCustomErrorMessage } from "../../../utils/error";
import { useData } from "../../../hooks/useData";
import PresaleDashboard from "../../../sections/PresaleDashboard";
import { MainPane } from "../../../sections/MainPane";
import { buyPresale, launchToken } from "../../../utils/functions";

export function Pool() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>();
  const [uniqueBackers, setUniqueBackers] = useState<number>(0);
  const [mint, setMint] = useState<MintType>();
  const [amountToPurchase, setAmountToPurchase] = useState<string>("");
  const { publicKey, signTransaction, signAllTransactions, signMessage } =
    useWallet();
  const { handleLogin } = useLogin();
  const { nft } = useData();
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
      router.push("/");
    } catch (error) {
      toast.error(getCustomErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pool, nft, amountToPurchase, publicKey, connection, signTransaction]);

  const getButton = useMemo(() => {
    if (!status || !publicKey || !pool) return null;
    if (
      status === Status.PresaleInProgress ||
      status === Status.PresaleTargetMet
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
  }, [status, publicKey, pool, loading, nft]);

  return (
    pool && (
      <div className="flex flex-1 items-center justify-center gap-4 max-w-screen-sm w-full h-full">
        <div className="flex flex-col gap-8 rounded border w-full shadow-sm p-4 text-gray-400 font-medium">
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
              collectionsRequired={pool.collectionsRequired}
              uniqueBackers={uniqueBackers}
              symbol={pool.symbol}
              decimal={pool.decimal}
              totalSupply={pool.totalSupply}
              vestedSupply={pool.vestedSupply}
              vestingPeriod={pool.vestingPeriod}
              liquidityCollected={pool.liquidityCollected}
              presaleTimeLimit={pool.presaleTimeLimit}
              presaleTarget={pool.presaleTarget}
              description={pool.description}
            />
          )}
          {status && publicKey && getButton}
        </div>
      </div>
    )
  );
}

export default Pool;
