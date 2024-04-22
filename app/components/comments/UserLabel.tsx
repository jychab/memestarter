import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";

type UserLabelProps = {
  commentUser: string;
  creator: string;
};

const UserLabel = (props: UserLabelProps) => {
  const { publicKey } = useWallet();
  const user = props.commentUser;
  const creator = props.creator;
  return (
    ((publicKey && user == publicKey.toBase58()) || creator == user) && (
      <div
        className={`uppercase rounded ${
          publicKey && user == publicKey.toBase58()
            ? "text-blue-800"
            : "text-red-800"
        } text-xs font-medium flex items-center justify-center `}
      >
        {publicKey && user == publicKey.toBase58() ? "you" : "Creator"}
      </div>
    )
  );
};

export default UserLabel;
