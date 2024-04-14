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

function Projects() {
  const [projects, setProjects] = useState<PoolType[]>();
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
  const [loading, setLoading] = useState(false);
  const [itemsLimit, setItemsLimit] = useState(10);
  const [timer, setTimer] = useState<number>();
  const [endReached, setEndReached] = useState(false);

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

  const handleScroll = () => {
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;
    const scrollHeight =
      (document.documentElement && document.documentElement.scrollHeight) ||
      document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom =
      Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    if (scrolledToBottom && !loading && !endReached) {
      setItemsLimit((prevLimit) => prevLimit + 10); // Increase limit by 10 when scrolled to bottom
    }
  };
  useEffect(() => {
    if (itemsLimit && sortCriteria && filterCriteria) {
      setLoading(true);
      const projectQuery = createQuery(itemsLimit);
      const unsubscribe = onSnapshot(projectQuery, (querySnapshot) => {
        const updatedProjects: PoolType[] = [];
        querySnapshot.forEach((doc) => {
          // Convert each document to a plain JavaScript object
          updatedProjects.push(doc.data() as PoolType);
        });
        setProjects(updatedProjects);
        if (querySnapshot.size < itemsLimit) {
          setEndReached(true); // If fetched data is less than the limit, it means no more data available
        }
        setLoading(false);
      });

      window.addEventListener("scroll", handleScroll);
      return () => {
        unsubscribe();
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [itemsLimit, sortCriteria, filterCriteria]);

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
          projects.map((project) => (
            <CardItem pool={project} key={project.pool} timer={timer} />
          ))}
      </div>
      {loading && (
        <span className="text-black flex items-center justify-center">
          Loading...
        </span>
      )}
    </div>
  );
}

export default Projects;
