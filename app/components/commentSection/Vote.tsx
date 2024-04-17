import React, { useState } from "react";
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
  positiveScoreRecord: Array<string>;
  negativeScoreRecord: Array<string>;
  commentIdToChangeVote: string;
  replyIdToChangeVote?: string;
};

const Vote = (props: VoteProps) => {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const positiveScoreRecord = props.positiveScoreRecord;
  const negativeScoreRecord = props.negativeScoreRecord;
  const disabled = props.disabled ? props.disabled : false;
  const poolId = props.poolId;
  const score = props.score;
  const commentIdToChangeVote = props.commentIdToChangeVote;
  const replyIdToChangeVote = props.replyIdToChangeVote;
  const { handleLogin } = useLogin();

  const handleClick = async (operation: string, buttonType: string) => {
    if (!publicKey || !signMessage || loading) return;
    try {
      setLoading(true);
      await handleLogin(publicKey, signMessage);
      if (!replyIdToChangeVote) {
        await handleUpdateCommentVote(
          poolId,
          commentIdToChangeVote,
          operation,
          buttonType
        );
      } else {
        await handleUpdateReplyVote(
          poolId,
          commentIdToChangeVote,
          replyIdToChangeVote,
          operation,
          buttonType
        );
      }
      setLoading(false);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="text-black text-xs font-medium flex items-center justify-center gap-2 rounded-xl">
      <button
        disabled={
          disabled ||
          loading ||
          (publicKey != null &&
            positiveScoreRecord.includes(publicKey.toBase58()))
        }
        onClick={() => {
          if (!publicKey || positiveScoreRecord.includes(publicKey.toBase58()))
            return;
          negativeScoreRecord.includes(publicKey.toBase58())
            ? handleClick("sub", "negative")
            : handleClick("add", "positive");
        }}
        className="flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill={
            publicKey && positiveScoreRecord.includes(publicKey.toBase58())
              ? "black"
              : "none"
          }
          stroke="currentColor"
        >
          <polygon points="3 14 12 3 21 14 16 14 16 22 8 22 8 14 3 14" />
        </svg>
      </button>
      <div>{score}</div>
      <button
        disabled={
          disabled ||
          loading ||
          (publicKey != null &&
            negativeScoreRecord.includes(publicKey.toBase58()))
        }
        onClick={() => {
          if (!publicKey || negativeScoreRecord.includes(publicKey.toBase58()))
            return;
          positiveScoreRecord.includes(publicKey.toBase58())
            ? handleClick("sub", "positive")
            : handleClick("add", "negative");
        }}
        className="flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill={
            publicKey && negativeScoreRecord.includes(publicKey.toBase58())
              ? "black"
              : "none"
          }
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
