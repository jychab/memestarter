import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { PoolType, Status } from "../../utils/types";
import { CreatedTable } from "../../components/tables/CreatedTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { getStatus } from "../../utils/helper";
import { LaunchedTable } from "../../components/tables/LaunchedTable";
import { FailedTable } from "../../components/tables/FailedTable";

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
    CreatorProjectType.All
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

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

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setShow(false);
      }
    };

    // Attach event listener when the dialog is open
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

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
  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {!publicKey ? (
        <span className="text-black">You need to sign in first.</span>
      ) : (
        <div className="flex flex-col text-xs text-gray-400 gap-4">
          <div className="flex items-center justify-start">
            <div className="relative">
              <button
                id="dropdown-type-button"
                onClick={() => setShow(!show)}
                className="relative flex-shrink-0 z-10 w-28 inline-flex items-center py-2 px-2 pr-2 justify-center text-sm font-medium text-center border rounded focus:outline-none text-black border-gray-300"
                type="button"
              >
                {projectType}
                <svg
                  className="w-2.5 h-2.5 ms-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path stroke="currentColor" d="m1 1 4 4 4-4" />
                </svg>
              </button>
              <div
                id="dropdown-type"
                hidden={!show}
                ref={dropdownRef}
                className="z-20 mt-2 absolute rounded w-28"
              >
                <ul className="py-2 text-sm text-black z-30 bg-white border-gray-300 border">
                  {Object.values(CreatorProjectType).map((value, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className="inline-flex w-full px-4 py-2 text-sm "
                        onClick={() => setProjectType(value)}
                      >
                        {value}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {(projectType === CreatorProjectType.All ||
            projectType === CreatorProjectType.Created) && (
            <span>{CreatorProjectType.Created}</span>
          )}
          {(projectType === CreatorProjectType.All ||
            projectType === CreatorProjectType.Created) && (
            <CreatedTable pool={createdProjects} timer={timer} />
          )}

          {projectType === CreatorProjectType.Launched ||
            (projectType === CreatorProjectType.All && (
              <span>{CreatorProjectType.Launched}</span>
            ))}
          {(projectType === CreatorProjectType.Launched ||
            projectType === CreatorProjectType.All) && (
            <LaunchedTable pool={launchedProjects} timer={timer} />
          )}

          {(projectType === CreatorProjectType.Failed ||
            projectType === CreatorProjectType.All) && (
            <span>{CreatorProjectType.Failed}</span>
          )}
          {(projectType === CreatorProjectType.Failed ||
            projectType === CreatorProjectType.All) && (
            <FailedTable pool={failedProjects} timer={timer} />
          )}
        </div>
      )}
    </div>
  );
}

export default MyProjects;
