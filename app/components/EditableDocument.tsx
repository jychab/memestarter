import { Delete, Edit } from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { NATIVE_MINT } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { EditorOptions } from "@tiptap/core";
import {
  LinkBubbleMenu,
  RichTextEditor,
  RichTextEditorRef,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
} from "mui-tiptap";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useExtensions from "../hooks/useExtensions";
import { useLogin } from "../hooks/useLogin";
import {
  removeInfo,
  removeReward,
  saveInfo,
  saveReward,
} from "../utils/cloudFunctions";
import { uploadImage } from "../utils/functions";
import { PoolType, Reward, Status } from "../utils/types";
import { Chip } from "./Chip";
import EditorMenuControls from "./info/EditorMenuControls";
interface EditableDocumentProps {
  pool: PoolType;
  status: Status;
  reward?: Reward;
  title?: string;
  titleStyle?: string;
  showEditButton?: boolean;
  editableOnInit?: boolean;
  onCancelCallback?: () => void;
}
export const EditableDocument: FC<EditableDocumentProps> = ({
  pool,
  status,
  reward,
  title,
  titleStyle,
  showEditButton = true,
  editableOnInit = false,
  onCancelCallback,
}) => {
  const { publicKey, signMessage } = useWallet();
  const [mainTitle, setMainTitle] = useState("");
  const [price, setPrice] = useState(
    reward?.price ? (reward.price / LAMPORTS_PER_SOL).toString() : ""
  );
  const [quantity, setQuantity] = useState(reward?.quantity?.toString());
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(editableOnInit);
  const { handleLogin } = useLogin();
  const rteRef = useRef<RichTextEditorRef>(null);
  const extensions = useExtensions({
    placeholder: "Add your own content here...",
  });

  useEffect(() => {
    if (reward) {
      setMainTitle(
        isEditable && price
          ? `Pledge ${price} ${
              pool.quoteMint === NATIVE_MINT.toBase58() ? "SOL" : "USDC"
            }`
          : reward.title
      );
    } else if (title) {
      setMainTitle(title);
    }
  }, [price, isEditable, reward, title, pool]);

  function fileListToImageFiles(fileList: FileList): File[] {
    return Array.from(fileList).filter((file) => {
      const mimeType = (file.type || "").toLowerCase();
      return mimeType.startsWith("image/");
    });
  }

  const handleNewImageFiles = useCallback(
    async (files: File[], insertPosition?: number): Promise<void> => {
      if (!rteRef.current?.editor) {
        return;
      }

      const attributesForImageFiles = await Promise.all(
        files.map(async (file) => ({
          src: await uploadImage(file),
          alt: file.name,
        }))
      );

      insertImages({
        images: attributesForImageFiles,
        editor: rteRef.current.editor,
        position: insertPosition,
      });
    },
    []
  );

  // Allow for dropping images into the editor
  const handleDrop: NonNullable<EditorOptions["editorProps"]["handleDrop"]> =
    useCallback(
      (view, event, _slice, _moved) => {
        if (!(event instanceof DragEvent) || !event.dataTransfer) {
          return false;
        }

        const imageFiles = fileListToImageFiles(event.dataTransfer.files);
        if (imageFiles.length > 0) {
          const insertPosition = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;

          handleNewImageFiles(imageFiles, insertPosition);
          event.preventDefault();
          return true;
        }

        return false;
      },
      [handleNewImageFiles]
    );

  // Allow for pasting images
  const handlePaste: NonNullable<EditorOptions["editorProps"]["handlePaste"]> =
    useCallback(
      (_view, event, _slice) => {
        if (!event.clipboardData) {
          return false;
        }

        const pastedImageFiles = fileListToImageFiles(
          event.clipboardData.files
        );
        if (pastedImageFiles.length > 0) {
          handleNewImageFiles(pastedImageFiles);
          return true;
        }
        return false;
      },
      [handleNewImageFiles]
    );

  const handleDelete = useCallback(async () => {
    if (pool && !loading && publicKey && signMessage) {
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        if (reward) {
          await removeReward(pool.pool, reward.id);
        } else {
          await removeInfo(pool.pool);
        }
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setLoading(false);
      }
    }
  }, [pool, reward, loading, publicKey, signMessage, handleLogin]);
  const handlePublish = useCallback(async () => {
    if (
      rteRef &&
      rteRef.current &&
      rteRef.current.editor &&
      pool &&
      !loading &&
      publicKey &&
      signMessage
    ) {
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        if (reward) {
          if (price.length > 0) {
            await saveReward(
              pool.pool,
              reward.id,
              mainTitle,
              rteRef.current.editor.getHTML(),
              parseFloat(price) * LAMPORTS_PER_SOL,
              quantity ? parseInt(quantity) : undefined
            );
          }
        } else {
          await saveInfo(pool.pool, rteRef.current.editor.getHTML());
        }
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        if (onCancelCallback) {
          onCancelCallback();
        }
        setIsEditable(false);
        setLoading(false);
      }
    }
  }, [
    rteRef,
    price,
    mainTitle,
    pool,
    reward,
    quantity,
    loading,
    publicKey,
    signMessage,
    handleLogin,
    onCancelCallback,
  ]);

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="flex w-full gap-2 items-center">
        <span className={titleStyle}>{mainTitle}</span>
        {showEditButton &&
          !isEditable &&
          status != Status.Expired &&
          publicKey &&
          publicKey.toBase58() == pool.authority && (
            <div className="flex">
              <IconButton
                color="inherit"
                size="medium"
                onClick={() => setIsEditable(true)}
              >
                <Edit color="inherit" fontSize="inherit" />
              </IconButton>
              <IconButton
                color="inherit"
                size="medium"
                disableRipple
                onClick={handleDelete}
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
                <Delete color="inherit" fontSize="inherit" />
              </IconButton>
            </div>
          )}
      </div>
      <div className="flex gap-4 items-center">
        {reward && (
          <Chip
            k={`${reward.uniqueBackers} Backers`}
            textColor="text-blue-200"
            bgColor="bg-blue-600"
          />
        )}
        {reward && quantity && (
          <Chip
            k={`Limited (${
              parseInt(quantity) - reward.quantityBought
            } left of ${quantity})`}
            textColor="text-yellow-200"
            bgColor="bg-yellow-600"
          />
        )}
      </div>
      {reward && reward.price !== undefined && isEditable && (
        <div className="grid grid-cols-3 items-center gap-4 w-full max-w-96 overflow-auto scrollbar-none h-24">
          <span className="text-sm font-medium text-gray-400 col-span-1">
            Price:
          </span>
          <div className="flex col-span-2">
            <input
              type="number"
              id="price"
              className="rounded-none rounded-s-lg w-12 text-center leading-none text-sm p-2 border border-gray-300 text-black"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <label
              htmlFor="price"
              className="border-s-0 inline-flex w-14 items-center justify-center p-2 text-sm font-medium text-center border rounded-e-lg focus:outline-none text-black border-gray-300"
            >
              Sol
            </label>
          </div>
          <span className="text-sm font-medium text-gray-400 col-span-1">
            Limited Quantity:
          </span>
          <div className="flex items-center gap-4 col-span-2">
            {quantity !== undefined && (
              <div className="flex">
                <input
                  type="number"
                  id="quantity"
                  placeholder="Enter Quantity"
                  className="rounded w-32 text-center leading-none text-sm p-2 border border-gray-300 text-black"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            )}
            <label className="w-fit items-center cursor-pointer">
              <input
                id="quantity-checkbox"
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={quantity !== undefined}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setQuantity(undefined);
                  } else {
                    setQuantity("");
                  }
                }}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>
      )}

      {isEditable ? (
        <RichTextEditor
          ref={rteRef}
          extensions={extensions} // Or any Tiptap extensions you wish!
          content={reward ? reward.content : pool.additionalInfo} // Initial content for the editor
          editorProps={{
            handleDrop: handleDrop,
            handlePaste: handlePaste,
          }}
          renderControls={() => <EditorMenuControls />}
          RichTextFieldProps={{
            footer: (
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
                  onClick={() => {
                    setIsEditable(false);
                    if (onCancelCallback) {
                      onCancelCallback();
                    }
                  }}
                >
                  Close
                </Button>
                <Button
                  className="flex gap-2"
                  variant="contained"
                  size="small"
                  onClick={handlePublish}
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
            ),
          }}
        >
          {() => (
            <>
              <LinkBubbleMenu />
              <TableBubbleMenu />
            </>
          )}
        </RichTextEditor>
      ) : (
        <RichTextReadOnly
          content={reward ? reward.content : pool.additionalInfo}
          extensions={extensions}
        />
      )}
    </div>
  );
};
