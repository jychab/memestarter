import React, { FC } from "react";
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
  decimals: number;
  setDecimals: React.Dispatch<React.SetStateAction<number>>;
  supply: string;
  setSupply: React.Dispatch<React.SetStateAction<string>>;
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
  decimals,
  setDecimals,
  supply,
  setSupply,
}) => {
  return (
    <div className="animate-fade-right flex flex-col p-4 lg:flex-row lg:gap-x-16 gap-4">
      <div className="relative w-48 h-48 rounded-md overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`cursor-pointer flex flex-col w-48 h-48 justify-center items-center border-2rounded-lg hover:bg-bray-800 bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600`}
          >
            {tempImageUrl ? (
              <Image
                src={tempImageUrl}
                width={0}
                height={0}
                sizes="100vw"
                alt="Selected"
                className="object-cover w-48 h-auto"
                quality={100}
              />
            ) : (
              <div className="flex flex-col w-full h-full items-center justify-center">
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
      </div>
      <div className="flex flex-col gap-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative z-0 w-full group">
            <input
              type="text"
              maxLength={32}
              name="floating_name"
              id="floating_name"
              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-white border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
              className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-white border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            maxLength={10}
            name="floating_externalUrl"
            id="floating_externalUrl"
            className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-white border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
          className="block p-2.5 w-full text-sm rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 focus:outline-none"
          placeholder="Write a description..."
          value={description}
          onChange={handleDescriptionChange}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-2 items-center">
            <label
              htmlFor="decimal-input"
              className="block text-sm font-medium text-gray-400"
            >
              Decimals:
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="decimal-input"
              className="w-16 text-center text-sm block p-1 bg-gray-800/30 rounded border-b border-gray-500  placeholder-gray-400 text-white focus:outline-none"
              placeholder={decimals.toString()}
              value={decimals}
              onChange={(e) => {
                if (e.target.value) {
                  setDecimals(parseInt(e.target.value));
                } else {
                  setDecimals(NaN);
                }
              }}
              required
            />
          </div>
          <div className="flex gap-2 items-center">
            <label
              htmlFor="supply-input"
              className="block text-sm font-medium text-gray-400"
            >
              Supply:
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="supply-input"
              className="w-44 text-center text-sm block p-1 bg-gray-800/30 rounded border-b border-gray-500  placeholder-gray-400 text-white focus:outline-none"
              placeholder={supply.toString()}
              value={separateNumberWithComma(supply.replaceAll(",", ""))}
              onChange={(e) => {
                const amount = e.target.value.replaceAll(",", "");
                console.log(amount);
                if (!amount || amount.match(/^\d+$/)) {
                  setSupply(e.target.value);
                }
              }}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};
