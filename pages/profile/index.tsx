import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLocalStorage, useWallet } from "@solana/wallet-adapter-react";
import { DAS } from "../../utils/types";
import { InventoryItem } from "../../components/InventoryItem";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useLogin } from "../../hooks/useLogin";
import Link from "next/link";
import { query, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { toast } from "react-toastify";
import {
  DasApiAsset,
  DasApiAssetInterface,
} from "@metaplex-foundation/digital-asset-standard-api";
import useUmi from "../../hooks/useUmi";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { getSignature } from "../../utils/helper";

interface Request {
  signature: string;
  pubKey: string;
  nft: DasApiAsset;
}

function InventoryScreen() {
  const {
    user,
    nft,
    setNft,
    setSessionKey,
    sessionKey,
    setSignedMessage,
    signedMessage,
  } = useLogin();
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number>();
  const [showWallet, setShowWallet] = useState(false);
  const [walletAssets, setWalletAssets] = useState<DasApiAsset[]>(
    Array(20).fill(undefined)
  );
  const [selectedItem, setSelectedItem] = useState<DasApiAsset>();
  const umi = useUmi();

  function isItemCurrentlyEquipped(item: DasApiAsset | undefined) {
    return nft && item && item.id === nft.id;
  }

  useEffect(() => {
    if (publicKey && !nft) {
      setShowWallet(true);
    } else if (nft) {
      setShowWallet(false);
    }
  }, [publicKey, nft]);

  useEffect(() => {
    if (umi && publicKey && page && showWallet) {
      umi.rpc
        .getAssetsByOwner({
          owner: umi.identity.publicKey,
          limit: page * 20,
        })
        .then((walletData) => {
          let temp: DasApiAsset[] = Array(20).fill(undefined);
          setTotal(walletData.total);
          walletData.items
            .filter((item) => item.interface === "V1_NFT")
            .filter((_, index) => index >= (page - 1) * 20 && index < page * 20)
            .forEach((item, index) => {
              temp[index] = item;
            });
          setWalletAssets(temp);
        });
    }
  }, [publicKey, page, showWallet]);

  const handleMintNft = async () => {
    // Create the Collection NFT.
    const collectionMint = generateSigner(umi);
    await createNft(umi, {
      mint: collectionMint,
      authority: umi.identity,
      name: "Testing 123",
      uri: "https://qgp7lco5ylyitscysc2c7clhpxipw6sexpc2eij7g5rq3pnkcx2q.arweave.net/gZ_1id3C8InIWJC0L4lnfdD7ekS7xaIhPzdjDb2qFfU",
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
    }).sendAndConfirm(umi);
    const data = await umi.rpc.getAsset(collectionMint.publicKey);
    await handleLinkage(data);
    setNft(data);
  };

  const handleLinkage = async (selectedItem: DasApiAsset | undefined) => {
    if (publicKey && user && signMessage && selectedItem) {
      try {
        setLoading(true);
        let sig = await getSignature(
          user,
          signedMessage,
          sessionKey,
          signMessage,
          setSignedMessage,
          setSessionKey
        );
        const payload: Request = {
          signature: sig,
          pubKey: publicKey.toBase58(),
          nft: selectedItem,
        };
        if (isItemCurrentlyEquipped(selectedItem) || nft) {
          const unlinkAsset = httpsCallable(getFunctions(), "unlinkAsset");
          await unlinkAsset(payload);
        } else {
          const linkAsset = httpsCallable(getFunctions(), "linkAsset");
          await linkAsset(payload);
        }
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setLoading(false);
        setSelectedItem(undefined);
      }
    }
  };
  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {selectedItem ? (
        <InventoryItem
          loading={loading}
          actionText={isItemCurrentlyEquipped(selectedItem) ? "Unlink" : "Link"}
          item={selectedItem}
          setSelectedItem={setSelectedItem}
          handleSubmit={handleLinkage}
        />
      ) : nft ? (
        <InventoryItem
          loading={loading}
          actionText={"Unlink"}
          item={nft}
          handleSubmit={handleLinkage}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4 h-full">
          <span>You need to link a Digital Asset to your profile.</span>
          <span className="text-sm">Select one from your wallet below</span>
          <span>or</span>
          <button
            onClick={handleMintNft}
            className="bg-blue-600 rounded p-2 text-blue-100 text-sm"
          >
            Mint for 0.1 Sol
          </button>
        </div>
      )}
      {showWallet && (
        <div className="animate-fade-up flex flex-col max-w-screen-md gap-4">
          <div className="flex items-center justify-between text-gray-400 uppercase text-xs sm:text-sm">
            <span>WALLET</span>
          </div>
          {!publicKey ? (
            <div>
              {publicKey ? (
                <div className="flex items-center gap-2">
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
                  <span>Loading...</span>
                </div>
              ) : (
                <span>You need to sign in first.</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 grid-cols-5 sm:grid-cols-10 bg-gray-700 rounded-lg p-2">
                {walletAssets.map((item, index) => (
                  <div
                    className="w-14 h-14 items-center flex rounded bg-gray-600"
                    key={item ? item.id : index}
                    onClick={() => item && setSelectedItem(item)}
                  >
                    {item && (
                      <Image
                        className={`rounded cursor-pointer w-14 h-auto ${
                          isItemCurrentlyEquipped(item) &&
                          "border-2 border-blue-800"
                        }`}
                        key={item.id}
                        sizes="100vw"
                        width={0}
                        height={0}
                        src={item.content!.links!.image! as string}
                        alt={""}
                      />
                    )}
                  </div>
                ))}
              </div>
              {total && total > 20 && (
                <div className="overflow-hidden flex items-end justify-end">
                  <div className="flex items-center">
                    <span className="text-sm font-normal text-gray-400 px-2">
                      Showing
                      <span className="font-semibold text-white px-2">
                        {`${(page - 1) * 10 + 1} to ${walletAssets.length}`}
                      </span>
                      of
                      <span className="font-semibold text-white px-2">
                        {total}
                      </span>
                    </span>
                    <div className="flex items-center justify-end gap-2 ">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className="flex items-center justify-center px-2 py-1 text-xs font-medium border  rounded-lg bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPage(Math.min(page + 1, Math.ceil(total / 20)))
                        }
                        className="flex items-center justify-center px-2 py-1 text-xs font-medium border rounded-lg bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InventoryScreen;
