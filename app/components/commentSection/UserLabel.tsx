import React from "react";

type UserLabelProps = {
  show: boolean;
};

const UserLabel = (props: UserLabelProps) => {
  const show = props.show ? "block" : "hidden";

  return (
    <div
      className={
        "bg-blue-600 uppercase rounded text-white text-xs font-medium py-0.5 px-1.5 flex items-center justify-center " +
        show
      }
    >
      you
    </div>
  );
};

export default UserLabel;
