import React, { FC, useState } from "react";
import Image from "next/image";
import { separateNumberWithComma } from "../utils/helper";

interface CreateTokenPaneProps {
  tempImageUrl: string | null;
  handlePictureChange: (e: any) => void;
  name: string;
  handleNameChange: (e: any) => void;
  symbol: string;
  handleSymbolChange: (e: any) => void;
  externalUrl: string;
  handleExternalUrlChange: (e: any) => void;
  description: string;
  handleDescriptionChange: (e: any) => void;
}

export const CreateTokenPane: FC<CreateTokenPaneProps> = ({
  tempImageUrl,
  handlePictureChange,
  name,
  handleNameChange,
  symbol,
  handleSymbolChange,
  externalUrl,
  handleExternalUrlChange,
  description,
  handleDescriptionChange,
}) => {
  return (
    <div className="animate-fade-right flex flex-col lg:flex-row gap-4">
      <div className="flex w-40 h-40 lg:w-60 lg:h-60 items-center justify-center">
        <label
          htmlFor="dropzone-file"
          className={`cursor-pointer relative flex flex-col w-40 h-40 lg:w-60 lg:h-60 justify-center items-center`}
        >
          {tempImageUrl ? (
            <Image
              className={`rounded object-cover cursor-pointer`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={tempImageUrl}
              alt={""}
            />
          ) : (
            <div className="flex flex-col w-full h-full border bg-gray-100 hover:bg-gray-200 hover:border-gray-200 items-center justify-center">
              <svg
                className="w-8 h-8 mb-4 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="text-sm text-center flex flex-col text-gray-400">
                <span className="font-semibold">Click to upload</span>
                <span>or drag and drop</span>
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            name="dropzone-file"
            onChange={handlePictureChange}
          />
        </label>
      </div>
      <div className="flex flex-col w-full gap-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative z-0 w-full group">
            <input
              type="text"
              maxLength={32}
              name="floating_name"
              id="floating_name"
              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={name}
              placeholder={name}
              onChange={handleNameChange}
              required
            />
            <label
              htmlFor="floating_name"
              className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Name
            </label>
          </div>
          <div className="relative z-0 w-full group">
            <input
              type="text"
              maxLength={10}
              name="floating_symbol"
              id="floating_symbol"
              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={symbol}
              placeholder={symbol}
              onChange={handleSymbolChange}
              required
            />
            <label
              htmlFor="floating_symbol"
              className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Symbol
            </label>
          </div>
        </div>
        <div className="relative z-0 w-full group">
          <input
            type="text"
            maxLength={200}
            name="floating_externalUrl"
            id="floating_externalUrl"
            className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={externalUrl}
            placeholder={externalUrl}
            onChange={handleExternalUrlChange}
          />
          <label
            htmlFor="floating_externalUrl"
            className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            External Url (optional)
          </label>
        </div>
        <textarea
          id="description"
          rows={4}
          className="block p-2.5 w-full text-sm rounded-lg border bg-white border-gray-300 placeholder-gray-400 text-black scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 focus:outline-none"
          placeholder="Write a description..."
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
    </div>
  );
};
