"use client";

import React, { useState } from "react";
import UserDetail from "./UserDetail";
import Content from "./Content";
import Vote from "./Vote";
import ReplyButton from "./ReplyButton";
import Reply from "./Reply";
import InputComment from "./InputComment";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { IUser, IComment, IReply } from "../../utils/types";

type CommentProps = {
  poolId: string;
  currentUser: IUser;
  comment: IComment;
};

const Comment = (props: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const poolId = props.poolId;
  const comment = props.comment;
  const currentUser = props.currentUser;
  const isCurrentUser =
    comment.user.username == currentUser.username ? true : false;
  const replies = comment.replies;

  const handleIsReplyingChange = () => {
    setIsReplying((prevIsReplying) => !prevIsReplying);
  };

  const handleIsEditingChange = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  return (
    <>
      <div className="border border-gray-300 p-4 flex flex-col md:flex-row gap-4 rounded-md">
        <div className="hidden md:block">
          <Vote
            disabled={currentUser.username == "Anon"}
            poolId={poolId}
            commentIdToChangeVote={comment.id}
            score={comment.score}
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <UserDetail
            poolId={poolId}
            image={comment.user.image}
            username={comment.user.username}
            currentUser={currentUser}
            createdAt={comment.createdAt}
            isReplying={isReplying}
            onIsReplyingChange={handleIsReplyingChange}
            isEditing={isEditing}
            onIsEditingChange={handleIsEditingChange}
            commentId={comment.id}
          />
          <Content
            onIsEditingChange={handleIsEditingChange}
            commentId={comment.id}
            currentUser={currentUser}
            content={comment.content}
            isEditing={isEditing}
            poolId={poolId}
          />
        </div>
        <div className="flex gap-4 justify-between">
          <div className="block md:hidden">
            <Vote
              disabled={currentUser.username == "Anon"}
              commentIdToChangeVote={comment.id}
              poolId={poolId}
              score={comment.score}
            />
          </div>
          <div className="flex items-center justify-center gap-4 md:hidden">
            <ReplyButton
              hide={isCurrentUser || currentUser.username == "Anon"}
              isReplying={isReplying}
              onIsReplyingChange={handleIsReplyingChange}
            />
            <DeleteButton
              commentId={comment.id}
              show={isCurrentUser}
              poolId={poolId}
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
          commentId={comment.id}
          replyingTo={comment.user.username}
          currentUser={currentUser}
          action="reply"
          poolId={poolId}
        />
      ) : null}
      {replies.map((value: IReply) => {
        return (
          <Reply
            key={value.id}
            currentUser={currentUser}
            reply={value}
            commentId={comment.id}
            poolId={poolId}
          />
        );
      })}
    </>
  );
};

export default Comment;
