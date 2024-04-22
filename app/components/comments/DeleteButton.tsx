import React, { useCallback } from "react";
import { toast } from "react-toastify";
import {
  handleDeleteReply,
  handleDeleteComment,
} from "../../utils/cloudFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../../hooks/useLogin";

type DeleteButtonProps = {
  poolId: string;
  show: boolean;
  commentId: string;
  replyIdToDelete?: string;
};

const DeleteButton = (props: DeleteButtonProps) => {
  const commentId = props.commentId;
  const { handleLogin } = useLogin();
  const { publicKey, signMessage } = useWallet();
  const replyIdToDelete = props.replyIdToDelete;
  const poolId = props.poolId;
  const show = props.show ? " " : "hidden ";

  const handleClick = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    try {
      await handleLogin(publicKey, signMessage);
      if (replyIdToDelete) {
        await handleDeleteReply(poolId, commentId, replyIdToDelete);
      } else {
        await handleDeleteComment(poolId, commentId);
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  }, [handleLogin, publicKey, signMessage, replyIdToDelete, commentId, poolId]);

  return (
    <>
      <button
        onClick={handleClick}
        className={
          show +
          "hover:opacity-50 flex gap-2 items-center justify-center text-black"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M10 12V17" stroke="currentColor" />
          <path d="M14 12V17" stroke="currentColor" />
          <path d="M4 7H20" stroke="currentColor" />
          <path
            d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
            stroke="currentColor"
          />
          <path
            d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
            stroke="currentColor"
          />
        </svg>
      </button>
    </>
  );
};

export default DeleteButton;
