import { Edit } from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState } from "react";
import { toast } from "react-toastify";
import CardItem from "../components/CardItem";
import { useLogin } from "../hooks/useLogin";
import { saveThumbnail } from "../utils/cloudFunctions";
import { uploadImage } from "../utils/functions";
import { PoolType, Status } from "../utils/types";

interface ThumbnailSectionProps {
  pool: PoolType;
  status: Status;
}
export const ThumbnailSection: FC<ThumbnailSectionProps> = ({
  pool,
  status,
}) => {
  const { publicKey, signMessage } = useWallet();
  const { handleLogin } = useLogin();
  const [isEditable, setIsEditable] = useState(false);
  const [picture, setPicture] = useState<File>();
  const [tempImageUrl, setTempImageUrl] = useState<string>();
  const [title, setTitle] = useState<string>(pool.thumbnail.title);
  const [description, setDescription] = useState<string>(
    pool.thumbnail.description
  );
  const [loading, setLoading] = useState(false);

  const handlePictureChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile !== undefined) {
      setPicture(selectedFile);
      setTempImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = useCallback(async () => {
    if (pool && !loading && publicKey && signMessage) {
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        const imageUrl = picture
          ? await uploadImage(picture)
          : pool.thumbnail.imageUrl;

        await saveThumbnail(
          pool.pool,
          imageUrl,
          title ? title : pool.thumbnail.title,
          description ? description : pool.thumbnail.description
        );
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setIsEditable(false);
        setLoading(false);
      }
    }
  }, [pool, title, description, picture, loading, publicKey, signMessage]);
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="flex w-full gap-2 items-center">
        <span className="text-base md:text-lg text-gray-400">Thumbnail</span>
        {!isEditable &&
          status != Status.Expired &&
          publicKey &&
          publicKey.toBase58() == pool.authority && (
            <IconButton
              color="inherit"
              size="medium"
              onClick={() => setIsEditable(true)}
            >
              <Edit color="inherit" fontSize="inherit" />
            </IconButton>
          )}
      </div>
      <div
        className={`flex flex-col rounded w-full ${
          isEditable ? "border border-gray-300" : ""
        }`}
      >
        <div className={`flex flex-col md:flex-row items-center gap-4 p-4`}>
          <div className="w-72">
            <CardItem
              pool={pool}
              timer={Date.now()}
              disabled={true}
              imageUrl={isEditable ? tempImageUrl : undefined}
              title={isEditable ? title : undefined}
              description={isEditable ? description : undefined}
            />
          </div>
          {isEditable && (
            <div className="flex flex-col w-full md:w-1/2 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Image:</span>
                <label
                  htmlFor="dropzone-file"
                  className={`cursor-pointer relative flex gap-2 rounded px-2 justify-center items-center border bg-gray-100 hover:bg-gray-200 hover:border-gray-200`}
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                  <span className=" text-gray-400">Click to upload</span>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    name="dropzone-file"
                    onChange={handlePictureChange}
                  />
                </label>
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  maxLength={200}
                  name="title"
                  id="title"
                  className="block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none text-black border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  value={title}
                  placeholder={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label
                  htmlFor="title"
                  className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Title (Required)
                </label>
              </div>
              <textarea
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm rounded-lg border bg-white border-gray-300 placeholder-gray-400 text-black scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 focus:outline-none"
                placeholder="Write a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
        </div>
        {isEditable && (
          <Stack
            justifyContent="end"
            direction="row"
            spacing={2}
            sx={{
              borderTopStyle: "solid",
              borderTopWidth: 1,
              borderTopColor: (theme) => theme.palette.divider,
              py: 1,
              px: 1.5,
            }}
          >
            <Button
              color="error"
              variant="contained"
              size="small"
              onClick={() => setIsEditable(false)}
            >
              Close
            </Button>
            <Button
              className="flex gap-2"
              variant="contained"
              size="small"
              onClick={handleSave}
            >
              {loading && (
                <svg
                  className="inline w-4 h-4 animate-spin text-gray-600 fill-gray-300"
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
              Save
            </Button>
          </Stack>
        )}
      </div>
    </div>
  );
};
