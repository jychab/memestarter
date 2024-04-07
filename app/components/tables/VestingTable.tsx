import React, { FC } from "react";
import { Project } from "../InventoryItem";
import { getStatus } from "../../utils/helper";
import { Pool, Status } from "../../utils/types";
import { TableRow } from "../TableRow";

interface VestingTableProps {
  projects: Project[];
  timer: number;
}

export const VestingTable: FC<VestingTableProps> = ({ projects, timer }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left rtl:text-right border border-gray-300">
        <thead className="uppercase border-b border-gray-300">
          <tr className="text-[10px]">
            <th scope="col" className="hidden sm:table-cell w-16 p-2" />
            <th scope="col" className="w-auto p-2">
              Project
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Funded
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Mint Elligible (unvested)
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Mint Claimed
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Mint Elligible (Allocated)
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Vesting End
            </th>

            <th scope="col" className="w-24 text-center p-2" />
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td className="p-2 text-xs" colSpan={6}>
                <span>No projects found.</span>
              </td>
            </tr>
          )}
          {projects.map((project, index) => (
            <TableRow key={index} project={project} timer={timer} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
