import { FC } from "react";
import { Project } from "../../sections/MintDashboard";
import { TableRow } from "./TableRow";

interface ExpiredTableProps {
  projects: Project[];
  timer: number;
}

export const ExpiredTable: FC<ExpiredTableProps> = ({ projects, timer }) => {
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
              Your Contribution
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Total Raised
            </th>
            <th scope="col" className="w-24 text-center p-2">
              Withdrawable
            </th>
            <th scope="col" className="w-24 text-center p-2" />
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td className="p-2 text-xs" colSpan={7}>
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
