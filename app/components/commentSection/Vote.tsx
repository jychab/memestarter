import React from "react";
import {
  handleUpdateCommentVote,
  handleUpdateReplyVote,
} from "../../utils/cloudFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "react-toastify";

type VoteProps = {
  disabled?: boolean;
  poolId: string;
  score: number;
  commentIdToChangeVote: string;
  replyIdToChangeVote?: string;
};

const Vote = (props: VoteProps) => {
  const disabled = props.disabled ? props.disabled : false;
  const poolId = props.poolId;
  const score = props.score;
  const commentIdToChangeVote = props.commentIdToChangeVote;
  const replyIdToChangeVote = props.replyIdToChangeVote;
  const { handleLogin } = useLogin();
  const { publicKey, signMessage } = useWallet();

  const handleClick = async (operation: string) => {
    if (!publicKey || !signMessage) return;
    try {
      await handleLogin(publicKey, signMessage);
      if (!replyIdToChangeVote) {
        await handleUpdateCommentVote(poolId, commentIdToChangeVote, operation);
      } else {
        await handleUpdateReplyVote(
          poolId,
          commentIdToChangeVote,
          replyIdToChangeVote,
          operation
        );
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="bg-gray-100 text-black font-medium py-1 md:py-4 px-4 md:px-3 flex md:flex-col items-center justify-center gap-4 rounded-xl">
      <button
        disabled={disabled}
        onClick={() => handleClick("add")}
        className="flex items-center justify-center"
      >
        <svg
          className="fill-gray-300 hover:fill-blue-700"
          width="11"
          height="11"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z" />
        </svg>
      </button>
      <div>{score}</div>
      <button
        disabled={disabled}
        onClick={() => handleClick("sub")}
        className="flex items-center justify-center"
      >
        <svg
          className="fill-gray-300 hover:fill-blue-700"
          width="11"
          height="3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z" />
        </svg>
      </button>
    </div>
  );
};

export default Vote;
