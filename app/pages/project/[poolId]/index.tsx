import { Tab, Tabs, useMediaQuery } from "@mui/material";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  collection,
  doc,
  getCountFromServer,
  onSnapshot,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { EditableDocument } from "../../../components/EditableDocument";
import { StatusBtn } from "../../../components/buttons/StatusBtn";
import { useData } from "../../../hooks/useData";
import { useLogin } from "../../../hooks/useLogin";
import { CommentsSection } from "../../../sections/CommentsSection";
import { MainPane } from "../../../sections/MainPane";
import PresaleDashboard from "../../../sections/PresaleDashboard";
import RewardsSection from "../../../sections/RewardsSection";
import { ThumbnailSection } from "../../../sections/ThumbnailSection";
import VestingDashboard from "../../../sections/VestingDashboard";
import { getCurrentPrice } from "../../../utils/cloudFunctions";
import { getCustomErrorMessage } from "../../../utils/error";
import { db } from "../../../utils/firebase";
import { launchToken } from "../../../utils/functions";
import { getCollectionMintAddress, getStatus } from "../../../utils/helper";
import { PoolType, Status } from "../../../utils/types";

enum TabType {
  MAIN,
  THUMBNAIL,
  PROJECTINFO,
  REWARDS,
  PURCHASE,
}

