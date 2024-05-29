import { Tab, Tabs } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { CreatedTable } from "../../components/tables/Created/CreatorCreatedTable";
import { FailedTable } from "../../components/tables/Created/CreatorFailedTable";
import { LaunchedTable } from "../../components/tables/Created/CreatorLaunchedTable";
import { db } from "../../utils/firebase";
import { getStatus } from "../../utils/helper";
import { PoolType, Status } from "../../utils/types";

enum CreatorProjectType {
  All = "All",
  Created = "Created",
  Launched = "Launched",
  Failed = "Failed",
}
function MyProjects() {
  const { publicKey } = useWallet();
  const [myPools, setMyPools] = useState<PoolType[]>();
  const [projectType, setProjectType] = useState<CreatorProjectType>(
    CreatorProjectType.Created
  );

  const [timer, setTimer] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTimer(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicKey) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, `Pool`),
          where("valid", "==", true),
          where("authority", "==", publicKey.toBase58())
        ),
        (response) =>
          setMyPools(response.docs.map((doc) => doc.data() as PoolType))
      );
      return () => unsubscribe();
    }
  }, [publicKey]);

  const createdProjects = useMemo(() => {
    if (!myPools) return [];
    return myPools.filter((item) => {
      const status = getStatus(item);
      return (
        ((projectType === CreatorProjectType.Created ||
          projectType === CreatorProjectType.All) &&
          status === Status.PresaleInProgress) ||
        status === Status.PresaleTargetMet ||
        status === Status.ReadyToLaunch
      );
    });
  }, [myPools, projectType]);
  const launchedProjects = useMemo(() => {
    if (!myPools) return [];
    return myPools.filter((item) => {
      const status = getStatus(item);
      return (
        ((projectType === CreatorProjectType.Launched ||
          projectType === CreatorProjectType.All) &&
          status === Status.VestingCompleted) ||
        status === Status.VestingInProgress
      );
    });
  }, [myPools, projectType]);
  const failedProjects = useMemo(() => {
    if (!myPools) return [];
    return myPools.filter((item) => {
      const status = getStatus(item);
      return (
        (projectType === CreatorProjectType.Failed ||
          projectType === CreatorProjectType.All) &&
        status === Status.Expired
      );
    });
  }, [myPools, projectType]);

  function setTabProps(tab: CreatorProjectType) {
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
        <Tab label="All" {...setTabProps(CreatorProjectType.All)} />
        <Tab label="Created" {...setTabProps(CreatorProjectType.Created)} />
        <Tab label="Launched" {...setTabProps(CreatorProjectType.Launched)} />
        <Tab label="Failed" {...setTabProps(CreatorProjectType.Failed)} />
      </Tabs>
    );
  }, [projectType]);
  return !publicKey ? (
    <span className="text-black">You need to sign in first.</span>
  ) : (
    <div className="flex flex-col w-full h-full justify-center max-w-screen-lg gap-4 text-gray-400 text-sm">
      {TabNavigationBar}
      {projectType === CreatorProjectType.All && (
        <span>{CreatorProjectType.Created}</span>
      )}
      {(projectType === CreatorProjectType.All ||
        projectType === CreatorProjectType.Created) && (
        <CreatedTable pool={createdProjects} timer={timer} />
      )}
      {projectType === CreatorProjectType.All && (
        <span>{CreatorProjectType.Launched}</span>
      )}
      {(projectType === CreatorProjectType.Launched ||
        projectType === CreatorProjectType.All) && (
        <LaunchedTable pool={launchedProjects} timer={timer} />
      )}
      {projectType === CreatorProjectType.All && (
        <span>{CreatorProjectType.Failed}</span>
      )}
      {(projectType === CreatorProjectType.Failed ||
        projectType === CreatorProjectType.All) && (
        <FailedTable pool={failedProjects} timer={timer} />
      )}
    </div>
  );
}

export default MyProjects;
