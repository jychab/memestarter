import React from "react";
import UserLabel from "./UserLabel";
import { convertSecondsToNearestUnit } from "../../utils/helper";
import { Timestamp } from "firebase/firestore";

type UserDetailProps = {
  poolCreator: string;
  poolId: string;
  username: string;
  createdAt: number;
};
const UserDetail = (props: UserDetailProps) => {
  const username = props.username;
  const createdAt = `${
    (Date.now() - props.createdAt > 0
      ? convertSecondsToNearestUnit((Date.now() - props.createdAt) / 1000)
          .split(" ")
          .slice(0, 2)
          .join(" ")
      : "1 second") + " ago"
  } `;
  const poolCreator = props.poolCreator;

  return (
    <div className="flex gap-2 items-center md:justify-between">
      <div className="flex w-full items-center gap-2">
        <div className="flex gap-1 items-center">
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
