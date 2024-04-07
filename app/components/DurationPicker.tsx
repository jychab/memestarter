import React, { FC, useEffect, useRef, useState } from "react";
import { Period } from "../sections/CustomisePrelaunchSettingsPane";

interface DurationPickerProps {
  title: string;
  period: number;
  setPeriod: React.Dispatch<React.SetStateAction<number>>;
}
export const DurationPicker: FC<DurationPickerProps> = ({
  title,
  period,
  setPeriod,
}) => {
  const showDurationDialogRef = useRef<HTMLDivElement>(null);
  const [showDuration, setShowDuration] = useState(false);
  const [value, setValue] = useState<number>(period / (24 * 60 * 60));
  const [periodEnum, setPeriodEnum] = useState<Period>(Period.Days);
  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDurationDialogRef.current &&
        !showDurationDialogRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setShowDuration(false);
      }
    };

    // Attach event listener when the dialog is open
    if (showDuration) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDuration]);
  useEffect(() => {
    if (periodEnum && value && setPeriod) {
      if (periodEnum === Period.Days) {
        setPeriod(value * 24 * 60 * 60);
      } else if (periodEnum === Period.Hours) {
        setPeriod(value * (60 * 60));
      } else {
        setPeriod(value * (30 * 24 * 60 * 60));
      }
    }
  }, [periodEnum, value, setPeriod]);
  return (
    <div className="grid grid-cols-2 items-center">
      <label htmlFor="time" className="text-sm font-medium text-white">
        {title}
      </label>
      <div className="flex">
        <input
          type="text"
          inputMode="numeric"
          id="time"
          className="rounded-none rounded-s-lg w-12 text-center leading-none text-sm p-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none"
          value={value}
          onChange={(e) => {
            if (e.target.value) {
              setValue(parseInt(e.target.value));
            }
          }}
          required
        />
        <div className="relative">
          <button
            id="dropdown-duration-button"
            onClick={() => setShowDuration(!showDuration)}
            className="relative border-s-0 flex-shrink-0 z-10 w-24 inline-flex items-center py-2 px-2 pr-4 justify-between text-sm font-medium text-center border rounded-e-lg focus:outline-none  bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            type="button"
          >
            {periodEnum}
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
            id="dropdown-duration"
            hidden={!showDuration}
            ref={showDurationDialogRef}
            className="z-20 mt-2 absolute divide-y divide-gray-100 rounded-lg shadow w-36 bg-gray-700"
          >
            <ul className="py-2 text-sm text-gray-200">
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                  onClick={() => setPeriodEnum(Period.Hours)}
                >
                  Hours
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                  role="menuitem"
                  onClick={() => setPeriodEnum(Period.Days)}
                >
                  Days
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                  role="menuitem"
                  onClick={() => setPeriodEnum(Period.Months)}
                >
                  Months
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
