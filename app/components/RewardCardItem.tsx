import { Add, Remove } from "@mui/icons-material";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useData } from "../hooks/useData";
import { useLogin } from "../hooks/useLogin";
import solanaLogo from "../public/solanaLogoMark.png";
import { purchaseReward } from "../utils/cloudFunctions";
import { getCustomErrorMessage } from "../utils/error";
import { formatLargeNumber, getCollectionMintAddress } from "../utils/helper";
import { buyPresaleIx } from "../utils/instructions";
import { buildAndSendTransaction } from "../utils/transactions";
import { PoolType, Reward, Status } from "../utils/types";
import { EditableDocument } from "./EditableDocument";

interface RewardCardItemProps {
  pool: PoolType;
  status: Status;
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
  status,
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
  const [quantity, setQuantity] = useState<number | undefined>();
  const [amountInSol, setAmountInSol] = useState<number>();
  const [amountInLamports, setAmountInLamports] = useState<number>();
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [estimatedTokensReceivable, setEstimatedTokensReceivable] =
    useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { publicKey, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const { handleLogin } = useLogin();
  const { nft } = useData();
  const router = useRouter();

  useEffect(() => {
    if (amountInLamports && pool) {
      let maxAmount =
        (pool.initialSupply * (10000 - pool.creatorFeeBasisPoints)) /
        (10000 * 10 ** pool.decimal);
      setEstimatedTokensReceivable(
        Math.min((amountInLamports * maxAmount) / pool.presaleTarget, maxAmount)
      );
    } else {
      setEstimatedTokensReceivable(0);
    }
  }, [amountInLamports, pool]);

  useEffect(() => {
    if (amountInSol && pool) {
      setEstimatedCost(Math.round(amountInSol * 1.01 * 1000) / 1000);
    } else {
      setEstimatedCost(0);
    }
  }, [amountInSol, pool]);

  useEffect(() => {
    let amountPurchasedInSol;
    let amountPurchasedInLamports;
    try {
      if (reward && reward.price) {
        if (quantity && quantity > 0) {
          amountPurchasedInLamports = quantity * reward.price;
          amountPurchasedInSol = amountPurchasedInLamports / LAMPORTS_PER_SOL;
        }
      } else {
        amountPurchasedInSol = parseFloat(amount);
        amountPurchasedInLamports = amountPurchasedInSol * LAMPORTS_PER_SOL;
      }
    } catch (e) {
      amountPurchasedInSol = undefined;
      amountPurchasedInLamports = undefined;
    }
    setAmountInSol(amountPurchasedInSol);
    setAmountInLamports(amountPurchasedInLamports);
  }, [amount, quantity, reward]);

  const buy = useCallback(async () => {
    if (
      !(
        publicKey &&
        connection &&
        pool &&
        reward &&
        nft &&
        amountInSol &&
        amountInLamports &&
        signTransaction &&
        signMessage
      )
    )
      return;
    try {
      setLoading(true);
      const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
      if (
        !amountOfSolInWallet ||
        amountOfSolInWallet.lamports < amountInLamports * 1.01
      ) {
        throw new Error(
          `Insufficient Sol. You need at least ${
            Math.round(amountInSol * 1.01 * 1000) / 1000
          } Sol.`
        );
      }
      if (maxAllowed && (current || 0) + amountInLamports > maxAllowed) {
        throw new Error(
          `Input amount will bring total to ${
            amountInSol + (current || 0) / LAMPORTS_PER_SOL
          } Sol which exceeds the maximum quota of ${
            maxAllowed / LAMPORTS_PER_SOL
          } Sol.`
        );
      }
      let nftCollection;
      if (pool.collectionsRequired) {
        const collectionMintAddress = getCollectionMintAddress(nft);
        if (!collectionMintAddress) {
          throw Error("NFT has no collection");
        }
        nftCollection = new PublicKey(collectionMintAddress);
      }
      await handleLogin(publicKey, signMessage);
      const ix = await buyPresaleIx(
        {
          quoteMint: new PublicKey(pool.quoteMint),
          amount: amountInLamports,
          nft: new PublicKey(nft.id),
          nftCollection: nftCollection,
          poolId: new PublicKey(pool.pool),
          signer: publicKey,
        },
        connection
      );
      const txId = await buildAndSendTransaction(
        connection,
        ix,
        publicKey,
        signTransaction
      );
      await purchaseReward(
        nft.id,
        pool.pool,
        reward.id,
        txId,
        amountInLamports,
        quantity
      );
      toast.success("Success!");
      router.push("/");
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [
    pool,
    nft,
    current,
    quantity,
    router,
    amountInSol,
    amountInLamports,
    maxAllowed,
    reward,
    publicKey,
    connection,
    signTransaction,
    signMessage,
    handleLogin,
  ]);

  return (
    <div
      onClick={() => reward && setSelected(reward.id)}
      className={`flex flex-col gap-4 w-full border p-4 rounded ${
        !editingMode
          ? `${
              selected && reward && reward.id == selected
                ? "border-green-700"
                : "hover:cursor-pointer hover:border-black hover:shadow-xl hover:-translate-y-1 border-gray-300"
            }`
          : ""
      }`}
    >
      <EditableDocument
        status={status}
        titleStyle={"text-base"}
        pool={pool}
        reward={
          reward
            ? reward
            : {
                title: "",
                content: "",
                uniqueBackers: 0,
                quantityBought: 0,
                id: crypto.randomUUID(),
                price: LAMPORTS_PER_SOL,
              }
        }
        showEditButton={editingMode && reward && reward.price !== undefined}
        editableOnInit={editableOnInit}
        onCancelCallback={onCancelCallback}
      />
      {!editingMode && selected && reward && reward.id === selected && (
        <div className="flex flex-col gap-4 items-end">
          <div className="flex flex-col sm:flex-row w-full gap-4 sm:items-end justify-center ">
            {!reward.price ? (
              <div className="flex flex-col gap-1 w-auto flex-1">
                <div className="flex text-[10px] justify-between">
                  <span className="text-gray-400">{`Current: ${
                    (current || 0) / LAMPORTS_PER_SOL
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
                    className="rounded-none rounded-e-lg w-full leading-none text-sm p-2 border border-gray-300 hover:border-green-700 focus:outline-none focus:border-green-700"
                    value={amount}
                    placeholder="Enter an amount"
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 w-auto flex-1">
                <span className="text-sm text-gray-400 font-medium">
                  Quantity:
                </span>
                <div className="flex w-full">
                  <button
                    onClick={() => quantity && setQuantity(quantity - 1)}
                    className="border-l border-y border-gray-300 rounded-s-lg py-1 px-2 sm:px-4"
                  >
                    <Remove fontSize="inherit" />
                  </button>
                  <input
                    type="number"
                    id="quantity-input"
                    className="border border-gray-300 text-center leading-none text-sm p-2 w-full hover:border-green-700 focus:outline-none focus:border-green-700"
                    placeholder="Enter a quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                  />
                  <button
                    onClick={() => setQuantity((quantity || 0) + 1)}
                    className="border-r border-y border-gray-300 rounded-e-lg py-1 px-2 md:px-4"
                  >
                    <Add fontSize="inherit" />
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={buy}
              className={`text-white bg-green-700 flex items-center justify-center rounded w-full sm:w-64 text-sm sm:text-base gap-2 px-4 py-1`}
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
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-[10px] text-gray-400">{`Platform Fee:`}</span>
            <span className="text-[10px] text-gray-400 text-end">{`1%`}</span>
            <span className="text-[10px] text-gray-400">{`Estimated Cost:`}</span>
            <span className="text-[10px] text-gray-400 text-end">{`~${estimatedCost} Sol`}</span>
            <span className="text-[10px] text-gray-400">{`Tokens Receivable:`}</span>
            <span className="text-[10px] text-gray-400 text-end ">{`~${formatLargeNumber(
              estimatedTokensReceivable
            )} $${pool.symbol}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};
