import Image from "next/image";
import React, { useState } from "react";
import DeleteModal from "./DeleteModal";

type DeleteButtonProps = {
  poolId: string;
  show: boolean;
  commentId: string;
  replyIdToDelete?: string;
};

const DeleteButton = (props: DeleteButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const commentId = props.commentId;
  const replyIdToDelete = props.replyIdToDelete;
  const poolId = props.poolId;
  const show = props.show ? " " : "hidden ";

  const handleShowModalChange = () => {
    setShowModal((prevShowModal) => !prevShowModal);
  };

  const handleClick = () => {
    setShowModal((prevShowModal) => !prevShowModal);
  };

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
      {showModal ? (
        <DeleteModal
          poolId={poolId}
          replyIdToDelete={replyIdToDelete}
          commentIdToDelete={commentId}
          onShowModalChange={handleShowModalChange}
        />
      ) : null}
    </>
  );
};

export default DeleteButton;
