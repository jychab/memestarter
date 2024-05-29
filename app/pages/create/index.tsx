import { NATIVE_MINT } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { collection, limit, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CardItem from "../../components/CardItem";
import useFirestoreWtihSWR from "../../hooks/useFirestoreWithSWR";
import { useLogin } from "../../hooks/useLogin";
import { CreateTokenPane } from "../../sections/CreateTokenPane";
import { CustomisePrelaunchSettingsPane } from "../../sections/CustomisePrelaunchSettingsPane";
import { ReviewPane } from "../../sections/ReviewPane";
import { getCustomErrorMessage } from "../../utils/error";
import { db } from "../../utils/firebase";
import { createPool, uploadImage, uploadMetadata } from "../../utils/functions";
import { CollectionDetails, PoolType } from "../../utils/types";

function CreateCollection() {
  const { connection } = useConnection();
  const { handleLogin } = useLogin();
  const { publicKey, signTransaction, signMessage } = useWallet();

  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [poolId, setPoolId] = useState<string>();

  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(5);
  const [supply, setSupply] = useState<string>("1000000000");
  const [liquidityPoolSupplyInPercentage, setLiquidityPoolSupplyInPercentage] =
    useState<string>("10"); //in percentage
  const [description, setDescription] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");

  const [picture, setPicture] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const [vestingPeriod, setVestingPeriod] = useState<number>(
    3 * 30 * 24 * 60 * 60
  );
  const [presaleDuration, setPresaleDuration] = useState<number>(
    3 * 24 * 60 * 60
  );
  const [presaleTarget, setPresaleTarget] = useState<string>("50"); //in sol -> need to convert to lamport
  const [maxAmountPerPurchase, setMaxAmountPerPurchase] = useState<string>("");
  const [collectionsRequired, setCollectionsRequired] = useState<
    CollectionDetails[]
  >([]);
  const [creatorFees, setCreatorFees] = useState<string>("5"); //in percentage -> need to convert to basis pts

  const { useCollection } = useFirestoreWtihSWR();

  const createPoolQuery = useMemo(() => {
    if (!poolId) return null;
    const base = collection(db, "Pool");
    const queries = [];
    queries.push(where("valid", "==", true));
    queries.push(where("pool", "==", poolId));
    queries.push(limit(1));

    return query(base, ...queries);
  }, [poolId]);

  const { data } = useCollection<PoolType>(createPoolQuery);

  useEffect(() => {
    if (data) {
      toast.success("Success");
      setLoading(false);
      setPage(4);
    }
  }, [data]);

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
    switch (page) {
      case 1:
        if (tempImageUrl === null) {
          toast.error("Missing picture");
          return;
        }
        setPage(page + 1);
        break;
      case 2:
        setPage(page + 1);
        break;
      case 3:
        if (
          !publicKey ||
          !picture ||
          !signTransaction ||
          loading ||
          !signMessage
        ) {
          return;
        }
        const amountOfSol = (await connection.getAccountInfo(publicKey))
          ?.lamports;
        if (!amountOfSol || amountOfSol < 0.022 * LAMPORTS_PER_SOL) {
          toast.error("Insufficient sol, need at least 0.022 sol");
          return;
        }
        const creatorFeesBasisPts =
          parseFloat(creatorFees.replaceAll("%", "")) * 100;
        const presaleTargetLamports =
          parseFloat(presaleTarget) * LAMPORTS_PER_SOL;
        const totalSupply = parseInt(supply.replaceAll(",", ""));
        const liquidityPoolPercentage =
          parseFloat(liquidityPoolSupplyInPercentage.replaceAll("%", "")) / 100;
        const liquidityPoolSupply = totalSupply * liquidityPoolPercentage;
        const initialSupply = totalSupply - liquidityPoolSupply;
        try {
          setLoading(true);
          await handleLogin(publicKey, signMessage);
          const imageUrl = await uploadImage(picture);
          const uri = await uploadMetadata(
            name,
            symbol,
            description,
            imageUrl,
            externalUrl
          );
          const poolId = await createPool(
            {
              quoteMint: NATIVE_MINT,
              publicKey: publicKey,
              collectionsRequired: collectionsRequired,
              externalUrl: externalUrl,
              description: description,
              name: name,
              symbol: symbol,
              decimal: decimals,
              uri: uri,
              creatorFeesBasisPoints: creatorFeesBasisPts,
              presaleDuration: presaleDuration,
              presaleTarget: presaleTargetLamports,
              vestingPeriod: vestingPeriod,
              initialSupply: initialSupply,
              liquidityPoolSupply: liquidityPoolSupply,
              signer: publicKey,
              maxAmountPerPurchase:
                maxAmountPerPurchase != ""
                  ? parseFloat(maxAmountPerPurchase) * LAMPORTS_PER_SOL
                  : null,
              requiresCollection: collectionsRequired.length != 0,
            },
            connection,
            signTransaction
          );
          setPoolId(poolId);
        } catch (error) {
          toast.error(`${getCustomErrorMessage(error)}`);
          setLoading(false);
        }
        break;
      default:
        break;
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
                  <span className="text-base"> Design Your Project Token</span>
                </p>
              )}
              {page === 2 && (
                <p>
                  Step 2 of 3:
                  <span className="text-base">
                    {" "}
                    Customize Your Presale Settings
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
              creatorFees={creatorFees}
              setCreatorFees={setCreatorFees}
              liquidityPoolSupplyInPercentage={liquidityPoolSupplyInPercentage}
              setLiquidityPoolSupplyInPercentage={
                setLiquidityPoolSupplyInPercentage
              }
              decimals={decimals}
              setDecimals={setDecimals}
              supply={supply}
              setSupply={setSupply}
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
              creatorFees={creatorFees.replaceAll("%", "")}
              vestingPeriod={vestingPeriod}
              presaleTime={presaleDuration}
              presaleTarget={parseFloat(presaleTarget) * LAMPORTS_PER_SOL}
              liquidityPoolSupplyInPercentage={liquidityPoolSupplyInPercentage.replaceAll(
                "%",
                ""
              )}
            />
          )}
          {page == 4 && data && (
            <div className="flex flex-col gap-4 justify-center items-center">
              <span className="text-xl text-center">
                {`Congratulations on creating your project token!`}
              </span>
              <span className="text-base text-center">
                {`Whats's next? Click on the card below to fill in more details about your project!`}
              </span>
              <div className="flex justify-center items-center w-80">
                <CardItem pool={data[0]} timer={Date.now()} />
              </div>
            </div>
          )}
          {page <= 3 && (
            <div className="flex gap-4 p-4 items-end justify-end">
              <button
                hidden={page === 1}
                type="button"
                disabled={loading}
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
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateCollection;
