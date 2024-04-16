import React, { useState, useCallback, FC } from "react";
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

export const Vote: FC<VoteProps> = ({
  disabled = false,
  poolId,
  score,
  positiveScoreRecord,
  negativeScoreRecord,
  commentIdToChangeVote,
  replyIdToChangeVote,
}) => {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useLogin();

  const handleClick = useCallback(
    async (operation: string, buttonType: string) => {
      if (!publicKey || !signMessage || loading) return;
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        if (!replyIdToChangeVote) {
          await handleUpdateCommentVote(
            publicKey.toBase58(),
            poolId,
            commentIdToChangeVote,
            operation,
            buttonType
          );
        } else {
          await handleUpdateReplyVote(
            publicKey.toBase58(),
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
    },
    [
      publicKey,
      signMessage,
      loading,
      handleLogin,
      poolId,
      commentIdToChangeVote,
      replyIdToChangeVote,
    ]
  );

  const handleVote = (buttonType: string) => {
    if (!publicKey) return;
    const isPositive = buttonType === "positive";
    const isScoreRecorded = isPositive
      ? positiveScoreRecord.includes(publicKey?.toBase58())
      : negativeScoreRecord.includes(publicKey?.toBase58());

    if (!isScoreRecorded) {
      handleClick("add", buttonType);
    } else {
      handleClick("sub", buttonType);
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
        onClick={() => handleVote("positive")}
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
        onClick={() => handleVote("negative")}
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
