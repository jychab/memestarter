import Image from "next/image";
import React from "react";

type ReplyButtonProps = {
  hide: boolean;
  onIsReplyingChange: () => void;
  isReplying: boolean;
};

const ReplyButton = (props: ReplyButtonProps) => {
  const hide = props.hide ? "hidden " : " ";
  const isReplying = props.isReplying;
  const onIsReplyingChange = props.onIsReplyingChange;
  const handleClick = () => {
    onIsReplyingChange();
  };

  return (
    <button
      onClick={handleClick}
      className={
        hide +
        "flex gap-2 items-center justify-center hover:opacity-50 text-gray-700" +
        (isReplying ? " opacity-50" : " ")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        height="18px"
        width="18px"
        version="1.1"
        viewBox="0 0 512 512"
        enableBackground="new 0 0 512 512"
      >
        <path d="M185.2,128.6V19.7L0,204.9l185.2,185.2V281.1c152.5,0,250.5,0,326.8,217.9C512,390.1,522.9,128.6,185.2,128.6z" />
      </svg>
      <div className="text-gray-700 text-sm font-medium">Reply</div>
    </button>
  );
};

export default ReplyButton;
