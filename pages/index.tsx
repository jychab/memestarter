import {
  query,
  orderBy,
  limit,
  onSnapshot,
  collectionGroup,
  collection,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { Pool } from "../utils/types";
import CardItem from "../components/CardItem";
import { CreateProjectBtn } from "../components/buttons/CreateProjectBtn";

enum SortCriteria {
  liquidity = "liquidityCollected",
  presaleTimeLimit = "presaleTimeLimit",
  vestingPeriod = "vestingPeriod",
  createdTime = "createdAt",
}

function Projects() {
  const [projects, setProjects] = useState<Pool[]>();
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(
    SortCriteria.createdTime
  );
  const [page, setPage] = useState(1);
  const [timer, setTimer] = useState<number>();

  useEffect(() => {
    const interval = setInterval(() => setTimer(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ((!projects || page * 10 > projects.length) && sortCriteria) {
      const mintedItems = query(
        collection(db, "Pool"),
        orderBy(sortCriteria, "desc"),
        limit(page * 10)
      );

      const unsubscribe = onSnapshot(mintedItems, (querySnapshot) => {
        setProjects((prev) => (!prev ? [] : prev));
        querySnapshot.docChanges().forEach((change) => {
          const newData = change.doc.data() as Pool;
          if (change.type === "added") {
            // Handle added document
            if (
              !projects ||
              !projects.some((item) => item.pool === newData.pool)
            ) {
              setProjects((prevProject) =>
                prevProject
                  ? [newData, ...prevProject].sort(
                      (a, b) => b.createdAt.seconds - a.createdAt.seconds
                    )
                  : [newData]
              );
            }
          } else if (change.type === "modified") {
            // Handle modified document
            setProjects(
              (prevProject) =>
                prevProject &&
                prevProject.map((item) =>
                  item.pool === newData.pool ? newData : item
                )
            );
          } else if (change.type === "removed") {
            // Handle removed document
            setProjects(
              (prevProjects) =>
                prevProjects &&
                prevProjects.filter((item) => item.pool !== newData.pool)
            );
          }
        });
      });

      return !projects || page * 10 > projects.length
        ? () => unsubscribe()
        : () => {};
    }
  }, [page, sortCriteria]);

  return (
    <div className="flex flex-col w-full h-fit max-w-screen-2xl mx-auto gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 p-4">
        {projects &&
          projects.length > 0 &&
          projects.map((project) => (
            <CardItem pool={project} key={project.pool} timer={timer} />
          ))}
      </div>

      {projects && projects.length > 10 && (
        <div className="overflow-hidden flex items-end justify-end">
          <div className="flex items-center">
            <span className="text-sm font-normal text-gray-400 px-2">
              Showing
              <span className="font-semibold text-white px-2">
                {`${(page - 1) * 10 + 1} to ${projects.length}`}
              </span>
              of
              <span className="font-semibold text-white px-2">
                {projects.length}
              </span>
            </span>
            <div className="flex items-center justify-end gap-2 ">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                className="flex items-center justify-center px-2 py-1 text-xs font-medium border rounded-lg bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(page + 1, Math.ceil(projects.length / 10)))
                }
                className="flex items-center justify-center px-2 py-1 text-xs font-medium border rounded-lg bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
