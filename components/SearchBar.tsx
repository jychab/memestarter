import React, { FC, useEffect, useRef, useState } from "react";
import { Trait } from "../contexts/DataProvider";
import { useData } from "../hooks/useData";
import { SearchBarListCell } from "./SearchBarListCell";
import { TraitChip } from "./TraitChip";
import { useWallet } from "@solana/wallet-adapter-react";

export enum FilterEnum {
  All = "All",
  Filled = "Filled",
  Empty = "Empty",
  Eligible = "Show Eligible",
}

export enum SortEnum {
  MostClaimed = "Most Claimed",
}
interface SearchBarProps {
  placeholderString?: string;
  selectedTraits: Trait[];
  setSelectedTraits: React.Dispatch<React.SetStateAction<Trait[]>>;
  filterCriteria?: FilterEnum;
  setFilterCriteria?: React.Dispatch<React.SetStateAction<FilterEnum>>;
  sortCriteria?: SortEnum;
  setSortCriteria?: React.Dispatch<React.SetStateAction<SortEnum>>;
  hideFilter?: boolean;
  hideSort?: boolean;
}

export const SearchBar: FC<SearchBarProps> = ({
  placeholderString,
  selectedTraits,
  setSelectedTraits,
  filterCriteria,
  setFilterCriteria,
  setSortCriteria,
  sortCriteria,
  hideFilter = false,
  hideSort = true,
}) => {
  const searchText = useRef<any>("");
  const { publicKey } = useWallet();
  const { traits } = useData();
  const [searchItems, setSearchItems] = useState<Trait[]>([]);
  const [expandSort, setExpandSort] = useState(false);
  const [expandFilter, setExpandFilter] = useState(false);

  const reset = () => {
    searchText.current.value = "";
    setSearchItems([]);
  };

  const predicate = (text: string, trait: Trait) => {
    return (
      trait.collectionName.toLowerCase().includes(text) ||
      (trait.trait_type !== null &&
        trait.trait_type.toLowerCase().includes(text)) ||
      (trait.trait_value !== null &&
        trait.trait_value.toLowerCase().includes(text))
    );
  };

  const handleChange = () => {
    if (searchText.current.value.length === 0 || !traits) {
      setSearchItems([]);
      return;
    }
    setSearchItems(
      traits.filter((item) =>
        predicate(searchText.current.value.toLowerCase(), item)
      )
    );
  };

  const handleSelectItem = (selectedItem: Trait) => {
    setSelectedTraits((previous) => {
      if (!selectedItem.trait_type && !selectedItem.trait_value) {
        const index = previous.findIndex(
          (item) =>
            item.collectionMintAddress === selectedItem.collectionMintAddress
        );
        if (index !== -1) {
          previous = previous.filter(
            (item) =>
              item.collectionMintAddress !== selectedItem.collectionMintAddress
          );
        }
        return [...previous, selectedItem];
      }

      const index = previous.findIndex(
        (item) =>
          item.collectionMintAddress === selectedItem.collectionMintAddress &&
          item.trait_type &&
          item.trait_value &&
          item.trait_type === selectedItem.trait_type &&
          item.trait_value === selectedItem.trait_value
      );
      if (index !== -1) {
        return [...previous];
      }
      previous = previous.filter(
        (item) =>
          item.collectionMintAddress !== selectedItem.collectionMintAddress ||
          (item.collectionMintAddress === selectedItem.collectionMintAddress &&
            item.trait_type &&
            item.trait_value)
      );

      return [...previous, selectedItem];
    });
  };

  const filterDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDialogRef.current &&
        !filterDialogRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setExpandFilter(false);
      }
    };
    // Attach event listener when the dialog is open
    if (expandFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandFilter]);

  const sortDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDialogRef.current &&
        !sortDialogRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setExpandSort(false);
      }
    };
    // Attach event listener when the dialog is open
    if (expandSort) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandSort]);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            id="searchBar"
            type="text"
            ref={searchText}
            onChange={handleChange}
            className=" border text-sm rounded-lg block w-full md:max-w-96 ps-10 p-2  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:outline-none"
            placeholder={placeholderString ? placeholderString : "Search"}
          />
        </div>
        <div className="flex w-fit whitespace-nowrap items-center gap-2 text-[10px] sm:text-xs">
          {!hideFilter && filterCriteria && setFilterCriteria && (
            <div className="relative">
              <button
                onClick={() => setExpandFilter(!expandFilter)}
                id="dropdownActionButton"
                data-dropdown-toggle="dropdownAction"
                className={`flex items-center gap-2 ${
                  filterCriteria !== FilterEnum.All
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z"
                    fill="currentColor"
                  />
                </svg>

                <span className="hidden md:block text-gray-400">
                  {filterCriteria}
                </span>
              </button>
              <div
                ref={filterDialogRef}
                hidden={!expandFilter}
                className="absolute z-10 rounded right-0 shadow w-fit bg-gray-700"
              >
                <ul className="p-1 text-gray-200">
                  {Object.values(FilterEnum)
                    .filter((item) =>
                      publicKey ? true : item !== FilterEnum.Eligible
                    )
                    .map((value) => (
                      <li key={value}>
                        <div
                          onClick={() => {
                            setFilterCriteria(value);
                            setExpandFilter(false);
                          }}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-600"
                        >
                          <input
                            id={value}
                            type="radio"
                            checked={filterCriteria === value}
                            readOnly
                            className="w-4 h-4 text-blue-600 ring-offset-gray-800 focus:ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
                          />
                          <span className="w-full font-medium text-gray-300">
                            {value}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
          {!hideSort && sortCriteria && setSortCriteria && (
            <div className="relative">
              <button
                onClick={() => setExpandSort(!expandSort)}
                className="flex items-center gap-2 text-gray-500"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11.1924 5.65685C11.5829 5.26633 11.5829 4.63316 11.1924 4.24264L8.36397 1.41421C8.30576 1.356 8.24485 1.30212 8.18165 1.25259C7.50286 0.720577 6.55947 0.689024 5.84929 1.15793C5.73839 1.23115 5.63317 1.31658 5.53554 1.41421L2.70711 4.24264C2.31658 4.63316 2.31658 5.26633 2.70711 5.65685C3.09763 6.04738 3.7308 6.04738 4.12132 5.65685L6.00003 3.77814V18C6.00003 18.5523 6.44775 19 7.00003 19C7.55232 19 8.00003 18.5523 8.00003 18V3.8787L9.77818 5.65685C10.1687 6.04737 10.8019 6.04737 11.1924 5.65685Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12.7071 18.3432C12.3166 18.7337 12.3166 19.3668 12.7071 19.7574L15.5355 22.5858C15.6332 22.6834 15.7384 22.7689 15.8493 22.8421C16.6256 23.3546 17.6805 23.2692 18.364 22.5858L21.1924 19.7574C21.5829 19.3668 21.5829 18.7337 21.1924 18.3432C20.8019 17.9526 20.1687 17.9526 19.7782 18.3432L18 20.1213L18 6C18 5.44771 17.5523 5 17 5C16.4477 5 16 5.44771 16 6L16 20.2218L14.1213 18.3432C13.7308 17.9526 13.0976 17.9526 12.7071 18.3432Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="hidden md:block text-gray-400">
                  {sortCriteria}
                </span>
              </button>
              <div
                ref={sortDialogRef}
                hidden={!expandSort}
                className="absolute z-10 rounded shadow right-0 w-fit bg-gray-700"
              >
                <ul className="p-2 text-gray-200">
                  {Object.values(SortEnum).map((value) => (
                    <li key={value}>
                      <div
                        onClick={() => {
                          setSortCriteria(value);
                          setExpandSort(false);
                        }}
                        className="flex items-center p-2 rounded hover:bg-gray-600"
                      >
                        <input
                          id={value}
                          type="radio"
                          checked={sortCriteria === value}
                          readOnly
                          className="w-4 h-4 text-blue-600 ring-offset-gray-800 focus:ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
                        />
                        <span className="w-full ms-2 font-medium rounded text-gray-300">
                          {value}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <ul
        hidden={!(searchItems && searchItems.length > 0)}
        className="fixed w-full mt-12 max-w-72 lg:max-w-96 z-50 p-2 overflow-y-auto rounded-lg max-h-72 shadow bg-gray-700 text-gray-200"
      >
        {searchItems.filter((item) => !item.trait_type && !item.trait_value)
          .length > 0 && (
          <span className="p-2 text-xs font-semibold flex w-full rounded">
            COLLECTION
          </span>
        )}
        {searchItems
          .filter((item) => !item.trait_type && !item.trait_value)
          .map((item, index) =>
            SearchBarListCell(index, handleSelectItem, item, reset)
          )}
        {searchItems.filter((item) => item.trait_type && item.trait_value)
          .length > 0 && (
          <span className="p-2 text-xs font-semibold flex w-full rounded">
            TRAITS
          </span>
        )}
        {searchItems
          .filter((item) => item.trait_type && item.trait_value)
          .map((item, index) =>
            SearchBarListCell(index, handleSelectItem, item, reset)
          )}
      </ul>
      <div className="flex items-center gap-2">
        {selectedTraits.length > 0 && (
          <span className="text-gray-400 text-xs sm:text-sm">Traits:</span>
        )}
        <div className="flex-wrap flex overflow-auto max-h-36 items-center gap-2">
          {selectedTraits.map((badge, index) => (
            <TraitChip
              key={index}
              trait={badge}
              dismiss={() => {
                setSelectedTraits(selectedTraits.filter((b) => b !== badge));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
