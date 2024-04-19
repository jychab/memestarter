import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { DurationPicker } from "../components/DurationPicker";
import { SearchBar } from "../components/SearchBar";
import { CollectionDetails } from "../utils/types";
import { Chip } from "../components/Chip";
import { Tooltip } from "../components/Tooltip";
import { ComboBox } from "../components/ComboBox";
import { getDocs, query, collection } from "@firebase/firestore";
import { db } from "../utils/firebase";

interface CustomisePrelaunchSettingsPaneProps {
  presaleTarget: string;
  setPresaleTarget: React.Dispatch<React.SetStateAction<string>>;
  maxAmountPerPurchase: string;
  setMaxAmountPerPurchase: React.Dispatch<React.SetStateAction<string>>;
  vestingPeriod: number;
  setVestingPeriod: React.Dispatch<React.SetStateAction<number>>;
  presaleDuration: number;
  setPresaleDuration: React.Dispatch<React.SetStateAction<number>>;
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
}) => {
  const [maximumAllowedPerPurchase, setMaximumAmountPerPurchase] = useState(
    maxAmountPerPurchase !== ""
  );
  const [requiresCollection, setRequiresCollection] = useState(
    collectionsRequired.length !== 0
  );

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(
    maximumAllowedPerPurchase || requiresCollection
  );
  const [collections, setCollections] = useState<CollectionDetails[]>();
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
  }, [requiresCollection]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 items-center gap-4">
        <div className="flex gap-2 items-center">
          <label
            htmlFor="creator-fees"
            className="text-sm font-medium text-gray-400"
          >
            Creator Fees
          </label>
          <Tooltip
            content={
              "This percentage represents the share you receive from both the presale funds and the liquidity tokens."
            }
          />
        </div>

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
        <div className="flex items-center gap-2">
          <label
            htmlFor="presale-target"
            className="text-sm font-medium text-gray-400"
          >
            Presale Target
          </label>
          <Tooltip
            content={
              "This is the minimum amount of funds needed from the presale to launch."
            }
          />
        </div>
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
            htmlFor="presale-target"
            className="border-s-0 inline-flex w-14 items-center justify-center p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
          >
            Sol
          </label>
        </div>
      </div>
      <DurationPicker
        tooltip="The designated timeframe for the presale."
        title={"Presale Duration"}
        period={presaleDuration}
        setPeriod={setPresaleDuration}
      />
      <DurationPicker
        tooltip="The duration for the linear release of the liquidity tokens over time."
        title={"Vesting Duration"}
        period={vestingPeriod}
        setPeriod={setVestingPeriod}
      />
      <div className="flex flex-col items-start gap-4">
        <button
          type="button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="bg-gray-400 border border-gray-300  px-2 py-1 text-sm rounded"
        >
          {showAdvancedSettings
            ? "Hide Advanced Settings"
            : "Show Advanced Settings"}
        </button>
        {showAdvancedSettings && (
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
                  id="maximum-allowed-checkbox"
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
        )}
        {showAdvancedSettings && (
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="text-sm font-medium text-gray-400">
              Whitelist Collections (Optional)
            </span>
            <label className="w-fit items-center cursor-pointer">
              <input
                id="whitelist-collections-checkbox"
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={requiresCollection}
                onChange={() => setRequiresCollection(!requiresCollection)}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
            {requiresCollection && collections && (
              <div className="col-span-2 flex flex-col gap-4">
                {collectionsRequired && (
                  <div className="flex flex-wrap items-center gap-2">
                    {collectionsRequired.map((item) => (
                      <Chip
                        key={item.mintAddress}
                        k={item.name}
                        dismiss={() =>
                          setCollectionsRequired((prev) =>
                            prev.filter(
                              (prevItem) =>
                                prevItem.mintAddress !== item.mintAddress
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                <ComboBox
                  setValue={(item) =>
                    setCollectionsRequired((prev) => {
                      if (
                        !prev.find(
                          (prevItem) =>
                            prevItem.mintAddress === item.mintAddress
                        )
                      ) {
                        return [...prev, item];
                      } else {
                        return [...prev];
                      }
                    })
                  }
                  list={collections}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
