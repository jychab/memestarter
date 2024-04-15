import React, { useState } from "react";
import UserDetail from "./UserDetail";
import Content from "./Content";
import Vote from "./Vote";
import ReplyButton from "./ReplyButton";
import InputComment from "./InputComment";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { IUser, IReply, IComment } from "../../utils/types";

type ReplyProps = {
  poolId: string;
  currentUser: IUser;
  reply: IReply;
  commentId: string;
};

const Reply = (props: ReplyProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const poolId = props.poolId;
  const reply = props.reply;
  const currentUser = props.currentUser;
  const isCurrentUser =
    reply.user.username == currentUser.username ? true : false;
  const commentId = props.commentId;

  const handleIsReplyingChange = () => {
    setIsReplying((prevIsReplying) => !prevIsReplying);
  };

  const handleIsEditingChange = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  return (
    <div className="md:ml-8 border-l-2 border-gray-300 pl-4 md:pl-8 flex flex-col gap-4">
      <div className="p-4 flex flex-col md:flex-row gap-4 rounded-md">
        <div className="hidden md:block">
          <Vote
            poolId={poolId}
            replyIdToChangeVote={reply.id}
            score={reply.score}
            commentIdToChangeVote={commentId}
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <UserDetail
            commentId={commentId}
            replyIdToDelete={reply.id}
            image={reply.user.image}
            username={reply.user.username}
            currentUser={currentUser}
            createdAt={reply.createdAt}
            isReplying={isReplying}
            onIsReplyingChange={handleIsReplyingChange}
            isEditing={isEditing}
            onIsEditingChange={handleIsEditingChange}
            poolId={poolId}
          />
          <Content
            replyIdToUpdate={reply.id}
            onIsEditingChange={handleIsEditingChange}
            currentUser={currentUser}
            replyingTo={reply.replyingTo}
            content={reply.content}
            isEditing={isEditing}
            poolId={poolId}
            commentId={commentId}
          />
        </div>
        <div className="flex gap-4 justify-between">
          <div className="block md:hidden">
            <Vote
              poolId={poolId}
              replyIdToChangeVote={reply.id}
              score={reply.score}
              commentIdToChangeVote={commentId}
            />
          </div>
          <div className="flex items-center justify-center gap-4 md:hidden">
            <ReplyButton
              hide={isCurrentUser}
              isReplying={isReplying}
              onIsReplyingChange={handleIsReplyingChange}
            />
            <DeleteButton
              poolId={poolId}
              replyIdToDelete={reply.id}
              show={isCurrentUser}
              commentId={commentId}
            />
            <EditButton
              show={isCurrentUser}
              isEditing={isEditing}
              onIsEditingChange={handleIsEditingChange}
            />
          </div>
        </div>
      </div>
      {isReplying ? (
        <InputComment
          onIsReplyingChange={handleIsReplyingChange}
          replyId={reply.id}
          replyingTo={reply.user.username}
          currentUser={currentUser}
          action="reply"
          poolId={poolId}
          commentId={commentId}
        />
      ) : null}
    </div>
  );
};

export default Reply;
