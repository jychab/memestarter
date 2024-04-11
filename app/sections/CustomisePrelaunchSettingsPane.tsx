import React, { FC, useEffect, useRef, useState } from "react";
import { DurationPicker } from "../components/DurationPicker";
import { SearchBar } from "../components/SearchBar";
import { CollectionDetails } from "../utils/types";
import { Chip } from "../components/Chip";

interface CustomisePrelaunchSettingsPaneProps {
  presaleTarget: string;
  setPresaleTarget: React.Dispatch<React.SetStateAction<string>>;
  maxAmountPerPurchase: string;
  setMaxAmountPerPurchase: React.Dispatch<React.SetStateAction<string>>;
  vestingPeriod: number;
  setVestingPeriod: React.Dispatch<React.SetStateAction<number>>;
  presaleDuration: number;
  setPresaleDuration: React.Dispatch<React.SetStateAction<number>>;
  vestingSupply: string;
  setVestingSupply: React.Dispatch<React.SetStateAction<string>>;
  creatorFees: string;
  setCreatorFees: React.Dispatch<React.SetStateAction<string>>;
  collectionsRequired: CollectionDetails[];
  setCollectionsRequired: React.Dispatch<
    React.SetStateAction<CollectionDetails[]>
  >;
}

export enum Period {
  Hours = "Hours",
  Days = "Days",
  Months = "Months",
}
export const CustomisePrelaunchSettingsPane: FC<
  CustomisePrelaunchSettingsPaneProps
> = ({
  vestingPeriod,
  presaleDuration,
  vestingSupply,
  creatorFees,
  presaleTarget,
  maxAmountPerPurchase,
  collectionsRequired,
  setCollectionsRequired,
  setMaxAmountPerPurchase,
  setPresaleTarget,
  setPresaleDuration,
  setCreatorFees,
  setVestingPeriod,
  setVestingSupply,
}) => {
  const [maximumAllowedPerPurchase, setMaximumAmountPerPurchase] = useState(
    maxAmountPerPurchase !== ""
  );
  const [requiresCollection, setRequiresCollection] = useState(
    collectionsRequired.length !== 0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 items-center gap-4">
        <label
          htmlFor="creator-fees"
          className="text-sm font-medium text-gray-400"
        >
          Creator Fees
        </label>
        <input
          type="text"
          inputMode="numeric"
          id="creator-fees"
          className="w-24 text-center text-sm block p-1 rounded border border-gray-300 text-black"
          placeholder={creatorFees.toString()}
          value={creatorFees.replaceAll("%", "") + "%"}
          onChange={(e) => {
            const amount = e.target.value.replaceAll("%", "");
            if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
              setCreatorFees(e.target.value);
            }
          }}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <label
          htmlFor="vesting-supply"
          className="text-sm font-medium text-gray-400"
        >
          Vesting Supply
        </label>
        <input
          type="text"
          inputMode="numeric"
          id="vesting-supply"
          className="w-24 text-center text-sm block p-1 rounded border border-gray-300 text-black"
          placeholder={vestingSupply.toString()}
          value={vestingSupply.replaceAll("%", "") + "%"}
          onChange={(e) => {
            const amount = e.target.value.replaceAll("%", "");
            if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
              setVestingSupply(e.target.value);
            }
          }}
          required
        />
      </div>
      <DurationPicker
        title={"Vesting Period"}
        period={vestingPeriod}
        setPeriod={setVestingPeriod}
      />

      <div className="grid grid-cols-2 gap-4 items-center">
        <label
          htmlFor="presale-target"
          className="text-sm font-medium text-gray-400"
        >
          Presale Target
        </label>
        <div className="flex">
          <input
            type="number"
            id="presale-target"
            className="rounded-none rounded-s-lg w-12 text-center leading-none text-sm p-2 border border-gray-300 text-black"
            value={presaleTarget}
            onChange={(e) => setPresaleTarget(e.target.value)}
            required
          />
          <label
            htmlFor="maximum-allowed"
            className="border-s-0 inline-flex items-center justify-evenly p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
          >
            Sol
          </label>
        </div>
      </div>
      <DurationPicker
        title={"Presale Duration"}
        period={presaleDuration}
        setPeriod={setPresaleDuration}
      />
      <div className="grid grid-cols-2 items-center gap-4">
        <span className="text-sm font-medium text-gray-400">
          Set Max Allowed Per Purchase (Optional)
        </span>
        <div className="flex items-center gap-4">
          {maximumAllowedPerPurchase && (
            <div className="flex">
              <input
                type="number"
                id="maximum-allowed"
                className="rounded-none rounded-s-lg w-12 text-center leading-none text-sm p-2 border border-gray-300 text-black"
                value={maxAmountPerPurchase}
                onChange={(e) => setMaxAmountPerPurchase(e.target.value)}
                required
              />
              <label
                htmlFor="maximum-allowed"
                className="border-s-0 inline-flex items-center justify-evenly p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
              >
                Sol
              </label>
            </div>
          )}
          <label className="w-fit items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={maximumAllowedPerPurchase}
              onChange={(e) => {
                setMaximumAmountPerPurchase(!maximumAllowedPerPurchase);
                if (!e.target.checked) {
                  setMaxAmountPerPurchase("");
                }
              }}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 items-center gap-4">
        <span className="text-sm font-medium text-gray-400">
          Whitelist Collections (Optional)
        </span>

        <label className="w-fit items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={requiresCollection}
            onChange={() => setRequiresCollection(!requiresCollection)}
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
        {requiresCollection && (
          <div className="col-span-2 flex flex-col gap-4">
            <SearchBar
              handleSelectedItem={(item) =>
                setCollectionsRequired((prev) => {
                  if (
                    !prev.find(
                      (prevItem) => prevItem.mintAddress === item.mintAddress
                    )
                  ) {
                    return [...prev, item];
                  } else {
                    return [...prev];
                  }
                })
              }
            />
            {collectionsRequired && (
              <div className="flex flex-wrap items-center gap-2">
                {collectionsRequired.map((item) => (
                  <Chip key={item.mintAddress} k={item.name} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
