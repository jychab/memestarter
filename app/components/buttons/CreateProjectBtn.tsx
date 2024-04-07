import React, { FC } from "react";
import Link from "next/link";

export const CreateProjectBtn: FC = () => {
  return (
    <Link
      className="text-gray-300 focus:ring-4 font-medium rounded text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
      href={"/create"}
    >
      <div className="flex items-center justify-center">
        <span>Create Project</span>
      </div>
    </Link>
  );
};
