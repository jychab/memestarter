import { FC, useState } from "react";

export const OnboardingScreen: FC = () => {
  const [hidden, setHidden] = useState(false);
  return (
    !hidden && (
      <div className="fixed z-50 w-full h-full flex bg-transparent items-center justify-center">
        <div className="absolute flex flex-col gap-4 border w-5/6 max-w-screen-sm border-gray-400 bg-white rounded p-4">
          <div className="flex items-center justify-between">
            <span className="text-base">How does it work?</span>
            <button onClick={() => setHidden(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20x"
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
            <span className="col-span-9">{`Connect your profile to an NFT.`}</span>
            <span className="col-span-1">2.</span>
            <span className="col-span-9">{`Choose a project and invest in their presale before it ends.`}</span>
            <span className="col-span-1">3.</span>
            <span className="col-span-9">{`When the presale finishes, you can collect the tokens you've invested in and trade them on any decentralized exchange (DEX).`}</span>
            <span className="col-span-1">4.</span>
            <span className="col-span-9">{`If the project doesn't reach its funding goal during the presale, you get your money back.`}</span>
            <span className="col-span-1">5.</span>
            <span className="col-span-9">{`Once the vesting period is over, you can retrieve the tokens you used to provide liquidity.`}</span>
          </div>
        </div>
      </div>
    )
  );
};
