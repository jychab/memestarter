import { useLocalStorage } from "@solana/wallet-adapter-react";
import { FC, useEffect, useState } from "react";

export const OnboardingScreen: FC = () => {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [hidden, setHidden] = useLocalStorage("onboarding", false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated ? (
    !hidden && (
      <div className="fixed z-50 w-full h-full flex bg-transparent items-start justify-center">
        <div className="absolute flex flex-col gap-4 border w-5/6 max-w-screen-sm border-gray-400 bg-white text-black rounded p-4">
          <div className="flex items-center justify-between">
            <span className="text-base">How does it work?</span>
            <button onClick={() => setHidden(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                viewBox="-0.5 0 25 25"
                fill="none"
              >
                <path
                  d="M3 21.32L21 3.32001"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3.32001L21 21.32"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-10 gap-4 text-sm text-black text-pretty">
            <span className="col-span-1">1.</span>
            <span className="col-span-9">{`Associate your profile with an NFT.`}</span>
            <span className="col-span-1">2.</span>
            <span className="col-span-9">{`Select a project and contribute to its presale before it ends.`}</span>
            <span className="col-span-1">3.</span>
            <span className="col-span-9">{`Once the presale concludes, the gathered funds will be utilized to create a liquidity pool on Raydium.`}</span>
            <span className="col-span-1">4.</span>
            <span className="col-span-9">{`Redeem your unvested liquidity tokens and trade them on Raydium.`}</span>
            <span className="col-span-1">5.</span>
            <span className="col-span-9">{`In the event that the project fails to achieve its funding goal, you will receive a refund of your contribution.`}</span>
          </div>
        </div>
      </div>
    )
  ) : (
    <span>{"Loading..."}</span>
  );
};
