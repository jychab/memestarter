import React from "react";
import Avatar from "./Avatar";
import UserLabel from "./UserLabel";
import { convertSecondsToNearestUnit } from "../../utils/helper";
import { Timestamp } from "firebase/firestore";

type UserDetailProps = {
  poolCreator: string;
  poolId: string;
  username: string;
  createdAt: Timestamp;
};
const UserDetail = (props: UserDetailProps) => {
  const username = props.username;
  const createdAt = `${
    props.createdAt
      ? convertSecondsToNearestUnit(Date.now() / 1000 - props.createdAt.seconds)
          .split(" ")
          .slice(0, 1)
          .join(" ") + " ago"
      : ""
  } `;
  const poolCreator = props.poolCreator;

  return (
    <div className="flex gap-4 items-center md:justify-between">
      <div className="flex w-full items-center gap-4">
        <div className="flex gap-2 items-center">
          <div className="font-medium max-w-24 lg:max-w-96 text-sm truncate text-black">
            {username}
          </div>
          <UserLabel creator={poolCreator} commentUser={username} />
        </div>
        <div className="text-gray-400 text-xs">{createdAt}</div>
      </div>
    </div>
  );
};

export default UserDetail;
