import { FC } from "react";
import Image from "next/image";
import solanaLogo from "../../public/solanaLogoMark.png";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface MainBtnProps {
  handleClick?: (e: any) => Promise<void>;
  color: string;
  loading?: boolean;
  disabled?: boolean;
  text: string;
  amountToPurchase?: string;
  setAmountToPurchase?: (e: string) => void;
  maxAllowedPerPurchase?: number;
  amount?: number;
  creatorFeeBasisPoints?: string;
}

export const MainBtn: FC<MainBtnProps> = ({
  handleClick,
  color,
  loading = false,
  disabled = true,
  text,
  amountToPurchase,
  setAmountToPurchase,
  maxAllowedPerPurchase,
  amount = 0,
  creatorFeeBasisPoints,
}) => {
  return (
    <div className="flex gap-4 items-center justify-center">
      {(maxAllowedPerPurchase || amount || creatorFeeBasisPoints) && (
        <div className="flex flex-col w-24 text-[10px]">
          {maxAllowedPerPurchase && (
            <div
              onClick={() =>
                setAmountToPurchase &&
                setAmountToPurchase(
                  `${(maxAllowedPerPurchase - amount) / LAMPORTS_PER_SOL}`
                )
              }
              className="flex justify-between text-black hover:text-blue-600 cursor-pointer"
            >
              <span>{`Max Allowed:`}</span>
              <span>{`${maxAllowedPerPurchase / LAMPORTS_PER_SOL} Sol`}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>{`Current:`}</span>
            <span>{`${amount / LAMPORTS_PER_SOL} Sol`}</span>
          </div>
          {creatorFeeBasisPoints && (
            <div className="flex justify-between text-gray-400">
              <span>{`Creator Fees:`}</span>
              <span>{parseInt(creatorFeeBasisPoints) / 100 + "%"}</span>
            </div>
          )}
        </div>
      )}
      {setAmountToPurchase && (
        <div className="flex">
          <input
            type="number"
            id="time"
            className="rounded-none rounded-s-lg w-16 text-center leading-none text-sm p-2 border border-gray-300 text-black"
            value={amountToPurchase}
            onChange={(e) => setAmountToPurchase(e.target.value)}
            required
          />
          <label
            id="dropdown-duration-button"
            className="border-s-0 flex-shrink-0 inline-flex items-center justify-evenly p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
          >
            <Image
              width={16}
              height={16}
              src={solanaLogo}
              alt={"solana logo"}
            />
          </label>
        </div>
      )}
      <button
        onClick={handleClick ? handleClick : () => {}}
        className={`${color} flex items-center justify-center rounded max-w-64 md:max-w-96 text-sm sm:text-base gap-1 px-4 py-1`}
        disabled={disabled}
      >
        {loading && (
          <svg
            className="inline w-4 h-4 animate-spin text-gray-600 fill-gray-300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        )}
        {text}
      </button>
    </div>
  );
};
