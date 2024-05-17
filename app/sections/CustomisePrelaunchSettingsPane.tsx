import { collection, getDocs, query } from "@firebase/firestore";
import React, { FC, useEffect, useState } from "react";
import { Chip } from "../components/Chip";
import { ComboBox } from "../components/ComboBox";
import { DurationPicker } from "../components/DurationPicker";
import { Tooltip } from "../components/Tooltip";
import { db } from "../utils/firebase";
import { separateNumberWithComma } from "../utils/helper";
import { CollectionDetails } from "../utils/types";

interface CustomisePrelaunchSettingsPaneProps {
  liquidityPoolSupplyInPercentage: string;
  setLiquidityPoolSupplyInPercentage: React.Dispatch<
    React.SetStateAction<string>
  >;
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
  decimals: number;
  setDecimals: React.Dispatch<React.SetStateAction<number>>;
  supply: string;
  setSupply: React.Dispatch<React.SetStateAction<string>>;
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
  liquidityPoolSupplyInPercentage,
  setLiquidityPoolSupplyInPercentage,
  setCollectionsRequired,
  setMaxAmountPerPurchase,
  setPresaleTarget,
  setPresaleDuration,
  setCreatorFees,
  setVestingPeriod,
  decimals,
  setDecimals,
  supply,
  setSupply,
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
            Creator's Share
          </label>
          <Tooltip
            content={`This denotes the amount of token the creator will receive from the total supply.\n\nFor example,\nCreator's share = 5%\nTotal supply = 100M\nInitial Liquidity Pool Supply = 30%\nRemaining Supply Upon Launch = 70%\n\nCreator's Share:\nUpon Launch = 70% * 100M * 5% (Tokens)\nVesting = LP Tokens * 5%`}
          />
        </div>
        <input
          type="text"
          inputMode="numeric"
          id="creator-fees"
          className="w-16 text-center text-sm block p-1 rounded border border-gray-300 text-black"
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
              "If the total funds collected during the presale do not meet this target, the presale will be terminated. \n\nThe total funds collected cannot exceed this target."
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
        tooltip="The amount of time allocated for the presale."
        title={"Presale Duration"}
        period={presaleDuration}
        setPeriod={setPresaleDuration}
      />
      <DurationPicker
        tooltip="The duration for the release of the LP tokens over time."
        title={"Vesting Duration"}
        period={vestingPeriod}
        setPeriod={setVestingPeriod}
      />
      <div className="flex flex-col items-start gap-4">
        <button
          type="button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="bg-gray-400 border border-gray-300 px-2 py-1 text-sm text-gray-100 rounded"
        >
          {showAdvancedSettings
            ? "Hide Advanced Settings"
            : "Show Advanced Settings"}
        </button>
        {showAdvancedSettings && (
          <div className="grid grid-cols-2 w-full gap-4 items-center">
            <label
              htmlFor="decimal-input"
              className="block text-sm font-medium text-gray-400"
            >
              Decimals:
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="decimal-input"
              className="w-16 text-center text-sm block p-1 rounded border border-gray-300  text-black "
              placeholder={decimals.toString()}
              value={!Number.isNaN(decimals) ? decimals : 0}
              onChange={(e) => {
                if (e.target.value) {
                  setDecimals(parseInt(e.target.value));
                } else {
                  setDecimals(NaN);
                }
              }}
              required
            />

            <label
              htmlFor="supply-input"
              className="block text-sm font-medium text-gray-400"
            >
              Total Supply:
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="supply-input"
              className="text-center text-sm block p-1 w-32 rounded border border-gray-300 text-black "
              placeholder={supply.toString()}
              value={separateNumberWithComma(supply.replaceAll(",", ""))}
              onChange={(e) => {
                const amount = e.target.value.replaceAll(",", "");
                if (!amount || amount.match(/^\d+$/)) {
                  setSupply(e.target.value);
                }
              }}
              required
            />
            <div className="flex gap-2 items-center">
              <label
                htmlFor="lp-supply"
                className="text-sm font-medium text-gray-400"
              >
                Initial Liquidity Pool Supply
              </label>
              <Tooltip
                content={
                  "This percentage represents the amount of supply used to create the initial liquidity pool, the remaining supply will be released on launch."
                }
              />
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="lp-supply"
              className="w-24 text-center text-sm block p-1 rounded border border-gray-300 text-black"
              placeholder={liquidityPoolSupplyInPercentage.toString()}
              value={liquidityPoolSupplyInPercentage.replaceAll("%", "") + "%"}
              onChange={(e) => {
                const amount = e.target.value.replaceAll("%", "");
                if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
                  setLiquidityPoolSupplyInPercentage(e.target.value);
                }
              }}
              required
            />
            <label
              htmlFor="lp-supply"
              className="text-sm font-medium text-gray-400"
            >
              Max Allowed Per NFT (Optional)
            </label>
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
            <div className="flex gap-2 items-center">
              <label
                htmlFor="lp-supply"
                className="text-sm font-medium text-gray-400"
              >
                Whitelisted Collections (Optional)
              </label>
              <Tooltip
                content={
                  "Only holders of the specified NFT collection can participate in the presale."
                }
              />
            </div>
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
              <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                {collectionsRequired && (
                  <div className="flex flex-wrap items-center gap-2">
                    {collectionsRequired.map((item) => (
                      <Chip
                        textColor="text-white"
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
