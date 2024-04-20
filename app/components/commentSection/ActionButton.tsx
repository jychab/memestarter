import React from "react";
import { IComment, IReply, IUser } from "../../utils/types";
import {
  handleAddComment,
  handleReplyComment,
  handleUpdateComment,
  handleUpdateReply,
} from "../../utils/cloudFunctions";
import { FieldValue, Timestamp, serverTimestamp } from "firebase/firestore";
import { useLogin } from "../../hooks/useLogin";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";

type ActionButtonProps = {
  poolId: string;
  action: string;
  currentUser: IUser;
  commentValue: string;
  replyingTo?: string;
  replyId?: string;
  commentId?: string;
  content?: string;
  onIsReplyingChange?: () => void;
  onIsEditingChange?: () => void;
  resetCommentValue?: () => void;
};

const ActionButton = (props: ActionButtonProps) => {
  const poolId = props.poolId;
  const action = props.action;
  const currentUser = props.currentUser;
  const commentValue = props.commentValue;
  const replyingTo = props.replyingTo;
  const commentId = props.commentId;
  const replyId = props.replyId;
  const content = props.content;
  const onIsReplyingChange = props.onIsReplyingChange;
  const onIsEditingChange = props.onIsEditingChange;
  const resetCommentValue = props.resetCommentValue;
  const { handleLogin } = useLogin();
  const { publicKey, signMessage } = useWallet();

  const handleClick = async () => {
    if (!publicKey || !signMessage) return;
    try {
      await handleLogin(publicKey, signMessage);
      switch (action) {
        case "send":
          const newComment: IComment = {
            pinned: false,
            id: crypto.randomUUID(),
            content: commentValue,
            createdAt: Date.now(),
            score: 0,
            user: {
              publicKey: publicKey.toBase58(),
            },
            numReplies: 0,
            positiveScoreRecord: [],
            negativeScoreRecord: [],
          };
          await handleAddComment(poolId, newComment);
          break;
        case "reply":
          if (!commentId) break;
          const newReply: IReply = {
            id: crypto.randomUUID(),
            content: commentValue,
            score: 0,
            user: {
              publicKey: publicKey.toBase58(),
            },
            createdAt: Date.now(),
            replyingTo: replyingTo ?? "",
            positiveScoreRecord: [],
            negativeScoreRecord: [],
          };
          await handleReplyComment(poolId, newReply, commentId);
          onIsReplyingChange ? onIsReplyingChange() : null;
          break;
        case "update":
          if (!commentId) break;
          if (content) {
            if (replyId) {
              await handleUpdateReply(poolId, content, commentId, replyId);
            } else {
              await handleUpdateComment(poolId, content, commentId);
            }
          }
          onIsEditingChange ? onIsEditingChange() : null;
          break;
        default:
          break;
      }

      resetCommentValue ? resetCommentValue() : null;
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hover:text-blue-700 hover:border-blue-700 px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded uppercase"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
          stroke="currentColor"
        />
      </svg>
    </button>
  );
};

export default ActionButton;
