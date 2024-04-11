import { FC, useEffect, useRef, useState } from "react";
import { CollectionDetails } from "../utils/types";
import Image from "next/image";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../utils/firebase";

export interface SearchBarProps {
  handleSelectedItem: (item: CollectionDetails) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ handleSelectedItem }) => {
  const searchText = useRef<any>("");
  const [collections, setCollections] = useState<CollectionDetails[]>();
  const [searchItems, setSearchItems] = useState<CollectionDetails[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "CollectionDetails"))).then((response) => {
      if (!response.empty) {
        setCollections(
          response.docs.map((item) => item.data() as CollectionDetails)
        );
      } else {
        setCollections([]);
      }
    });
  }, []);

  const reset = () => {
    searchText.current.value = "";
    setSearchItems([]);
  };

  const predicate = (text: string, collection: CollectionDetails) => {
    return collection.name.toLowerCase().includes(text);
  };

  const handleChange = () => {
    if (searchText.current.value.length === 0 || !collections) {
      setSearchItems([]);
      return;
    }
    setSearchItems(
      collections.filter((item) =>
        predicate(searchText.current.value.toLowerCase(), item)
      )
    );
  };
  return (
    <div className="relative">
      <input
        id="searchBar"
        type="text"
        ref={searchText}
        onChange={handleChange}
        className="border text-xs rounded-lg block w-full max-w-48 p-2 border-gray-300 text-black focus:outline-none"
        placeholder={"Search"}
      />
      <ul
        hidden={!(searchItems && searchItems.length > 0)}
        className="absolute mt-2 w-full max-w-96 p-2 overflow-y-auto rounded-lg max-h-72 shadow bg-white border border-gray-300 text-black"
      >
        {searchItems.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              handleSelectedItem(item);
              reset();
            }}
          >
            <div className="flex items-center p-1 gap-2 rounded hover:text-blue-600">
              <Image
                height="0"
                width="0"
                sizes="100vw"
                className="rounded-full w-6 h-auto"
                src={item.image}
                alt={""}
              />
              <div className="flex flex-col truncate text-[10px] sm:text-xs flex-1 min-w-0">
                <span>{item.name.toUpperCase()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
