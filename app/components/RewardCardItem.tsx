import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import { FC, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useData } from "../hooks/useData";
import solanaLogo from "../public/solanaLogoMark.png";
import { getCustomErrorMessage } from "../utils/error";
import { buyPresale } from "../utils/functions";
import { PoolType, Reward } from "../utils/types";
import { EditableDocument } from "./EditableDocument";

interface RewardCardItemProps {
  pool: PoolType;
  reward?: Reward;
  current?: number;
  setSelected: (rewardId: string) => void;
  maxAllowed?: number;
  selected?: string;
  editingMode?: boolean;
  editableOnInit?: boolean;
  onCancelCallback?: () => void;
}

export const RewardCardItem: FC<RewardCardItemProps> = ({
  pool,
  setSelected,
  selected,
  current,
  maxAllowed,
  reward,
  editingMode = false,
  editableOnInit = false,
  onCancelCallback,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { nft } = useData();

  const buy = useCallback(async () => {
    if (!(publicKey && connection && pool && amount && nft && signTransaction))
      return;
    try {
      setLoading(true);
      await buyPresale(
        pool,
        nft,
        amount,
        publicKey,
        connection,
        signTransaction
      );
      toast.success("Success!");
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [pool, nft, amount, publicKey, connection, signTransaction]);

  return (
    <div
      onClick={() => reward && setSelected(reward.id)}
      className={`flex flex-col gap-4 w-full border p-4 rounded ${
        !editingMode
          ? `hover:cursor-pointer hover:border-black hover:shadow-xl hover:-translate-y-1 ${
              selected && reward && reward.id == selected
                ? "border-green-700"
                : "border-gray-300"
            }`
          : ""
      }`}
    >
      <EditableDocument
        titleStyle={"text-base"}
        pool={pool}
        reward={
          reward
            ? reward
            : {
                title: "",
                content: "",
                id: crypto.randomUUID(),
                price: LAMPORTS_PER_SOL,
              }
        }
        showEditButton={editingMode && reward && reward.price !== undefined}
        editableOnInit={editableOnInit}
        onCancelCallback={onCancelCallback}
      />
      {!editingMode && selected && reward && reward.id === selected && (
        <div className="flex flex-col gap-1 items-end w-full">
          <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8 items-end">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex text-[10px] justify-between">
                <span className="text-gray-400">{`Pledged Amount: ${
                  current || 0 / LAMPORTS_PER_SOL
                } Sol`}</span>
                {maxAllowed && (
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        `${(maxAllowed - (current || 0)) / LAMPORTS_PER_SOL}`
                      )
                    }
                    className="flex justify-between text-black hover:text-blue-600 cursor-pointer"
                  >
                    <span>{`Max Allowed: ${
                      maxAllowed / LAMPORTS_PER_SOL
                    } Sol`}</span>
                  </button>
                )}
              </div>
              <div className="flex w-full">
                <label
                  htmlFor="currency"
                  id="currencyLabel"
                  className="border-e-0 flex-shrink-0 inline-flex items-center justify-evenly gap-2 p-2 text-sm font-medium text-center border rounded-s-lg focus:outline-none border-gray-300"
                >
                  <Image
                    width={16}
                    height={16}
                    src={solanaLogo}
                    alt={"solana logo"}
                  />
                </label>
                <input
                  type="number"
                  id="currency"
                  className="rounded-none rounded-e-lg w-full leading-none text-sm p-2 border border-gray-300 text-black hover:border-green-700 focus:outline-none focus:border-green-700"
                  value={amount}
                  placeholder="Enter an amount"
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              onClick={buy}
              className={`text-white bg-green-700 flex items-center justify-center rounded w-full md:w-2/6 text-sm sm:text-base gap-1 px-4 py-1`}
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
              Continue
            </button>
          </div>
          <span className="text-[10px] text-gray-400">{`Platform Fee: 1%`}</span>
        </div>
      )}
    </div>
  );
};
