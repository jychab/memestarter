import React, { useState } from "react";
import UserDetail from "./UserDetail";
import Content from "./Content";
import Vote from "./Vote";
import ReplyButton from "./ReplyButton";
import InputComment from "./InputComment";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { IUser, IReply } from "../../utils/types";
import Avatar from "./Avatar";
import { useWallet } from "@solana/wallet-adapter-react";

type ReplyProps = {
  poolCreator: string;
  poolId: string;
  currentUser: IUser;
  reply: IReply;
  commentId: string;
};

const Reply = (props: ReplyProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const poolCreator = props.poolCreator;
  const poolId = props.poolId;
  const reply = props.reply;
  const currentUser = props.currentUser;
  const isCurrentUser =
    reply.user.publicKey == currentUser.publicKey ? true : false;
  const commentId = props.commentId;
  const { publicKey } = useWallet();

  const handleIsReplyingChange = () => {
    setIsReplying((prevIsReplying) => !prevIsReplying);
  };

  const handleIsEditingChange = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  return (
    <div className="ml-8 border-l-2 border-gray-300 pl-4 md:pl-8 flex flex-col w-full">
      <div className="flex items-start gap-4 w-full">
        <Avatar user={reply.user} />
        <div className="flex flex-col gap-2 rounded-md w-full">
          <UserDetail
            username={reply.user.publicKey!}
            createdAt={reply.createdAt}
            poolId={poolId}
            poolCreator={poolCreator}
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
          <div className="flex gap-4 items-center">
            <Vote
              disabled={!publicKey}
              poolId={poolId}
              replyIdToChangeVote={reply.id}
              score={reply.score}
              commentIdToChangeVote={commentId}
            />
            <ReplyButton
              disabled={!publicKey}
              hide={isCurrentUser || !publicKey}
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
          replyingTo={reply.user.publicKey!}
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