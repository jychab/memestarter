import { Tab, Tabs } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import Image from "next/image";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FundedTable } from "../components/tables/BackedTable";
import { ExpiredTable } from "../components/tables/FailedTable";
import { VestingTable } from "../components/tables/LaunchedTable";
import { useData } from "../hooks/useData";
import { useLogin } from "../hooks/useLogin";
import { linkAsset, unlinkAsset } from "../utils/cloudFunctions";
import { getCustomErrorMessage } from "../utils/error";
import { db } from "../utils/firebase";
import { getStatus } from "../utils/helper";
import { DAS, MintType, PoolType, Status } from "../utils/types";

interface InventoryItemProps {
  item: DAS.GetAssetResponse;
  collectionItem?: DAS.GetAssetResponse;
  setSelectedItem?: (item: any) => void;
}
enum ProjectType {
  all = "All",
  backed = "Backed",
  launched = "Launched",
  failed = "Failed",
}
export interface Project extends MintType, PoolType {}

export const MintDashboard: FC<InventoryItemProps> = ({
  item,
  collectionItem,
  setSelectedItem,
}) => {
  const [projects, setProjects] = useState<Project[]>();
  const [image, setImage] = useState<string>();
  const [name, setName] = useState<string>();
  const [collectionImage, setCollectionImage] = useState<string>();
  const [collectionName, setCollectionName] = useState<string>();
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.all);
  const [loading, setLoading] = useState(false);
  const { publicKey, signMessage } = useWallet();
  const { handleLogin } = useLogin();
  const { nft } = useData();
  const [timer, setTimer] = useState<number>(Date.now());

  function isItemCurrentlyEquipped(
    nft: DAS.GetAssetResponse | undefined,
    item: DAS.GetAssetResponse | undefined
  ) {
    return nft && item && item.id === nft.id;
  }
  useEffect(() => {
    const interval = setInterval(() => setTimer(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadProject(
    docs: QueryDocumentSnapshot<DocumentData, DocumentData>[]
  ) {
    const temp: Project[] = [];
    await Promise.all(
      docs.map(async (docRef) => {
        const data = docRef.data() as MintType;
        const document = await getDoc(doc(db, `Pool/${data.pool}`));
        if (document.exists()) {
          const poolData = document.data() as PoolType;
          temp.push({ ...data, ...poolData });
        }
      })
    );
    return temp;
  }
  useEffect(() => {
    if (item) {
      setImage(item.content?.links?.image);
      setName(item.content?.metadata.name);
    }
  }, [item]);
  useEffect(() => {
    if (collectionItem) {
      setCollectionImage(collectionItem.content?.links?.image);
      setCollectionName(collectionItem.content?.metadata.name);
    }
  }, [collectionItem]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, `Mint/${item.id}/Pool`)),
      (snapshot) => {
        loadProject(snapshot.docs).then((res) => setProjects(res));
      }
    );
    return () => unsubscribe();
  }, [item, projectType, publicKey]);

  const handleLinkage = useCallback(
    async (selectedItem: DAS.GetAssetResponse | undefined) => {
      if (!(publicKey && signMessage && selectedItem)) return;
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        if (isItemCurrentlyEquipped(nft, selectedItem) || nft) {
          await unlinkAsset();
        } else {
          await linkAsset(selectedItem);
        }
        toast.success("Success");
      } catch (error) {
        toast.error(`${getCustomErrorMessage(error)}`);
      } finally {
        setLoading(false);
        if (setSelectedItem) {
          setSelectedItem(undefined);
        }
      }
    },
    [handleLogin, publicKey, signMessage, nft, setSelectedItem]
  );

  // Define useMemo for expensive computation of projects
  const fundedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((item) => {
      const status = getStatus(item);
      return (
        (projectType === ProjectType.backed ||
          projectType === ProjectType.all) &&
        (status === Status.PresaleInProgress ||
          status === Status.PresaleTargetMet ||
          status === Status.ReadyToLaunch)
      );
    });
  }, [projects, projectType]);

  // Define useMemo for other filtered project types
  const launchedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((item) => {
      const status = getStatus(item);
      return (
        (projectType === ProjectType.launched ||
          projectType === ProjectType.all) &&
        (status === Status.VestingInProgress ||
          status === Status.VestingCompleted)
      );
    });
  }, [projects, projectType]);

  const expiredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((item) => {
      const status = getStatus(item);
      return (
        (projectType === ProjectType.failed ||
          projectType === ProjectType.all) &&
        status === Status.Expired
      );
    });
  }, [projects, projectType]);

  function setTabProps(tab: ProjectType) {
    return {
      value: tab,
      id: `simple-tab-${tab}`,
      "aria-controls": `simple-tabpanel-${tab}`,
    };
  }

  const TabNavigationBar = useMemo(() => {
    return (
      <Tabs
        orientation={"horizontal"}
        value={projectType}
        onChange={(e, value) => setProjectType(value)}
        variant="scrollable"
        className="w-full"
        aria-label="project tabs"
      >
        <Tab label="All" {...setTabProps(ProjectType.all)} />
        <Tab label="Backed" {...setTabProps(ProjectType.backed)} />
        <Tab label="Launched" {...setTabProps(ProjectType.launched)} />
        <Tab label="Failed" {...setTabProps(ProjectType.failed)} />
      </Tabs>
    );
  }, [projectType]);

  return (
    <div className="animate-fade-left animate-ease-linear animate-duration-150 p-4 flex flex-col flex-1 w-full justify-between gap-4 border text-black border-gray-300 rounded right-2">
      <div className="flex flex-col w-full gap-4">
        <div className={`flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-2">
            {setSelectedItem && (
              <button onClick={() => setSelectedItem(undefined)}>
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    fill="currentColor"
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  />
                  <path
                    fill="currentColor"
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  />
                </svg>
              </button>
            )}
            {collectionImage && collectionName && (
              <>
                <div className="relative h-8 w-8">
                  <Image
                    className={`rounded-full object-cover cursor-pointer`}
                    fill={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={collectionImage}
                    alt={""}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[10px] uppercase text-gray-400">
                    Collection
                  </span>
                  <span className="text-[10px] text-xs">{collectionName}</span>
                </div>
              </>
            )}
          </div>

          {item.ownership.owner === publicKey?.toBase58() && (
            <button
              onClick={() => handleLinkage(item)}
              className={`flex items-center gap-1 rounded ${
                !isItemCurrentlyEquipped(nft, item)
                  ? "bg-blue-700"
                  : "bg-red-700"
              } px-2 py-1 text-blue-200`}
            >
              <span className="text-[10px] sm:text-xs text-gray-100">
                {isItemCurrentlyEquipped(nft, item)
                  ? "Remove Avatar"
                  : "Set Avatar"}
              </span>
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
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            {image && (
              <Image
                priority={true}
                className={`rounded object-cover`}
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={image}
                alt={""}
              />
            )}
          </div>
          <div className="flex flex-col w-1/2 lg:w-3/4 gap-2">
            <div className="flex flex-col w-full">
              <span className="text-[10px] sm:text-xs text-gray-400">Name</span>
              <span className="text-xs">{name}</span>
            </div>
            <div className="flex gap-2 w-full">
              <div className="flex flex-col w-full">
                <span className="text-[10px] sm:text-xs text-gray-400">
                  Mint
                </span>
                <span className="text-xs truncate">{item.id}</span>
              </div>
            </div>
          </div>
        </div>
        {TabNavigationBar}
        <div className="flex flex-col text-xs text-gray-400 gap-4">
          {projectType === ProjectType.all && <span>{ProjectType.backed}</span>}
          {(projectType === ProjectType.backed ||
            projectType === ProjectType.all) && (
            <FundedTable projects={fundedProjects} timer={timer} />
          )}
          {projectType === ProjectType.all && (
            <span>{ProjectType.launched}</span>
          )}
          {(projectType === ProjectType.launched ||
            projectType === ProjectType.all) && (
            <VestingTable projects={launchedProjects} timer={timer} />
          )}
          {projectType === ProjectType.all && <span>{ProjectType.failed}</span>}
          {(projectType === ProjectType.failed ||
            projectType === ProjectType.all) && (
            <ExpiredTable projects={expiredProjects} timer={timer} />
          )}
        </div>
      </div>
    </div>
  );
};
