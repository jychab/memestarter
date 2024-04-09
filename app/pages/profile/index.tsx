import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InventoryItem } from "../../components/InventoryItem";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "react-toastify";
import {
  DasApiAsset,
  DasApiAssetList,
} from "@metaplex-foundation/digital-asset-standard-api";
import useUmi from "../../hooks/useUmi";
import {
  getMetadata,
  getSignature,
  sendTransactions,
} from "../../utils/helper";
import solanaLogo from "../../public/solanaLogoMark.png";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as PubKey } from "@metaplex-foundation/umi";
import { useRouter } from "next/router";

function InventoryScreen() {
  const {
    user,
    nft,
    setSessionKey,
    sessionKey,
    setSignedMessage,
    signedMessage,
  } = useLogin();
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [walletAssets, setWalletAssets] = useState<DasApiAsset[]>(
    Array(20).fill(undefined)
  );
  const [selectedItem, setSelectedItem] = useState<DasApiAsset>();
  const umi = useUmi();

  async function loadAssets(
    walletData: DasApiAssetList,
    connection: Connection
  ) {
    setWalletAssets(Array(20).fill(undefined));
    let index = 0;
    for (const item of walletData.items) {
      try {
        const [accountInfo, metadata] = await Promise.all([
          connection.getAccountInfo(new PublicKey(item.id.toString())),
          getMetadata(item.content.json_uri),
        ]);

        if (
          accountInfo &&
          accountInfo.owner.toBase58() === TOKEN_PROGRAM_ID.toBase58() &&
          metadata.image !== null &&
          index >= (page - 1) * 20 &&
          index < page * 20
        ) {
          const temp = [...walletAssets];
          temp[index] = item;
          setWalletAssets(temp);
          index++;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  useEffect(() => {
    if (publicKey && nft) {
      router.push(`/mint/${nft.id}`);
    }
  }, [publicKey, nft]);

  useEffect(() => {
    if (publicKey && page && !nft) {
      umi.rpc
        .searchAssets({
          owner: umi.identity.publicKey,
          compressed: false,
          sortBy: {
            sortBy: "recent_action",
            sortDirection: "desc",
          },
          creatorVerified: true,
          limit: page * 20,
        })
        .then((walletData) => {
          loadAssets(walletData, connection);
        });
    }
  }, [publicKey, page, nft]);

  const handleMintNft = async () => {
    try {
      if (publicKey && user && signMessage && signTransaction) {
        let sig = await getSignature(
          user,
          signedMessage,
          sessionKey,
          signMessage,
          setSignedMessage,
          setSessionKey
        );
        const payload = {
          signature: sig,
          pubKey: publicKey.toBase58(),
        };
        const mintNft = httpsCallable(getFunctions(), "mintNft");
        const { tx, mint } = (await mintNft(payload)).data as {
          tx: string;
          mint: string;
        };
        const transactionBuffer = base64.decode(tx as string);
        const transaction = toWeb3JsTransaction(
          umi.transactions.deserialize(transactionBuffer)
        );
        toast.info("Minting...");
        await sendTransactions(connection, [transaction], signTransaction);
        toast.info("Linking...");
        const asset = await umi.rpc.getAsset(PubKey(mint));
        const linkAsset = httpsCallable(getFunctions(), "linkAsset");
        await linkAsset({ ...payload, nft: asset });
        toast.success("Success");
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {!publicKey ? (
        <span className="text-black">You need to sign in first.</span>
      ) : selectedItem ? (
        <InventoryItem item={selectedItem} setSelectedItem={setSelectedItem} />
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
              <span>Mint for 0.5</span>
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
      {!nft && publicKey && (
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
            {walletAssets && walletAssets.length > 20 && (
              <div className="flex items-end justify-end">
                <div className="flex items-center">
                  <div className="flex items-center justify-end gap-2 ">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="flex items-center justify-center px-2 py-1 text-xs font-medium border  rounded-lg text-black border-gray-400 hover:text-blue-600"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      className="flex items-center justify-center px-2 py-1 text-xs font-medium border rounded-lg text-black border-gray-400 hover:text-blue-600"
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