export default function Pool() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>();
  const [uniqueBackers, setUniqueBackers] = useState<number>(0);
  const [price, setPrice] = useState<number>();
  const { publicKey, signTransaction, signMessage } = useWallet();
  const { handleLogin } = useLogin();
  const { nft } = useData();
  const [pool, setPool] = useState<PoolType>();
  const router = useRouter();
  const { poolId } = router.query;
  const matches = useMediaQuery("(min-width:768px)");
  const [tabValue, setTabValue] = useState<TabType>(TabType.MAIN);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!publicKey) {
      setTabValue(TabType.MAIN);
    }
  }, [publicKey]);

  useEffect(() => {
    if (poolId) {
      const unsubscribe = onSnapshot(doc(db, `Pool/${poolId}`), (doc) => {
        if (doc.exists()) {
          const coll = collection(db, `Pool/${poolId}/Mint`);
          getCountFromServer(coll).then((result) =>
            setUniqueBackers(result.data().count)
          );
          const poolData = doc.data() as PoolType;
          setPool(poolData);
          setStatus(getStatus(poolData));
        }
      });
      return () => unsubscribe();
    }
  }, [poolId]);
  useEffect(() => {
    if (
      pool &&
      status &&
      (status == Status.VestingInProgress || status == Status.VestingCompleted)
    ) {
      getCurrentPrice(pool.mint)
        .then((res) => {
          setPrice(res.data.value);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [status, pool]);

  const launch = useCallback(async () => {
    if (!(publicKey && connection && pool && signMessage && signTransaction))
      return;
    try {
      setLoading(true);
      await handleLogin(publicKey, signMessage);
      await launchToken(pool, connection, publicKey, signTransaction);
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
    setLoading,
    signMessage,
    signTransaction,
    handleLogin,
  ]);

  const StatusButton = useMemo(() => {
    if (!status || !pool) return null;
    if (status === Status.PresaleInProgress) {
      if (!publicKey) {
        return (
          <StatusBtn
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
            <StatusBtn
              disabled={false}
              handleClick={async () => await router.push(`${poolId}/rewards`)}
              color={"text-green-100 bg-green-700 hover:bg-green-800"}
              text={"Back this project"}
            />
          );
        }
        return (
          <StatusBtn
            color={"text-gray-100 bg-gray-700 hover:bg-gray-800"}
            text={"Not part of whitelisted collection"}
          />
        );
      }
    } else if (status === Status.PresaleTargetMet) {
      return (
        <StatusBtn
          color={"text-green-100 bg-green-700 hover:bg-green-800"}
          text={"Presale Target Met"}
        />
      );
    } else if (status === Status.Expired) {
      return (
        <StatusBtn
          color={"text-gray-100 bg-gray-700 hover:bg-gray-800"}
          text={"Expired"}
        />
      );
    } else if (status === Status.VestingCompleted) {
      return (
        <StatusBtn
          color={"text-blue-100 bg-blue-700 hover:bg-blue-800"}
          text={"Vesting Completed"}
        />
      );
    } else if (status === Status.VestingInProgress) {
      return (
        <StatusBtn
          color={"text-yellow-100 bg-yellow-700 hover:bg-yellow-800"}
          text={"Vesting In Progress"}
        />
      );
    } else if (status === Status.ReadyToLaunch) {
      if (publicKey && publicKey.toBase58() === pool.authority) {
        return (
          <StatusBtn
            handleClick={launch}
            loading={loading}
            disabled={false}
            color={"text-red-100 bg-red-700 hover:bg-red-800"}
            text={loading ? "" : "Launch"}
          />
        );
      } else {
        return (
          <StatusBtn
            color={"text-red-100 bg-red-700 hover:bg-red-800"}
            text={"Awaiting Creator To Launch"}
          />
        );
      }
    }
  }, [status, publicKey, pool, loading, nft, launch]);

  function setTabProps(tab: TabType) {
    return {
      value: tab,
      id: `simple-tab-${tab}`,
      "aria-controls": `simple-tabpanel-${tab}`,
    };
  }

  const TabContent = useMemo(() => {
    if (!pool || !status) return;
    switch (tabValue) {
      case TabType.MAIN:
        return (
          <div className="flex flex-col w-full gap-4">
            <EditableDocument
              pool={pool}
              showEditButton={false}
              title={"Info"}
              titleStyle={"text-base md:text-lg text-gray-400"}
            />
            <div className="flex flex-col gap-4 border p-4 rounded w-full text-gray-400 font-medium">
              <MainPane
                image={pool.image}
                name={pool.name}
                symbol={pool.symbol}
                authority={pool.authority}
              />
              {(status == Status.PresaleInProgress ||
                status == Status.PresaleTargetMet ||
                status == Status.ReadyToLaunch) && (
                <PresaleDashboard
                  liquidityPoolSupply={pool.liquidityPoolSupply}
                  collectionsRequired={pool.collectionsRequired}
                  uniqueBackers={uniqueBackers}
                  symbol={pool.symbol}
                  decimal={pool.decimal}
                  totalSupply={pool.totalSupply}
                  vestingPeriod={pool.vestingPeriod}
                  liquidityCollected={pool.liquidityCollected}
                  presaleTimeLimit={pool.presaleTimeLimit}
                  presaleTarget={pool.presaleTarget}
                  creatorFeeBasisPoints={pool.creatorFeeBasisPoints}
                  lpMint={pool.lpMint}
                  mint={pool.mint}
                  description={pool.description}
                />
              )}
              {(status == Status.VestingInProgress ||
                status == Status.VestingCompleted) && (
                <VestingDashboard
                  description={pool.description}
                  price={price}
                  symbol={pool.symbol}
                  decimal={pool.decimal}
                  totalSupply={pool.totalSupply}
                  vestingPeriod={pool.vestingPeriod}
                  uniqueBackers={uniqueBackers}
                  vestingStartedAt={pool.vestingStartedAt}
                  totalLpClaimed={pool.totalLpClaimed}
                  totalMintClaimed={pool.totalMintClaimed}
                  initialSupply={pool.initialSupply}
                  amountLpReceived={pool.amountLpReceived}
                  liquidityPoolSupply={pool.liquidityPoolSupply}
                  creatorFeeBasisPoints={pool.creatorFeeBasisPoints}
                  mint={pool.mint}
                  lpMint={pool.lpMint}
                />
              )}
              <div className="mt-4">{StatusButton}</div>
            </div>
            <CommentsSection poolId={pool.pool} poolCreator={pool.authority} />
          </div>
        );
      case TabType.THUMBNAIL:
        return <ThumbnailSection pool={pool} />;
      case TabType.PROJECTINFO:
        return (
          <EditableDocument
            pool={pool}
            title={"Info"}
            titleStyle={"text-base md:text-lg text-gray-400"}
          />
        );
      case TabType.REWARDS:
        return <RewardsSection pool={pool} editingMode={true} />;
      case TabType.PURCHASE:
        return <></>;
    }
  }, [pool, tabValue, status]);

  const TabNavigationBar = useMemo(() => {
    return (
      pool &&
      pool.authority == publicKey?.toBase58() && (
        <Tabs
          orientation={matches ? "vertical" : "horizontal"}
          value={tabValue}
          onChange={handleChange}
          variant="scrollable"
          className="w-full md:w-32"
          aria-label="project tabs"
        >
          <Tab label="Main" {...setTabProps(TabType.MAIN)} />
          <Tab label="Thumbnail" {...setTabProps(TabType.THUMBNAIL)} />
          <Tab label="Info" {...setTabProps(TabType.PROJECTINFO)} />
          <Tab label="Rewards" {...setTabProps(TabType.REWARDS)} />
          <Tab label="Purchase" disabled {...setTabProps(TabType.PURCHASE)} />
        </Tabs>
      )
    );
  }, [tabValue, matches, pool, publicKey]);
  return (
    <div className="flex flex-col md:flex-row max-w-screen-xl gap-8 justify-center w-full h-full">
      {TabNavigationBar}
      <div className="flex w-full max-w-screen-lg justify-center">
        {TabContent}
      </div>
    </div>
  );
}
