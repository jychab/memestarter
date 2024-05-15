import { collection, limit, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CardItem from "../components/CardItem";
import useFirestoreWtihSWR from "../hooks/useFirestoreWithSWR";
import { OnboardingScreen } from "../sections/OnboardScreen";
import { db } from "../utils/firebase";
import { PoolType } from "../utils/types";

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
    SortCriteria.liquidity
  );
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(
    FilterCriteria.ongoing
  );
  const filterDropDownRef = useRef<HTMLDivElement>(null);
  const [showFilter, setShowFilter] = useState(false);
  const sortDropDownRef = useRef<HTMLDivElement>(null);
  const [showSort, setShowSort] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemsLimit, setItemsLimit] = useState(10);
  const [timer, setTimer] = useState<number>(Date.now());
  const [endReached, setEndReached] = useState(false);
  const [hide, setHide] = useState<boolean | undefined>();
  const { useCollection } = useFirestoreWtihSWR();

  useEffect(() => {
    const interval = setInterval(() => setTimer(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);
  const createQuery = useMemo(() => {
    if (!filterCriteria || !sortCriteria || !itemsLimit) return null;
    const base = collection(db, "Pool");
    const queries = [];
    queries.push(where("valid", "==", true));

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

    queries.push(limit(itemsLimit));

    return query(base, ...queries);
  }, [filterCriteria, sortCriteria, itemsLimit]);

  useEffect(() => {
    const handleScrollDebounced = debounce(handleScroll, 200);
    function debounce<T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ) {
      let timeoutId: ReturnType<typeof setTimeout>;
      return function (this: any, ...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }
    function handleScroll() {
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
        setItemsLimit((prevLimit) => prevLimit + 10);
        setLoading(true);
      }
    }
    window.addEventListener("scroll", handleScrollDebounced);
    return () => {
      window.removeEventListener("scroll", handleScrollDebounced);
    };
  }, [loading, endReached]);

  const { data: updatedProjects } = useCollection<PoolType>(createQuery);

  useEffect(() => {
    if (updatedProjects && itemsLimit) {
      setProjects(updatedProjects);
      if (updatedProjects.length < itemsLimit) {
        setEndReached(true); // If fetched data is less than the limit, it means no more data available
      }
      setLoading(false);
    }
  }, [updatedProjects, itemsLimit]);

  const handleClickOutside = <T extends HTMLElement>(
    event: MouseEvent,
    ref: React.RefObject<T>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShow(false);
    }
  };
  useEffect(() => {
    const handleClickOutsideFilter = (event: MouseEvent) =>
      handleClickOutside(event, filterDropDownRef, setShowFilter);
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutsideFilter);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideFilter);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFilter);
    };
  }, [showFilter]);

  useEffect(() => {
    const handleClickOutsideSort = (event: MouseEvent) =>
      handleClickOutside(event, sortDropDownRef, setShowSort);
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutsideSort);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    };
  }, [showSort]);

  return (
    <>
      <OnboardingScreen hide={hide} setHide={setHide} />
      <div className="flex flex-col w-full h-fit max-w-screen-xl mx-auto gap-4 overflow-auto scrollbar-none">
        <div className="flex gap-4">
          <div className="flex items-center justify-start">
            <div className="relative">
              <button
                id="dropdown-type-button"
                onClick={() => setShowFilter(!showFilter)}
                className="relative flex-shrink-0 z-10 w-24 inline-flex items-center p-2 justify-center text-xs md:text-sm font-medium text-center border rounded-3xl focus:outline-none text-black border-gray-300"
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
                ref={filterDropDownRef}
                className="z-20 mt-2 absolute rounded w-24"
              >
                <ul className="py-2 text-xs text-black z-30 bg-white border-gray-300 border">
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
                className="relative flex-shrink-0 z-10 w-40 md:w-44 inline-flex items-center p-2 justify-center text-xs md:text-sm font-medium text-center border rounded-3xl focus:outline-none text-black border-gray-300"
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
                className="z-20 mt-2 absolute rounded w-40 md:w-44"
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
          <button
            className="flex items-center gap-1"
            onClick={() => setHide(false)}
          >
            <span className="text-xs md:text-sm hover:underline hover:text-blue-600">
              Tutorial
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
    </>
  );
}

export default Projects;
