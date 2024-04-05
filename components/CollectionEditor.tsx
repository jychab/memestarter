import { FC, useState } from "react";
import { PublicKey } from "@solana/web3.js";

interface CollectionEditorProps {
  setCollection: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CollectionEditor: FC<CollectionEditorProps> = ({
  setCollection,
}) => {
  const [mintAddress, setMintAddress] = useState("");
  return (
    <div className="flex items-center gap-2">
      <div>
        <input
          type="text"
          inputMode="text"
          id="mint-address"
          className="w-48 text-center text-sm block p-1 bg-gray-800/30 rounded border-b border-gray-500  placeholder-gray-400 text-white focus:outline-none"
          placeholder="Insert collection mint address"
          value={mintAddress}
          onChange={(e) => {
            if (e.target.value) {
              setMintAddress(e.target.value);
            }
          }}
          required
        />
      </div>
      <button
        type="button"
        onClick={() => {
          try {
            new PublicKey(mintAddress);
            setCollection((previous) => {
              if (!previous.includes(mintAddress)) {
                return [...previous, mintAddress];
              }
              return [...previous];
            });
          } catch (e) {
            console.log("Invalid publickey");
          }
          setMintAddress("");
        }}
        className="focus:outline-none rounded text-xs uppercase text-gray-300 hover:text-blue-300"
      >
        add
      </button>
    </div>
  );
};
