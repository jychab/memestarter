import {
  orderBy,
  limit,
  onSnapshot,
  collectionGroup,
  collection,
  where,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../utils/firebase";
import { PoolType } from "../utils/types";
import CardItem from "../components/CardItem";

enum SortCriteria {
  presaleTimeLimit = "Ending Soon",
  liquidity = "Most Popular",
  createdTime = "Recent",
}

enum FilterCriteria {
  all = "All",
  ongoing = "Ongoing",
  launched = "Launched",
  expired = "Expired",
}

function Projects({ initialProjects }: { initialProjects: PoolType[] }) {
  const [projects, setProjects] = useState<PoolType[]>(initialProjects);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(
    SortCriteria.presaleTimeLimit
  );
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
    FilterCriteria.ongoing
  );
  const fitlerDropDownRef = useRef<HTMLDivElement>(null);
  const [showFilter, setShowFilter] = useState(false);
  const sortDropDownRef = useRef<HTMLDivElement>(null);
  const [showSort, setShowSort] = useState(false);

  const [page, setPage] = useState(1);
  const [timer, setTimer] = useState<number>();

  useEffect(() => {
    const interval = setInterval(() => setTimer(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);
  const createQuery = (max: number) => {
    const base = collection(db, "Pool");
    const queries = [];
    queries.push(where("valid", "==", true));
    if (filterCriteria) {
      switch (filterCriteria) {
        case FilterCriteria.ongoing:
          queries.push(where("status", "==", "Initialized"));
          break;
        case FilterCriteria.launched:
          queries.push(where("status", "==", "Launched"));
          break;
        case FilterCriteria.expired:
          queries.push(where("status", "==", "Ended"));
          break;
        default:
          break;
      }
    }

    if (sortCriteria) {
      switch (sortCriteria) {
        case SortCriteria.createdTime:
          queries.push(orderBy("createdAt", "desc"));
          break;
        case SortCriteria.liquidity:
          queries.push(orderBy("liquidityCollected", "desc"));
          break;
        default:
          queries.push(orderBy("presaleTimeLimit", "asc"));
          break;
      }
    }

    queries.push(limit(max));

    return query(base, ...queries);
  };
  useEffect(() => {
    if (page && sortCriteria && filterCriteria) {
      const projectQuery = createQuery(page * 10);
      const unsubscribe = onSnapshot(projectQuery, (querySnapshot) => {
        if (initialLoad) {
          setInitialLoad(false);
          return;
        }
        console.log("test");
        const updatedProjects: PoolType[] = [];
        querySnapshot.forEach((doc) => {
          // Convert each document to a plain JavaScript object
          updatedProjects.push(doc.data() as PoolType);
        });
        setProjects(updatedProjects);
      });

      return () => unsubscribe();
    }
  }, [page, sortCriteria, filterCriteria]);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fitlerDropDownRef.current &&
        !fitlerDropDownRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setShowFilter(false);
      }
    };

    // Attach event listener when the dialog is open
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropDownRef.current &&
        !sortDropDownRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setShowSort(false);
      }
    };

    // Attach event listener when the dialog is open
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSort]);

  return (
    <div className="flex flex-col w-full h-fit max-w-screen-xl mx-auto gap-4">
      <div className="flex gap-4">
        <div className="flex items-center justify-start">
          <div className="relative">
            <button
              id="dropdown-type-button"
              onClick={() => setShowFilter(!showFilter)}
              className="relative flex-shrink-0 z-10 w-28 inline-flex items-center py-2 px-2 justify-center text-sm font-medium text-center border rounded-3xl focus:outline-none text-black border-gray-300"
              type="button"
            >
              {filterCriteria}
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
              hidden={!showFilter}
              ref={fitlerDropDownRef}
              className="z-20 mt-2 absolute rounded w-28"
            >
              <ul className="py-2 text-sm text-black z-30 bg-white border-gray-300 border">
                {Object.values(FilterCriteria).map((value, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="inline-flex w-full px-4 py-2 text-sm "
                      onClick={() => {
                        setFilterCriteria(value);
                        setShowFilter(false);
                      }}
                    >
                      {value}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start">
          <div className="relative">
            <button
              id="dropdown-type-button"
              onClick={() => setShowSort(!showSort)}
              className="relative flex-shrink-0 z-10 w-48 inline-flex items-center py-2 px-2 justify-center text-sm font-medium text-center border rounded-3xl focus:outline-none text-black border-gray-300"
              type="button"
            >
              {`Sort: ${sortCriteria}`}
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
              hidden={!showSort}
              ref={sortDropDownRef}
              className="z-20 mt-2 absolute rounded w-48"
            >
              <ul className="py-2 text-sm text-black z-30 bg-white border-gray-300 border">
                {Object.values(SortCriteria).map((value, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="inline-flex w-full px-4 py-2 text-sm "
                      onClick={() => {
                        setSortCriteria(value);
                        setShowSort(false);
                      }}
                    >
                      {value}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {projects &&
          projects.length > 0 &&
          projects
            .filter((_, index) => index >= (page - 1) * 10 && index < page * 10)
            .map((project) => (
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

export async function getServerSideProps() {
  // Fetch initial data from Firestore
  const projectQuery = query(
    collection(db, "Pool"),
    where("valid", "==", true),
    where("status", "==", "Initialized"),
    orderBy("presaleTimeLimit", "asc"),
    limit(10)
  );
  const querySnapshot = await getDocs(projectQuery);

  const initialProjects: PoolType[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as PoolType;
    initialProjects.push({
      ...data,
      createdAt: data.createdAt
        ? (data.createdAt as Timestamp).toDate().getTime()
        : null,
      updatedAt: data.updatedAt
        ? (data.updatedAt as Timestamp).toDate().getTime()
        : null,
    });
  });

  // Pass initial data as props to the page component
  return {
    props: {
      initialProjects,
    },
  };
}
export default Projects;
