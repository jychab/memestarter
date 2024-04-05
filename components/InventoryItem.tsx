import React, { FC, useEffect, useState } from "react";
import { DAS, Mint, Pool, Status } from "../utils/types";
import Image from "next/image";
import { Chip } from "./Chip";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import {
  query,
  orderBy,
  limit,
  onSnapshot,
  collection,
  getDocs,
  getDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { TableRow } from "./TableRow";
import { getMetadata, getStatus } from "../utils/helper";
import { QuerySnapshot } from "@google-cloud/firestore";

interface InventoryItemProps {
  item: DasApiAsset;
  collectionItem?: DasApiAsset;
  loading?: boolean;
  setSelectedItem?: (item: any) => void;
  handleSubmit?: (item: any) => void;
  actionText?: string;
}

export interface Project extends Mint, Pool {}

export const InventoryItem: FC<InventoryItemProps> = ({
  item,
  collectionItem,
  loading,
  setSelectedItem,
  handleSubmit,
  actionText,
}) => {
  const [projects, setProjects] = useState<Project[]>();
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [collectionImage, setCollectionImage] = useState();
  const [collectionName, setCollectionName] = useState();

  async function loadProject(
    docs: QueryDocumentSnapshot<DocumentData, DocumentData>[]
  ) {
    const temp: Project[] = [];
    await Promise.all(
      docs.map(async (docRef) => {
        const data = docRef.data() as Mint;
        const document = await getDoc(doc(db, `Pool/${data.pool}`));
        if (document.exists()) {
          const poolData = document.data() as Pool;
          temp.push({ ...data, ...poolData });
        }
      })
    );
    return temp;
  }
  useEffect(() => {
    if (item) {
      getMetadata(item.content.json_uri).then((response) => {
        setImage(response.image);
        setName(response.name);
      });
    }
  }, [item]);
  useEffect(() => {
    if (collectionItem) {
      getMetadata(collectionItem.content.json_uri).then((response) => {
        setCollectionImage(response.image);
        setCollectionName(response.name);
      });
    }
  }, [collectionItem]);

  useEffect(() => {
    getDocs(collection(db, `Mint/${item.id}/Pool`)).then((docs) => {
      if (docs.empty) {
        setProjects([]);
      } else {
        setProjects((prev) => (!prev ? [] : prev));
        loadProject(docs.docs).then((res) => setProjects(res));
      }
    });
  }, [item]);

  return (
    image &&
    name && (
      <div className="animate-fade-left animate-ease-linear animate-duration-150 p-4 flex flex-col flex-1 justify-between gap-4 bg-gray-800 rounded right-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            {setSelectedItem && (
              <button onClick={() => setSelectedItem(undefined)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    fill="currentColor"
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  />
                  <path
                    fill="currentColor"
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  />
                </svg>
              </button>
            )}
            {collectionItem && collectionItem.content.links && (
              <>
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-auto w-8 sm:h-auto rounded"
                  src={collectionImage}
                  alt={""}
                />
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[10px] uppercase text-gray-400">
                    Collection
                  </span>
                  <span className="uppercase">{collectionName}</span>
                </div>
              </>
            )}
            {handleSubmit && (
              <button
                onClick={() => handleSubmit(item)}
                className="flex justify-end items-end w-full"
              >
                {actionText === "Link" && !loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15.7285 3.88396C17.1629 2.44407 19.2609 2.41383 20.4224 3.57981C21.586 4.74798 21.5547 6.85922 20.1194 8.30009L17.6956 10.7333C17.4033 11.0268 17.4042 11.5017 17.6976 11.794C17.9911 12.0863 18.466 12.0854 18.7583 11.7919L21.1821 9.35869C23.0934 7.43998 23.3334 4.37665 21.4851 2.5212C19.6346 0.663551 16.5781 0.905664 14.6658 2.82536L9.81817 7.69182C7.90688 9.61053 7.66692 12.6739 9.51519 14.5293C9.80751 14.8228 10.2824 14.8237 10.5758 14.5314C10.8693 14.2391 10.8702 13.7642 10.5779 13.4707C9.41425 12.3026 9.44559 10.1913 10.8809 8.75042L15.7285 3.88396Z"
                      fill="currentColor"
                    />
                    <path
                      d="M14.4851 9.47074C14.1928 9.17728 13.7179 9.17636 13.4244 9.46868C13.131 9.76101 13.1301 10.2359 13.4224 10.5293C14.586 11.6975 14.5547 13.8087 13.1194 15.2496L8.27178 20.1161C6.83745 21.556 4.73937 21.5863 3.57791 20.4203C2.41424 19.2521 2.44559 17.1408 3.88089 15.6999L6.30473 13.2667C6.59706 12.9732 6.59614 12.4984 6.30268 12.206C6.00922 11.9137 5.53434 11.9146 5.24202 12.2081L2.81818 14.6413C0.906876 16.5601 0.666916 19.6234 2.51519 21.4789C4.36567 23.3365 7.42221 23.0944 9.33449 21.1747L14.1821 16.3082C16.0934 14.3895 16.3334 11.3262 14.4851 9.47074Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {actionText === "Unlink" && !loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    width="24px"
                    height="24px"
                    viewBox="0 0 36 36"
                    version="1.1"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d="M5,5,3.59,6.41l9,9L8.1,19.79a5.91,5.91,0,0,0,0,8.39,6,6,0,0,0,8.44,0L21,23.78l8.63,8.63L31,31ZM15.13,26.76a4,4,0,0,1-5.62,0,3.92,3.92,0,0,1,0-5.55L14,16.79l5.58,5.58Z"
                      className="clr-i-outline clr-i-outline-path-1"
                    />
                    <path
                      d="M21.53,9.22a4,4,0,0,1,5.62,0,3.92,3.92,0,0,1,0,5.55l-4.79,4.76L23.78,21l4.79-4.76a5.92,5.92,0,0,0,0-8.39,6,6,0,0,0-8.44,0l-4.76,4.74L16.78,14Z"
                      className="clr-i-outline clr-i-outline-path-2"
                    />
                    <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
                  </svg>
                )}
                {loading && (
                  <svg
                    className="inline w-5 h-5 animate-spin text-gray-600 fill-gray-300"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <Image
              className="w-24 h-auto rounded items-center justify-center object-cover"
              width={0}
              height={0}
              sizes="100vw"
              src={image}
              alt={item.id}
            />
            <div className="flex flex-col w-3/4 overflow-hidden gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] uppercase text-gray-400">
                  Name
                </span>
                <span className="text-[10px] sm:text-xs">{name}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[10px] uppercase text-gray-400">
                    Mint
                  </span>
                  <span className="text-[10px] max-w-20 truncate text-gray-400">
                    {item.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col text-xs text-gray-400 gap-4">
            <span>Funded</span>
            <div className="overflow-x-auto">
              <table className="w-full text-[8px] sm:text-[10px] text-left rtl:text-right border border-gray-700 text-gray-400">
                <thead className="uppercase bg-gray-800 border-b border-gray-700 text-gray-400">
                  <tr className="">
                    <th scope="col" className="hidden sm:table-cell w-16 p-2" />
                    <th scope="col" className="w-auto p-2">
                      Project
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Status
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Liquidity
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Funded
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Presale End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects &&
                    projects.filter(
                      (item) =>
                        getStatus(item as Pool) === Status.PresaleInProgress
                    ).length === 0 && (
                      <tr>
                        <td className="p-2 text-xs" colSpan={6}>
                          <span>No projects found.</span>
                        </td>
                      </tr>
                    )}
                  {projects &&
                    projects.length > 0 &&
                    projects
                      .filter(
                        (item) =>
                          getStatus(item as Pool) === Status.PresaleInProgress
                      )
                      .map((project, index) => (
                        <TableRow key={index} project={project} />
                      ))}
                </tbody>
              </table>
            </div>
            <span>Vesting</span>
            <div className="overflow-x-auto">
              <table className="w-full text-[8px] sm:text-[10px] text-left rtl:text-right border border-gray-700 text-gray-400">
                <thead className="uppercase bg-gray-800 border-b border-gray-700 text-gray-400">
                  <tr className="">
                    <th scope="col" className="hidden sm:table-cell w-16 p-2" />
                    <th scope="col" className="w-auto p-2">
                      Project
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Status
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Funded
                    </th>
                    <th scope="col" className="w-20 text-center p-2">
                      Lp Elligible
                    </th>

                    <th scope="col" className="w-20 text-center p-2">
                      Mint Elligible
                    </th>
                    <th scope="col" className="w-20 text-center p-2">
                      Mint Claimed
                    </th>
                    <th scope="col" className="w-20 text-center p-2">
                      Vesting End
                    </th>

                    <th scope="col" className="w-16 p-2" />
                  </tr>
                </thead>
                <tbody>
                  {projects &&
                    projects.filter(
                      (item) =>
                        getStatus(item as Pool) === Status.VestingInProgress
                    ).length === 0 && (
                      <tr>
                        <td className="p-2 text-xs" colSpan={6}>
                          <span>No projects found.</span>
                        </td>
                      </tr>
                    )}
                  {projects &&
                    projects.length > 0 &&
                    projects
                      .filter(
                        (item) =>
                          getStatus(item as Pool) === Status.VestingInProgress
                      )
                      .map((project, index) => (
                        <TableRow key={index} project={project} />
                      ))}
                </tbody>
              </table>
            </div>
            <span>Completed</span>
            <div className="overflow-x-auto">
              <table className="w-full text-[8px] sm:text-[10px] text-left rtl:text-right border border-gray-700 text-gray-400">
                <thead className="uppercase bg-gray-800 border-b border-gray-700 text-gray-400">
                  <tr className="">
                    <th scope="col" className="hidden sm:table-cell w-16 p-2" />
                    <th scope="col" className="w-auto p-2">
                      Project
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Status
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Funded
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Lp Elligible
                    </th>

                    <th scope="col" className="w-16 p-2">
                      Mint Elligible
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Mint Claimed
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Vesting End
                    </th>
                    <th scope="col" className="w-16 p-2" />
                  </tr>
                </thead>
                <tbody>
                  {projects &&
                    projects.filter(
                      (item) =>
                        getStatus(item as Pool) === Status.VestingCompleted
                    ).length === 0 && (
                      <tr>
                        <td className="p-2 text-xs" colSpan={6}>
                          <span>No projects found.</span>
                        </td>
                      </tr>
                    )}
                  {projects &&
                    projects
                      .filter(
                        (item) =>
                          getStatus(item as Pool) === Status.VestingCompleted
                      )
                      .map((project, index) => (
                        <TableRow key={index} project={project} />
                      ))}
                </tbody>
              </table>
            </div>
            <span>Expired</span>
            <div className="overflow-x-auto">
              <table className="w-full text-[8px] sm:text-[10px] text-left rtl:text-right border border-gray-700 text-gray-400">
                <thead className="uppercase bg-gray-800 border-b border-gray-700 text-gray-400">
                  <tr className="">
                    <th scope="col" className="hidden sm:table-cell w-16 p-2" />
                    <th scope="col" className="w-auto p-2">
                      Project
                    </th>
                    <th scope="col" className="w-24 p-2">
                      Status
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Liquidity
                    </th>
                    <th scope="col" className="w-16 p-2">
                      Funded
                    </th>
                    <th scope="col" className="w-16 p-2" />
                  </tr>
                </thead>
                <tbody>
                  {projects &&
                    projects.filter(
                      (item) => getStatus(item as Pool) === Status.Expired
                    ).length === 0 && (
                      <tr>
                        <td className="p-2 text-xs" colSpan={6}>
                          <span>No projects found.</span>
                        </td>
                      </tr>
                    )}
                  {projects &&
                    projects
                      .filter(
                        (item) => getStatus(item as Pool) === Status.Expired
                      )
                      .map((project, index) => (
                        <TableRow key={index} project={project} />
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
