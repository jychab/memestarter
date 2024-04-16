"use client";

import React, { ChangeEventHandler, useState } from "react";
import ActionButton from "./ActionButton";
import Avatar from "./Avatar";
import { IUser, IReply, IComment } from "../../utils/types";

type InputCommentProps = {
  poolId: string;
  currentUser: IUser;
  action: string;
  replyingTo?: string;
  commentId?: string;
  onIsReplyingChange?: () => void;
  replyId?: string;
};

const InputComment = (props: InputCommentProps) => {
  const currentUser = props.currentUser;
  const action = props.action;
  const replyingTo = props.replyingTo;
  const commentId = props.commentId;
  const onIsReplyingChange = props.onIsReplyingChange;
  const replyId = props.replyId;
  const poolId = props.poolId;

  const [commentValue, setCommentValue] = useState("");

  const handleChangeCommentValue = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCommentValue(e.target.value);
  };

  const resetCommentValue = () => {
    setCommentValue("");
  };

  return (
    <div
      className={
        (action == "reply" ? "pl-12 " : " ") +
        "flex items-center justify-between gap-4 p-4"
      }
    >
      <textarea
        className="border border-gray-300 text-sm px-4 py-2 rounded-lg text-black w-full"
        placeholder="Add a comment..."
        value={commentValue}
        onChange={handleChangeCommentValue}
      />
      <ActionButton
        poolId={poolId}
        resetCommentValue={resetCommentValue}
        replyId={replyId}
        onIsReplyingChange={onIsReplyingChange}
        replyingTo={replyingTo}
        commentId={commentId}
        currentUser={currentUser}
        commentValue={commentValue}
        action={action}
      />
    </div>
  );
};

export default InputComment;
