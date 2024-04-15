import React from "react";
import Avatar from "./Avatar";
import UserLabel from "./UserLabel";
import ReplyButton from "./ReplyButton";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
import { IUser } from "../../utils/types";
import { convertSecondsToNearestUnit } from "../../utils/helper";
import { Timestamp } from "firebase/firestore";

type UserDetailProps = {
  poolId: string;
  image: string;
  username: string;
  currentUser: IUser;
  createdAt: Timestamp;
  onIsReplyingChange: () => void;
  isReplying: boolean;
  onIsEditingChange: () => void;
  isEditing: boolean;
  commentId: string;
  replyIdToDelete?: string;
};
const UserDetail = (props: UserDetailProps) => {
  const poolId = props.poolId;
  const image = props.image;
  const username = props.username;
  const currentUser = props.currentUser;
  const createdAt = `${
    props.createdAt
      ? convertSecondsToNearestUnit(
          Date.now() / 1000 - props.createdAt.seconds
        ) + " ago"
      : ""
  } `;
  const isCurrentUser = username == currentUser.username ? true : false;
  const handleIsReplyingChange = props.onIsReplyingChange;
  const handleIsEditingChange = props.onIsEditingChange;
  const isReplying = props.isReplying;
  const isEditing = props.isEditing;
  const commentId = props.commentId;
  const replyIdToDelete = props.replyIdToDelete;

  return (
    <div className="flex gap-4 items-center md:justify-between">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <Avatar sourceImage={image} username={username} />
          <div className="font-medium max-w-12 lg:max-w-36 text-sm truncate text-black">
            {username}
          </div>
          <UserLabel show={isCurrentUser} />
        </div>
        <div className="text-gray-400 text-xs">{createdAt}</div>
      </div>
      <div className="hidden md:flex md:gap-4">
        <ReplyButton
          hide={isCurrentUser || currentUser.username == "Anon"}
          isReplying={isReplying}
          onIsReplyingChange={handleIsReplyingChange}
        />
        <DeleteButton
          poolId={poolId}
          replyIdToDelete={replyIdToDelete}
          commentId={commentId}
          show={isCurrentUser}
        />
        <EditButton
          show={isCurrentUser}
          isEditing={isEditing}
          onIsEditingChange={handleIsEditingChange}
        />
      </div>
    </div>
  );
};

export default UserDetail;
