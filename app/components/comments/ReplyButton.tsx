import Image from "next/image";
import React from "react";

type ReplyButtonProps = {
  hide: boolean;
  disabled?: boolean;
  onIsReplyingChange: () => void;
  isReplying: boolean;
};

const ReplyButton = (props: ReplyButtonProps) => {
  const hide = props.hide ? "hidden " : " ";
  const disabled = props.disabled ? props.disabled : false;
  const isReplying = props.isReplying;
  const onIsReplyingChange = props.onIsReplyingChange;
  const handleClick = () => {
    onIsReplyingChange();
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={
        hide +
        "flex gap-2 items-center justify-center hover:opacity-50 text-gray-700" +
        (isReplying ? " opacity-50" : " ")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16px"
        height="16px"
        viewBox="0 0 48 48"
        enableBackground="new 0 0 48 48"
        id="Layer_1"
        version="1.1"
        xmlSpace="preserve"
      >
        <g id="Layer_3">
          <path
            d="M0,1.499v36h12.031V48l14.906-10.501H48v-36H0z M44,33.499H26.906L16,41.125v-3.75v-3.876H4v-28h40V33.499z   "
            fill="currentColor"
          />
        </g>
      </svg>
      <div className="text-gray-700 text-sm font-medium">Reply</div>
    </button>
  );
};

export default ReplyButton;
