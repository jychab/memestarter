import React from "react";
import { handleUpdatePinComment } from "../../utils/cloudFunctions";

type PinnedButtonProps = {
  poolId: string;
  commentId: string;
  pinned: boolean;
};

const PinnedButton = (props: PinnedButtonProps) => {
  const handleClick = async () => {
    await handleUpdatePinComment(props.poolId, props.commentId, !props.pinned);
  };

  return (
    <button
      onClick={handleClick}
      className={
        "hover:opacity-50 flex gap-2 items-center justify-center text-black"
      }
    >
      {!props.pinned ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M14.579 14.579L11.6316 17.5264L10.7683 16.6631C10.3775 16.2723 10.1579 15.7422 10.1579 15.1894V13.1053L7.21052 10.158L5 9.42111L9.42111 5L10.158 7.21052L13.1053 10.1579L15.1894 10.1579C15.7422 10.1579 16.2722 10.3775 16.6631 10.7683L17.5264 11.6316L14.579 14.579ZM14.579 14.579L19 19"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M14.579 14.579L11.6316 17.5264L11.0526 16.9474M14.579 14.579L17.5264 11.6316L16.9474 11.0526M14.579 14.579L19 19M5 19L10.1579 13.8421M19 5L13.8421 10.1579M13.8421 10.1579L13.1053 10.1579L10.158 7.21052L9.42111 5L5 9.42111L7.21052 10.158L10.1579 13.1053V13.8421M13.8421 10.1579L10.1579 13.8421"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default PinnedButton;
