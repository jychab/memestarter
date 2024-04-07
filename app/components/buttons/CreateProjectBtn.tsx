import React, { FC } from "react";
import Link from "next/link";

export const CreateProjectBtn: FC = () => {
  return (
    <Link
      className="text-black rounded border border-gray-300 text-base p-2 hover:text-blue-700"
      href={"/create"}
    >
      <div className="flex items-center justify-center">
        <span>Start a project</span>
      </div>
    </Link>
  );
};
