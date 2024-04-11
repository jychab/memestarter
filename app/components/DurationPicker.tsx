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
  const [value, setValue] = useState("");
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
    if (value && periodEnum) {
      if (periodEnum === Period.Days) {
        setPeriod(Number(value) * (24 * 60 * 60));
      } else if (periodEnum === Period.Hours) {
        setPeriod(Number(value) * (60 * 60));
      } else {
        setPeriod(Number(value) * (30 * 24 * 60 * 60));
      }
    }
  }, [value, periodEnum, setPeriod]);

  useEffect(() => {
    if (periodEnum && period) {
      if (periodEnum === Period.Days) {
        setValue((period / (24 * 60 * 60)).toString());
      } else if (periodEnum === Period.Hours) {
        setValue((period / (60 * 60)).toString());
      } else {
        setValue((period / (30 * 24 * 60 * 60)).toString());
      }
    }
  }, [periodEnum]);

  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <label htmlFor="time" className="text-sm font-medium text-gray-400">
        {title}
      </label>
      <div className="flex">
        <input
          type="number"
          id="time"
          className="rounded-none rounded-s-lg w-14 text-center leading-none text-sm p-2 border border-gray-300 text-black"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <div className="relative">
          <button
            id="dropdown-duration-button"
            onClick={() => setShowDuration(!showDuration)}
            className="relative border-s-0 flex-shrink-0 z-10 w-20 inline-flex items-center justify-evenly p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
            type="button"
          >
            {periodEnum}
            <svg
              className="w-2.5 h-2.5 ms-1"
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
            className="z-20 mt-2 absolute  rounded-lg shadow w-24"
          >
            <ul className="py-2 text-sm text-black bg-white border-gray-300 border">
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm "
                  onClick={() => setPeriodEnum(Period.Hours)}
                >
                  Hours
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm "
                  role="menuitem"
                  onClick={() => setPeriodEnum(Period.Days)}
                >
                  Days
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="inline-flex w-full px-4 py-2 text-sm "
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
