import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useData } from "../../hooks/useData";
import useUmi from "../../hooks/useUmi";
import { MintDashboard } from "../../sections/MintDashboard";
import { getCollectionMintAddress } from "../../utils/helper";
import { DAS } from "../../utils/types";

function Profile() {
  const { nft } = useData();
  const { publicKey } = useWallet();
  const [page, setPage] = useState(1);

  const [currentLength, setCurrentLength] = useState<number>();
  const [endOfPage, setEndofPage] = useState<number>();
  const [limit, setLimit] = useState(50);
  const router = useRouter();
  const [walletAssets, setWalletAssets] = useState<
    (DAS.GetAssetResponse | undefined)[]
  >(Array(20).fill(undefined));
  const [selectedItem, setSelectedItem] = useState<DAS.GetAssetResponse>();
  const [collectionItem, setCollectionItem] = useState<DAS.GetAssetResponse>();
  const [currentUser, setCurrentUser] = useState<PublicKey>();
  const { getAsset, searchAssets } = useUmi();

  const { data: collectionItemData } = getAsset(
    selectedItem ? getCollectionMintAddress(selectedItem) : null
  );

  useEffect(() => {
    if (collectionItemData) {
      setCollectionItem(collectionItemData as unknown as DAS.GetAssetResponse);
    }
  }, [collectionItemData]);

  async function loadAssets(walletData: DAS.GetAssetResponseList) {
    const promises = walletData.items.map(async (item) => {
      const customItem = item;
      const tokenProgram = customItem.token_info.token_program;
      const supply = customItem.token_info.supply;
      const decimal = customItem.token_info.decimals;
      const image = customItem.content?.links!.image as string;
      const collectionMint = getCollectionMintAddress(item);
      try {
        if (
          collectionMint &&
          tokenProgram == TOKEN_PROGRAM_ID.toBase58() &&
          supply == 1 &&
          decimal == 0 &&
          image
        ) {
          return item;
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    });

    const results = await Promise.all(promises);

    // Update walletAssets with non-null results
    const temp = [];
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

  const { data: walletData } = searchAssets(
    publicKey && limit && !nft
      ? JSON.stringify({
          owner: fromWeb3JsPublicKey(publicKey),
          compressed: false,
          sortBy: {
            sortBy: "recent_action",
            sortDirection: "desc",
          },
          creatorVerified: true,
          limit: limit,
        })
      : null
  );

  useEffect(() => {
    if (walletData) {
      loadAssets(walletData as unknown as DAS.GetAssetResponseList);
    }
  }, [walletData]);

  useEffect(() => {
    if (publicKey) {
      if (!currentUser || currentUser.toBase58() !== publicKey.toBase58()) {
        setPage(1);
      }
      setCurrentUser(publicKey);
    }
  }, [publicKey, currentUser]);

  return (
    <div className="flex flex-col h-full w-full max-w-screen-xl gap-4 lg:items-center">
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
          <span>You need to set an avatar for your profile.</span>
          <span className="text-sm">
            Choose one from the NFTs available in your wallet below.
          </span>
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
                    {item &&
                      item.content &&
                      item.content.links &&
                      item.content.links.image && (
                        <Image
                          className={`rounded object-cover cursor-pointer`}
                          key={item.id}
                          fill={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          src={item.content.links.image}
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
                        let end = endOfPage;
                        if (!end && currentLength == walletAssets.length) {
                          end = page;
                          setEndofPage(page);
                        } else {
                          setCurrentLength(walletAssets.length);
                        }
                        if (!end) {
                          setLimit(limit + 50);
                        }
                        setPage(end ? Math.min(page + 1, end) : page + 1);
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
