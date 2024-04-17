"use client";

import React, { useEffect, useState } from "react";
import UserDetail from "./UserDetail";
import Content from "./Content";
import Vote from "./Vote";
import ReplyButton from "./ReplyButton";
import Reply from "./Reply";
import InputComment from "./InputComment";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { IUser, IComment, IReply } from "../../utils/types";
import Avatar from "./Avatar";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useWallet } from "@solana/wallet-adapter-react";
import PinnedButton from "./PinnedButton";

type CommentProps = {
  poolId: string;
  poolCreator: string;
  currentUser: IUser;
  comment: IComment;
};

const Comment = (props: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const poolCreator = props.poolCreator;
  const poolId = props.poolId;
  const comment = props.comment;
  const currentUser = props.currentUser;
  const numReplies = props.comment.numReplies;
  const isCurrentUser =
    comment.user.publicKey == currentUser.publicKey ? true : false;
  const [replies, setReplies] = useState<IReply[]>([]);
  const [maxReplies, setMaxReplies] = useState(5);
  const { publicKey } = useWallet();

  const handleIsReplyingChange = () => {
    setIsReplying((prevIsReplying) => !prevIsReplying);
  };

  const handleIsEditingChange = () => {
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  useEffect(() => {
    if (showReplies && comment && poolId) {
      const repliesUnsubscribe = onSnapshot(
        query(
          collection(db, `Pool/${poolId}/Comments/${comment.id}/Replies`),
          orderBy("score", "desc"),
          orderBy("createdAt", "desc"),
          limit(maxReplies)
        ),
        (repliesSnapshot) => {
          setReplies(repliesSnapshot.docs.map((doc) => doc.data() as IReply));
        }
      );
      return () => repliesUnsubscribe();
    } else {
      setReplies([]);
    }
  }, [showReplies, comment, maxReplies, poolId]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={`flex flex-col p-4 gap-4 rounded ${
          showReplies ? "border border-gray-300" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <Avatar user={comment.user} />
          <div className="flex flex-col gap-2 w-full rounded-md">
            <UserDetail
              poolCreator={poolCreator}
              poolId={poolId}
              username={comment.user.publicKey!}
              createdAt={comment.createdAt}
            />
            <Content
              onIsEditingChange={handleIsEditingChange}
              commentId={comment.id}
              currentUser={currentUser}
              content={comment.content}
              isEditing={isEditing}
              poolId={poolId}
            />
            <div className="flex gap-4 items-center ">
              <Vote
                positiveScoreRecord={comment.positiveScoreRecord}
                negativeScoreRecord={comment.negativeScoreRecord}
                disabled={!publicKey}
                commentIdToChangeVote={comment.id}
                poolId={poolId}
                score={comment.score}
              />
              {publicKey && publicKey.toBase58() === poolCreator && (
                <PinnedButton
                  poolId={poolId}
                  commentId={comment.id}
                  pinned={comment.pinned}
                />
              )}
              <ReplyButton
                disabled={!publicKey}
                hide={isCurrentUser || !publicKey}
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
            {numReplies > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-start py-2"
              >
                <span className="text-blue-600 font-medium text-xs">
                  {showReplies ? "Hide replies" : `${numReplies} replies`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      {isReplying ? (
        <InputComment
          onIsReplyingChange={handleIsReplyingChange}
          commentId={comment.id}
          replyingTo={comment.user.publicKey!}
          currentUser={currentUser}
          action="reply"
          poolId={poolId}
        />
      ) : null}
      {replies.map((value: IReply) => {
        return (
          <Reply
            poolCreator={poolCreator}
            key={value.id}
            currentUser={currentUser}
            reply={value}
            commentId={comment.id}
            poolId={poolId}
          />
        );
      })}
      {showReplies && maxReplies < numReplies && (
        <button
          onClick={() => setMaxReplies(maxReplies + 10)}
          className="ml-8 pl-8 flex items-start"
        >
          <span className="text-blue-600 font-medium text-xs">{`Show more`}</span>
        </button>
      )}
    </div>
  );
};

export default Comment;
