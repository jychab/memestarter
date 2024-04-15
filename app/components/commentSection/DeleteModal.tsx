import React from "react";
import {
  handleDeleteComment,
  handleDeleteReply,
} from "../../utils/cloudFunctions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLogin } from "../../hooks/useLogin";
import { toast } from "react-toastify";

type DeleteModalProps = {
  poolId: string;
  onShowModalChange: () => void;
  commentIdToDelete: string;
  replyIdToDelete?: string;
};

const DeleteModal = (props: DeleteModalProps) => {
  const onShowModalChange = props.onShowModalChange;
  const commentIdToDelete = props.commentIdToDelete;
  const replyIdToDelete = props.replyIdToDelete;
  const poolId = props.poolId;
  const { handleLogin } = useLogin();
  const { publicKey, signMessage } = useWallet();

  const handleClick = () => {
    onShowModalChange();
  };

  const handleDeleteClick = async () => {
    onShowModalChange();
    if (!publicKey || !signMessage) return;
    try {
      await handleLogin(publicKey, signMessage);
      if (replyIdToDelete) {
        await handleDeleteReply(poolId, commentIdToDelete, replyIdToDelete);
      } else {
        await handleDeleteComment(poolId, commentIdToDelete);
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <div className="fixed top-0 right-0 bg-black bg-opacity-30 p-4 h-screen w-screen flex items-center justify-center">
      <div className="z-40 border border-gray-300 bg-white text-black flex flex-col gap-4 p-8 rounded-lg md:w-96">
        <div className="font-medium text-black text-lg">Delete comment?</div>
        <div className="text-black text-base">
          Are you sure you want to delete this comment? This will remove the
          comment and cant be undone
        </div>
        <div className="flex gap-4 justify-between">
          <button
            onClick={handleClick}
            className="px-4 py-2 uppercase bg-gray-800 text-white font-medium rounded-lg"
          >
            No, cancel
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 uppercase bg-red-700 text-white font-medium rounded-lg"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
