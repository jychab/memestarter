import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MintDashboard } from "../../sections/MintDashboard";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "react-toastify";
import {
  DasApiAsset,
  DasApiAssetList,
  DasApiMetadata,
} from "@metaplex-foundation/digital-asset-standard-api";
import useUmi from "../../hooks/useUmi";
import { getCollectionMintAddress, sendTransactions } from "../../utils/helper";
import solanaLogo from "../../public/solanaLogoMark.png";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  fromWeb3JsPublicKey,
  toWeb3JsTransaction,
} from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as PubKey } from "@metaplex-foundation/umi";
import { useRouter } from "next/router";
import { getCustomErrorMessage } from "../../utils/error";
import { useData } from "../../hooks/useData";

interface CustomAsset extends DasApiAsset {
  image: string;
}

interface CustomDasApiAsset {
  token_info: {
    associated_token_address: string;
    decimals: number;
    supply: number;
    token_program: string;
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  content: {
    json_uri: string;
    files?: Array<{
      uri?: string;
      mime?: string;
      [key: string]: unknown;
    }>;
    metadata: DasApiMetadata;
    links?: {
      [key: string]: unknown;
    };
  };
}

function Profile() {
  const { user } = useLogin();
  const { nft } = useData();
  const { publicKey, signIn, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [page, setPage] = useState(1);
  const [endOfPage, setEndOfPage] = useState<number>();
  const [umiPage, setUmiPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [walletAssets, setWalletAssets] = useState<(CustomAsset | undefined)[]>(
    Array(20).fill(undefined)
  );
  const [selectedItem, setSelectedItem] = useState<CustomAsset>();
  const [collectionItem, setCollectionItem] = useState<DasApiAsset>();
  const umi = useUmi();

  const reset = () => {
    setUmiPage(1);
    setPage(1);
    setEndOfPage(undefined);
    setWalletAssets(Array(20).fill(undefined));
    setSelectedItem(undefined);
    setCollectionItem(undefined);
  };

  useEffect(() => {
    if (selectedItem) {
      umi.rpc
        .getAsset(PubKey(getCollectionMintAddress(selectedItem)!))
        .then((res) => setCollectionItem(res));
    }
  }, [selectedItem]);

  async function loadAssets(walletData: DasApiAssetList) {
    const promises = walletData.items.map(async (item) => {
      const customItem = item as unknown as CustomDasApiAsset;
      const tokenProgram = customItem.token_info.token_program;
      const supply = customItem.token_info.supply;
      const decimal = customItem.token_info.decimals;
      const image = customItem.content.links!.image as string;
      const collectionMint = getCollectionMintAddress(item);
      try {
        if (
          collectionMint &&
          tokenProgram == TOKEN_PROGRAM_ID.toBase58() &&
          supply == 1 &&
          decimal == 0 &&
          image
        ) {
          return {
            ...item,
            image: image,
          };
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    });

    const results = await Promise.all(promises);

    // Update walletAssets with non-null results
    const temp = [...walletAssets.filter((item) => item != undefined)];
    results.forEach((result, i) => {
      if (result !== null) {
        temp.push(result);
      }
    });
    if (temp.length % 20 !== 0) {
      const paddingLength = 20 - (temp.length % 20);
      for (let i = 0; i < paddingLength; i++) {
        temp.push(undefined);
      }
    }
    if (temp.length !== 0) {
      setWalletAssets(temp);
    }
  }

  useEffect(() => {
    if (publicKey && nft) {
      router.push(`/mint/${nft.id}`);
    }
  }, [publicKey, nft, router]);

  useEffect(() => {
    if (publicKey && user && umiPage && !nft) {
      if (publicKey.toBase58() !== user.uid) {
        reset();
      } else {
        umi.rpc
          .searchAssets({
            owner: fromWeb3JsPublicKey(publicKey),
            compressed: false,
            sortBy: {
              sortBy: "recent_action",
              sortDirection: "desc",
            },
            creatorVerified: true,
            page: umiPage,
          })
          .then((walletData: DasApiAssetList) => {
            setEndOfPage(walletData.total === 0 ? page : undefined);
            loadAssets(walletData);
          });
      }

      return () => {};
    }
  }, [publicKey, user, umiPage, nft]);

  const handleMintNft = async () => {
    try {
      if (publicKey && user && signIn && signAllTransactions && connection) {
        setLoading(true);
        const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
        if (
          !amountOfSolInWallet ||
          amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 0.5
        ) {
          toast.error("Insufficient Sol. You need at least 0.5 Sol.");
          return;
        }

        toast.info("Minting...");
        const mintNft = httpsCallable(getFunctions(), "mintNft");
        const { tx, mint } = (await mintNft()).data as {
          tx: string;
          mint: string;
        };
        const transactionBuffer = base64.decode(tx as string);
        const transaction = toWeb3JsTransaction(
          umi.transactions.deserialize(transactionBuffer)
        );
        await sendTransactions(connection, [transaction], signAllTransactions);
        toast.info("Linking...");
        const asset = await umi.rpc.getAsset(PubKey(mint));
        const linkAsset = httpsCallable(getFunctions(), "linkAsset");
        await linkAsset({ nft: asset });
        toast.success("Success");
      }
    } catch (error) {
      toast.error(`${getCustomErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {!publicKey ? (
        <span className="text-black">You need to sign in first.</span>
      ) : selectedItem ? (
        <MintDashboard
          item={selectedItem}
          setSelectedItem={setSelectedItem}
          collectionItem={collectionItem}
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
            {loading ? (
              <div className="flex items-center gap-1">
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
                <span>Minting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span>Mint for 0.5</span>
                <Image
                  width={16}
                  height={16}
                  src={solanaLogo}
                  alt={"solana logo"}
                />
              </div>
            )}
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
              {walletAssets
                .filter(
                  (_, index) => index >= (page - 1) * 20 && index < page * 20
                )
                .map((item, index) => (
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
                        src={item.image}
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
                      onClick={() => {
                        if (
                          !endOfPage &&
                          (walletAssets.length < (page + 1) * 20 ||
                            walletAssets
                              .slice(page * 20, (page + 1) * 20)
                              .filter((item) => !item).length <
                              walletAssets.length)
                        ) {
                          setUmiPage(umiPage + 1);
                        }
                        setPage(
                          endOfPage ? Math.min(page + 1, endOfPage) : page + 1
                        );
                      }}
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

export default Profile;
