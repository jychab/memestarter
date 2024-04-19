import { FC, useEffect, useRef, useState } from "react";
import { CollectionDetails } from "../utils/types";
import Image from "next/image";

interface ComboBoxProps {
  setValue: (value: CollectionDetails) => void;
  list: CollectionDetails[];
}

export const ComboBox: FC<ComboBoxProps> = ({ setValue, list }) => {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
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
    const handleClickOutsideSort = (event: MouseEvent) =>
      handleClickOutside(event, dropDownRef, setShow);
    if (show) {
      document.addEventListener("mousedown", handleClickOutsideSort);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    };
  }, [show]);
  return (
    <div className="flex items-center justify-start">
      <div className="relative w-full">
        <button
          id="dropdown-type-button"
          onClick={() => setShow(!show)}
          className="relative flex-shrink-0 z-10 w-full inline-flex items-center p-2 justify-between font-medium text-center border rounded focus:outline-none text-gray-500 text-xs border-gray-300"
          type="button"
        >
          Select Collections
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
          hidden={!show}
          ref={dropDownRef}
          className="z-20 mt-2 absolute rounded w-full"
        >
          <ul className="p-2 text-sm text-black z-30 bg-white border-gray-300 border rounded">
            {list.map((value, index) => (
              <li
                className="cursor-pointer"
                key={index}
                onClick={() => {
                  setValue(value);
                  setShow(false);
                }}
              >
                <div className="flex items-center p-1 gap-2 rounded hover:text-blue-600">
                  <Image
                    height="0"
                    width="0"
                    sizes="100vw"
                    className="rounded-full w-6 h-auto"
                    src={value.image}
                    alt={""}
                  />
                  <div className="flex flex-col truncate text-[10px] sm:text-xs flex-1 min-w-0">
                    <span>{value.name.toUpperCase()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
