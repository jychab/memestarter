import React, { FC, useEffect, useRef, useState } from "react";
import { DurationPicker } from "../components/DurationPicker";

interface CustomisePrelaunchSettingsPaneProps {
  presaleTarget: string;
  setPresaleTarget: React.Dispatch<React.SetStateAction<string>>;
  vestingPeriod: number;
  setVestingPeriod: React.Dispatch<React.SetStateAction<number>>;
  maxPresaleTime: number;
  setMaxPresaleTime: React.Dispatch<React.SetStateAction<number>>;
  vestingSupply: string;
  setVestingSupply: React.Dispatch<React.SetStateAction<string>>;
  creatorFees: string;
  setCreatorFees: React.Dispatch<React.SetStateAction<string>>;
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
  maxPresaleTime,
  vestingSupply,
  creatorFees,
  presaleTarget,
  setPresaleTarget,
  setMaxPresaleTime,
  setCreatorFees,
  setVestingPeriod,
  setVestingSupply,
}) => {
  return (
    <div className="animate-fade-right flex flex-col gap-4 p-4">
      <DurationPicker
        title={"Max Presale Duration"}
        period={maxPresaleTime}
        setPeriod={setMaxPresaleTime}
      />
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
        <input
          type="text"
          inputMode="numeric"
          id="presale-target"
          className="w-24 text-center text-sm block p-1 rounded border border-gray-300 text-black"
          placeholder={presaleTarget.toString()}
          value={presaleTarget.replaceAll(" Sol", "") + " Sol"}
          onChange={(e) => {
            const amount = e.target.value.replaceAll(" Sol", "");
            if (!amount || amount.match(/^\d{1,}(\.\d{0,4})?$/)) {
              setPresaleTarget(e.target.value);
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
    </div>
  );
};
