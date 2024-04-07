import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { InventoryItem } from "../../components/InventoryItem";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "react-toastify";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import useUmi from "../../hooks/useUmi";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import { getSignature } from "../../utils/helper";
import solanaLogo from "../../public/solanaLogoMark.png";

interface Request {
  signature: string;
  pubKey: string;
  nft: DasApiAsset;
}

const imageStyle = {
  height: "auto",
};

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
    if (publicKey && page && showWallet) {
      umi.rpc
        .getAssetsByOwner({
          owner: umi.identity.publicKey,
          limit: page * 20,
        })
        .then((walletData) => {
          let temp: DasApiAsset[] = Array(20).fill(undefined);
          setTotal(walletData.total);
          walletData.items
            .filter((item) => !item.compression.compressed)
            .filter((_, index) => index >= (page - 1) * 20 && index < page * 20)
            .forEach((item, index) => {
              temp[index] = item;
            });
          setWalletAssets(temp);
        });
    }
  }, [publicKey, page, showWallet]);

  const handleMintNft = async () => {
    try {
      const randomNft = generateSigner(umi);
      await createNft(umi, {
        mint: randomNft,
        authority: umi.identity,
        name: "MEME",
        uri: "https://qgp7lco5ylyitscysc2c7clhpxipw6sexpc2eij7g5rq3pnkcx2q.arweave.net/gZ_1id3C8InIWJC0L4lnfdD7ekS7xaIhPzdjDb2qFfU",
        sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      }).sendAndConfirm(umi);
      const data = await umi.rpc.getAsset(randomNft.publicKey);
      await handleLinkage(data);
      setNft(data);
      toast.success("Success");
    } catch (error) {
      toast.error(`${error}`);
    }
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
      {!publicKey ? (
        <span className="text-black">You need to sign in first.</span>
      ) : selectedItem ? (
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
        <div className="flex flex-col items-center justify-center text-black text-center p-8 gap-4 h-full">
          <span>You need to link a digital asset to your profile.</span>
          <span className="text-sm">Select one from your wallet below</span>
          <span>or</span>
          <button
            onClick={handleMintNft}
            className=" rounded p-2 hover:text-blue-700 border border-gray-400 text-sm"
          >
            <div className="flex items-center gap-1">
              <span>Mint one for 0.1</span>
              <Image
                width={16}
                height={16}
                src={solanaLogo}
                alt={"solana logo"}
              />
            </div>
          </button>
        </div>
      )}
      {showWallet && publicKey && (
        <div className="animate-fade-up flex flex-col max-w-screen-md gap-4">
          <div className="flex items-center justify-between text-gray-400 uppercase text-xs sm:text-sm">
            <span>WALLET</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2 grid-cols-5 border border-gray-300 rounded-lg p-2">
              {walletAssets.map((item, index) => (
                <div
                  className="relative overflow-hidden w-14 h-14 lg:w-32 lg:h-32 items-center flex rounded bg-gray-100 border border-gray-300"
                  key={item ? item.id : index}
                  onClick={() => item && setSelectedItem(item)}
                >
                  {item && (
                    <Image
                      className={`rounded object-cover cursor-pointer`}
                      key={item.id}
                      fill={true}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      //@ts-ignore
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
        </div>
      )}
    </div>
  );
}

export default InventoryScreen;
