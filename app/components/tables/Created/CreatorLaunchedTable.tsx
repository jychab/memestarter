import { FC } from "react";
import { PoolType } from "../../../utils/types";
import { CreatorTableRow } from "./CreatorTableRow";

interface LaunchedTableProps {
  pool: PoolType[];
  timer: number;
}

export const LaunchedTable: FC<LaunchedTableProps> = ({ pool, timer }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left rtl:text-right border border-gray-300">
        <thead className="uppercase border-b border-gray-300">
          <tr className="text-[10px]">
            <th scope="col" className="w-16 p-2" />
            <th scope="col" className="w-auto p-2">
              Project
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Tokens Allocated
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Lp Allocated
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Lp Unclaimed
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Lp Claimed
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Vesting End
            </th>
            <th scope="col" className="w-24 text-center p-2" />
          </tr>
        </thead>
        <tbody>
          {pool.length === 0 && (
            <tr>
              <td className="p-2 text-xs" colSpan={10}>
                <span>No projects found.</span>
              </td>
            </tr>
          )}
          {pool.map((mypool, index) => (
            <CreatorTableRow key={index} pool={mypool} timer={timer} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
