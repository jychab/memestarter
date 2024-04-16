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
    <div className="text-black text-xs font-medium flex items-center justify-center gap-2 rounded-xl">
      <button
        disabled={disabled}
        onClick={() => handleClick("add")}
        className="flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polygon points="3 14 12 3 21 14 16 14 16 22 8 22 8 14 3 14" />
        </svg>
      </button>
      <div>{score}</div>
      <button
        disabled={disabled}
        onClick={() => handleClick("sub")}
        className="flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="rotate-180"
        >
          <polygon points="3 14 12 3 21 14 16 14 16 22 8 22 8 14 3 14" />
        </svg>
      </button>
    </div>
  );
};

export default Vote;
