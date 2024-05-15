import { Button, Stack } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { EditorOptions } from "@tiptap/core";
import {
  LinkBubbleMenu,
  RichTextEditor,
  RichTextEditorRef,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
} from "mui-tiptap";
import { FC, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import EditorMenuControls from "../components/info/EditorMenuControls";
import useExtensions from "../hooks/useExtensions";
import { useLogin } from "../hooks/useLogin";
import { saveAdditionalInfo } from "../utils/cloudFunctions";
import { uploadImage } from "../utils/functions";
interface InfoSectionProps {
  poolId: string;
  poolCreator: string;
  content: string;
}
export const InfoSection: FC<InfoSectionProps> = ({
  poolCreator,
  content,
  poolId,
}) => {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const { handleLogin } = useLogin();
  const rteRef = useRef<RichTextEditorRef>(null);
  const extensions = useExtensions({
    placeholder: "Add your own content here...",
  });

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

  const handlePublish = useCallback(async () => {
    if (
      rteRef &&
      rteRef.current &&
      rteRef.current.editor &&
      poolId &&
      !loading &&
      publicKey &&
      signMessage
    ) {
      try {
        setLoading(true);
        await handleLogin(publicKey, signMessage);
        await saveAdditionalInfo(poolId, rteRef.current.editor.getHTML());
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setIsEditable(false);
        setLoading(false);
      }
    }
  }, [rteRef, poolId, loading, publicKey, signMessage]);

  return (
    <div className="flex flex-col items-start w-full gap-4">
      <div className="flex w-full gap-2 justify-between items-center">
        <span className="text-base text-gray-400">Project Info</span>
        {publicKey?.toBase58() == poolCreator && (
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={
              "text-white rounded px-2 py-1 text-xs md:text-sm" +
              (isEditable ? " bg-red-600" : " bg-blue-600")
            }
          >
            <span>{isEditable ? "Close" : "Edit Info"}</span>
          </button>
        )}
      </div>
      <div className={`flex flex-col gap-2 w-full rounded`}>
        {isEditable ? (
          <RichTextEditor
            ref={rteRef}
            extensions={extensions} // Or any Tiptap extensions you wish!
            content={content} // Initial content for the editor
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
                    Publish
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
          <RichTextReadOnly content={content} extensions={extensions} />
        )}
      </div>
    </div>
  );
};
