import Image from "next/image";
import React, { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../../hooks/useLogin";
import { getPrizeRoute } from "../../utils/routes";
import { toast } from "react-toastify";

interface Prize {
  name: string;
  symbol: string;
  description: string;
  image: string;
  receiverAddress: string;
}

export const ClaimDailyBonusBtn: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [prize, setPrize] = useState<Prize>();
  const { publicKey } = useWallet();
  const { user } = useLogin();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (publicKey && user) {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const result = await fetch(
          `${getPrizeRoute}?pubkey=${publicKey.toString()}`,
          {
            headers: {
              token: token,
            },
          }
        );
        if (result.status === 200) {
          setPrize(await result.json());
        } else {
          const data = await result.json();
          toast.error(`${data}`);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <button
          type="submit"
          className="text-gray-200 border-2 border-gray-500 focus:ring-4 font-medium rounded-lg text-xs sm:text-sm p-1 bg-gray-800 hover:bg-gray-700 focus:ring-gray-800"
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
          <span className="p-2">{loading ? "Claiming..." : "Daily Bonus"}</span>
        </button>
      </form>
      <dialog
        className="fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 w-full md:inset-0 h-full bg-gray-700/30"
        open={prize !== undefined}
      >
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPrize(undefined);
            }
          }}
          className="flex flex-col items-center justify-center gap-4 h-full"
        >
          {prize && (
            <>
              <span className="animate-fade animate-once animate-ease-linear text-gray-200 text-xl font-semibold uppercase">
                {`Congratualtions!`}
              </span>
              <span className="animate-fade animate-once animate-ease-linear text-gray-200 text-base font-semibold uppercase">
                {`You won...`}
              </span>
              <div className="animate-jump-in animate-once animate-ease-linear rounded-lg p-8 w-fit items-center justify-center gap-4 flex flex-col border-2 focus:outline-none focus:ring-gray-800 focus-ring-4 border-gray-200 bg-gray-500">
                <Image
                  src={prize.image}
                  height={0}
                  width={0}
                  sizes="100vw"
                  className="rounded border-2 w-48 h-auto border-gray-200"
                  alt={""}
                />
                <span className="text-gray-200 font-bold">{prize.name}</span>
                <span className="text-gray-200 max-w-64 truncate">
                  {prize.description}
                </span>
              </div>
              <span className="animate-fade animate-once animate-ease-linear text-gray-200 text-base font-semibold uppercase">
                {`Next claim in 12:12:12`}
              </span>
              <button
                onClick={() => setPrize(undefined)}
                className="animate-fade animate-once animate-delay-[1000ms] animate-ease-linear text-gray-200 uppercase border-2 border-gray-400 hover:bg-gray-700 px-2 py-1 rounded-xl focus:outline-none focus:ring-gray-800 focus:ring-4"
              >
                Close
              </button>
            </>
          )}
        </div>
      </dialog>
    </>
  );
};
