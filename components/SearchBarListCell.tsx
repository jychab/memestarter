import React from "react";
import { Trait } from "../contexts/DataProvider";
import Image from "next/image";

export function SearchBarListCell(
  index: number,
  handleSelectItem: (selectedItem: Trait) => void,
  trait: Trait,
  reset: () => void
): React.JSX.Element {
  return (
    <li
      key={index}
      onClick={() => {
        handleSelectItem(trait);
        reset();
      }}
    >
      <div className="flex items-center p-1 gap-4 rounded bg-gray-700 hover:bg-gray-600">
        <Image
          height="0"
          width="0"
          sizes="100vw"
          className="rounded-full w-6 h-auto"
          src={trait.image}
          alt={""}
        />
        <div className="flex flex-col truncate text-[10px] sm:text-xs flex-1 min-w-0">
          <span>{trait.collectionName?.toUpperCase()}</span>
          <div className="text-yellow-400">
            {trait.trait_type && trait.trait_value && (
              <>
                <span>{trait.trait_type?.toUpperCase()}</span>
                {": "}
                <span>{trait.trait_value?.toUpperCase()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
