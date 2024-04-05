import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  convertSecondsToNearestUnit,
  getMetadata,
  getStatus,
} from "../utils/helper";
import { Mint, Pool, Status } from "../utils/types";
import { Project } from "./InventoryItem";

interface TableRowProps {
  project: Project;
}

export const TableRow: FC<TableRowProps> = ({ project }) => {
  const [status, setStatus] = useState<Status>();
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const router = useRouter();

  useEffect(() => {
    if (project) {
      getMetadata(project as Pool).then((response) => {
        setImage(response.image);
        setName(response.name);
      });
      setStatus(getStatus(project));
    }
  }, [project]);

  return (
    project &&
    name &&
    image && (
      <tr
        onClick={() => router.push(`/pool/${project.pool}`)}
        className="cursor-pointer border-b bg-gray-800 hover:bg-gray-900/50 border-gray-700"
      >
        <td scope="row" className="hidden sm:table-cell p-2">
          <Image
            width={0}
            height={0}
            sizes="100vw"
            className="w-8 h-auto sm:w-10 rounded"
            src={image}
            alt={""}
          />
        </td>
        <td scope="row" className="p-2 text-center">
          {name}
        </td>
        <td className="p-2 text-center">{status}</td>
        {status === Status.PresaleInProgress ||
          (status === Status.Expired && (
            <td scope="row" className="p-2">
              {project.liquidityCollected / LAMPORTS_PER_SOL + " Sol"}
            </td>
          ))}
        <td scope="row" className="p-2">
          {project.amount / LAMPORTS_PER_SOL + " Sol"}
        </td>
        {status === Status.PresaleInProgress && (
          <td className="p-2">
            {convertSecondsToNearestUnit(
              project.presaleTimeLimit - Date.now() / 1000
            )
              .split(" ")
              .slice(0, 2)
              .join(" ")}
          </td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2">{project.lpElligible}</td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2">{project.mintElligible}</td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2">{project.mintClaimed}</td>
        )}
        {(status === Status.VestingCompleted ||
          status === Status.VestingInProgress) && (
          <td className="p-2 text-center">
            {status === Status.VestingInProgress
              ? convertSecondsToNearestUnit(
                  project.vestingEndingAt - Date.now() / 1000
                )
              : "Completed"}
          </td>
        )}
        {status !== Status.PresaleInProgress && (
          <td className="p-2">
            <button className="text-blue-400">Claim</button>
          </td>
        )}
      </tr>
    )
  );
};
