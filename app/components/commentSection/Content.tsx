import React, { useState } from "react";
import ActionButton from "./ActionButton";
import { IComment, IUser } from "../../utils/types";

type ContentProps = {
  poolId: string;
  content: string;
  replyingTo?: string;
  isEditing: boolean;
  currentUser: IUser;
  commentId: string;
  onIsEditingChange: () => void;
  replyIdToUpdate?: string;
};

const Content = (props: ContentProps) => {
  const poolId = props.poolId;
  const content = props.content;
  const replyingTo = props.replyingTo;
  const isEditing = props.isEditing;
  const currentUser = props.currentUser;
  const commentId = props.commentId;
  const onIsEditingChange = props.onIsEditingChange;
  const replyIdToUpdate = props.replyIdToUpdate;

  const [editValue, setEditValue] = useState(content);

  const commentValue = editValue;

  const handleChangeEditValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  return (
    <>
      {!isEditing ? (
        <div className="text-black text-sm">
          <span
            className={
              (replyingTo ? "" : "hidden ") +
              "text-blue-600 font-medium hover:cursor-pointer"
            }
          >
            {replyingTo + " "}
          </span>
          {content}
        </div>
      ) : null}
      {isEditing ? (
        <div className="flex flex-col items-end gap-4 rounded-md">
          <textarea
            className="border px-4 py-2 rounded-lg text-black w-full"
            placeholder="Add a comment..."
            value={editValue}
            onChange={handleChangeEditValue}
          />
          <div className="block">
            <ActionButton
              content={editValue}
              replyId={replyIdToUpdate}
              onIsEditingChange={onIsEditingChange}
              commentId={commentId}
              currentUser={currentUser}
              commentValue={commentValue}
              action="update"
              poolId={poolId}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Content;
