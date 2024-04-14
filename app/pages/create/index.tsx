import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useLogin } from "../../hooks/useLogin";
import { CreateTokenPane } from "../../sections/CreateTokenPane";
import { CustomisePrelaunchSettingsPane } from "../../sections/CustomisePrelaunchSettingsPane";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  initializePoolIx,
  buildAndSendTransaction,
  createPurchaseAuthorisationIx,
} from "../../utils/helper";
import useUmi from "../../hooks/useUmi";
import { ReviewPane } from "../../sections/ReviewPane";
import { CollectionDetails } from "../../utils/types";
import { getCustomErrorMessage } from "../../utils/error";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function CreateCollection() {
  const { user } = useLogin();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const umi = useUmi();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);

  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(5);
  const [supply, setSupply] = useState<string>("1000000000");
  const [description, setDescription] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");

  const [picture, setPicture] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const [vestingPeriod, setVestingPeriod] = useState<number>(
    3 * 30 * 24 * 60 * 60
  );
  const [vestingSupply, setVestingSupply] = useState<string>("20"); //in percentage -> need to convert to number
  const [presaleDuration, setPresaleDuration] = useState<number>(
    3 * 24 * 60 * 60
  );
  const [presaleTarget, setPresaleTarget] = useState<string>("50"); //in sol -> need to convert to lamport
  const [maxAmountPerPurchase, setMaxAmountPerPurchase] = useState<string>("");
  const [collectionsRequired, setCollectionsRequired] = useState<
    CollectionDetails[]
  >([]);
  const [creatorFees, setCreatorFees] = useState<string>("5"); //in percentage -> need to convert to basis pts

  async function uploadMetadata(
    name: string,
    symbol: string,
    description: string,
    image: string,
    externalUrl: string
  ) {
    const payload = {
      name,
      symbol,
      description,
      image,
      externalUrl,
    };
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    const storage = getStorage();
    const uuid = crypto.randomUUID();
    const reference = ref(storage, uuid);
    // 'file' comes from the Blob or File API
    await uploadBytes(reference, blob);
    const uri = await getDownloadURL(reference);
    return uri;
  }

  async function uploadImage(picture: Blob) {
    const storage = getStorage();
    const uuid = crypto.randomUUID();
    const reference = ref(storage, uuid);
    // 'file' comes from the Blob or File API
    await uploadBytes(reference, picture);
    const imageUrl = await getDownloadURL(reference);
    return imageUrl;
  }
  const reset = () => {
    setLoading(false);
    setName("");
    setSymbol("");
    setDescription("");
    setPicture(null);
    setTempImageUrl(null);
    setExternalUrl("");
    setCreatorFees("5");
    setSupply("1000000000");
    setVestingSupply("20");
    setVestingPeriod(3 * 30 * 24 * 60 * 60);
    setPresaleDuration(30 * 24 * 60 * 60);
    setPresaleTarget("50");
    setMaxAmountPerPurchase("");
    setCollectionsRequired([]);
    setDecimals(5);
    setPage(1);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  const handleSymbolChange = (e: any) => {
    setSymbol(e.target.value);
  };

  const handleExternalUrlChange = (e: any) => {
    setExternalUrl(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handlePictureChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile !== undefined) {
      setPicture(selectedFile);
      setTempImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (page !== 3) {
      if (tempImageUrl === null) {
        toast.error("Missing picture");
        return;
      }
      setPage(page + 1);
    } else {
      if (!publicKey) {
        router.push("/profile");
        return;
      }
      if (user === null || !publicKey || picture === null || !signTransaction) {
        return;
      }

      const creatorFeesBasisPts =
        parseFloat(creatorFees.replaceAll("%", "")) * 100;
      const presaleTargetLamports =
        parseFloat(presaleTarget) * LAMPORTS_PER_SOL;
      const totalSupplyNum = parseInt(supply.replaceAll(",", ""));
      const vestingSupplyNum =
        (parseInt(vestingSupply.replaceAll(",", "")) / 100) * totalSupplyNum;

      if (creatorFeesBasisPts > 5000) {
        toast.error("Creator Fees cannot be higher than 50%");
        return;
      }
      if (presaleTargetLamports > 10000 * LAMPORTS_PER_SOL) {
        toast.error(
          "Presale Target is too high. You will not be able to launch your project unless the target is met."
        );
        return;
      }
      if (presaleTargetLamports < LAMPORTS_PER_SOL) {
        toast.error(
          "Presale Target is too low. It needs to be higher than 1 Sol."
        );
        return;
      }
      if (totalSupplyNum < 1000000) {
        toast.error("Total supply cannot be lower than 1,000,000");
        return;
      }
      if (vestingSupplyNum > totalSupplyNum) {
        toast.error("Vesting supply cannot be higher than Total supply");
        return;
      }
      if (presaleDuration > 30 * 24 * 60 * 60) {
        toast.error("Presale duration cannot be longer than a month");
        return;
      }
      try {
        setLoading(true);
        toast.info("Uploading Metadata... please wait");
        const imageUrl = await uploadImage(picture);
        const uri = await uploadMetadata(
          name,
          symbol,
          description,
          imageUrl,
          externalUrl
        );
        toast.info("Upload Completed.");
        const requiresCollection = collectionsRequired.length != 0;
        let ix = [];
        const { instruction, poolId } = await initializePoolIx(
          {
            name: name,
            symbol: symbol,
            decimal: decimals,
            uri: uri,
            creator_fees_basis_points: creatorFeesBasisPts,
            presaleDuration: presaleDuration,
            presaleTarget: presaleTargetLamports,
            vestingPeriod: vestingPeriod,
            vestedSupply: vestingSupplyNum,
            totalSupply: totalSupplyNum,
            signer: publicKey,
            maxAmountPerPurchase:
              maxAmountPerPurchase != ""
                ? parseFloat(maxAmountPerPurchase) * LAMPORTS_PER_SOL
                : null,
            requiresCollection: requiresCollection,
          },
          connection
        );
        ix.push(instruction);
        if (requiresCollection) {
          ix = ix.concat(
            await Promise.all(
              collectionsRequired.map((collection) =>
                createPurchaseAuthorisationIx(
                  {
                    collectionMint: new PublicKey(collection.mintAddress),
                    signer: publicKey,
                    poolId: poolId,
                  },
                  connection
                )
              )
            )
          );
        }
        await buildAndSendTransaction(
          connection,
          ix,
          publicKey,
          signTransaction
        );
        toast.success("Success!");
        router.push("/");
      } catch (error) {
        toast.error(`${getCustomErrorMessage(error)}`);
      } finally {
        reset();
      }
    }
  };
  return (
    <div className="mx-auto w-full lg:max-w-3xl">
      <div className="relative shadow-md sm:rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-black">
              {page === 1 && (
                <p>
                  Step 1 of 3:
                  <span className="text-base"> Design Your Own Token</span>
                </p>
              )}
              {page === 2 && (
                <p>
                  Step 2 of 3:
                  <span className="text-base">
                    {" "}
                    Customize Your Presale Launch
                  </span>
                </p>
              )}
              {page === 3 && (
                <p>
                  Step 3 of 3:
                  <span className="text-base"> Review</span>
                </p>
              )}
            </h2>
          </div>
          {page == 1 && (
            <CreateTokenPane
              tempImageUrl={tempImageUrl}
              handlePictureChange={handlePictureChange}
              name={name}
              handleNameChange={handleNameChange}
              symbol={symbol}
              handleSymbolChange={handleSymbolChange}
              externalUrl={externalUrl}
              handleExternalUrlChange={handleExternalUrlChange}
              description={description}
              handleDescriptionChange={handleDescriptionChange}
              decimals={decimals}
              setDecimals={setDecimals}
              supply={supply}
              setSupply={setSupply}
            />
          )}
          {page == 2 && (
            <CustomisePrelaunchSettingsPane
              collectionsRequired={collectionsRequired}
              setCollectionsRequired={setCollectionsRequired}
              maxAmountPerPurchase={maxAmountPerPurchase}
              setMaxAmountPerPurchase={setMaxAmountPerPurchase}
              presaleTarget={presaleTarget}
              setPresaleTarget={setPresaleTarget}
              presaleDuration={presaleDuration}
              setPresaleDuration={setPresaleDuration}
              vestingPeriod={vestingPeriod}
              setVestingPeriod={setVestingPeriod}
              vestingSupply={vestingSupply}
              setVestingSupply={setVestingSupply}
              creatorFees={creatorFees}
              setCreatorFees={setCreatorFees}
            />
          )}
          {page == 3 && (
            <ReviewPane
              collectionsRequired={collectionsRequired}
              maxAmountPerPurchase={
                maxAmountPerPurchase
                  ? parseFloat(maxAmountPerPurchase) * LAMPORTS_PER_SOL
                  : undefined
              }
              authority={publicKey?.toBase58()}
              image={tempImageUrl!}
              name={name}
              description={description}
              symbol={symbol}
              decimal={decimals}
              externalUrl={externalUrl}
              totalSupply={parseInt(supply.replaceAll(",", ""))}
              vestedSupply={
                (parseInt(vestingSupply.replaceAll("%", "")) *
                  parseInt(supply.replaceAll(",", ""))) /
                100
              }
              creatorFees={parseFloat(creatorFees.replaceAll("%", "")) * 100}
              vestingPeriod={vestingPeriod}
              presaleTime={presaleDuration}
              presaleTarget={parseFloat(presaleTarget) * LAMPORTS_PER_SOL}
            />
          )}
          <div className="flex gap-4 p-4 items-end justify-end">
            <button
              hidden={page === 1}
              type="button"
              onClick={() => setPage(page - 1)}
              className="text-gray-600 py-1 px-2 items-center justify-center rounded-md hover:text-blue-600 transition duration-300"
            >
              <span className="p-2">Back</span>
            </button>
            <button
              type="submit"
              className="border border-gray-300 text-black py-1 px-2 items-center justify-center rounded-md hover:text-blue-600 transition duration-300"
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
              <span className="p-2">{`${
                page == 3
                  ? publicKey
                    ? loading
                      ? "Creating..."
                      : "Create"
                    : "Need to Sign In!"
                  : "Next"
              }`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCollection;
