import { Editor } from "@tiptap/react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

interface ImageUrlBtnProps {
  editor: Editor;
}

export const ImageUrlBtn: FC<ImageUrlBtnProps> = ({ editor }) => {
  const [url, setUrl] = useState("");
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const addImage = useCallback(() => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShow(false);
  }, [editor, url]);
  const handleClickOutside = <T extends HTMLElement>(
    event: MouseEvent,
    ref: React.RefObject<T>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShow(false);
    }
  };
  useEffect(() => {
    const handleClickOutsideSort = (event: MouseEvent) =>
      handleClickOutside(event, dropDownRef, setShow);
    if (show) {
      document.addEventListener("mousedown", handleClickOutsideSort);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSort);
    };
  }, [show]);
  return (
    <div className="relative">
      <div className="flex h-full w-full items-center justify-center">
        <button
          onClick={() => setShow(!show)}
          className={
            editor.isActive("image") ? "bg-gray-400" : "" + " hover:bg-gray-300"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M14.2639 15.9375L12.5958 14.2834C11.7909 13.4851 11.3884 13.086 10.9266 12.9401C10.5204 12.8118 10.0838 12.8165 9.68048 12.9536C9.22188 13.1095 8.82814 13.5172 8.04068 14.3326L4.04409 18.2801M14.2639 15.9375L14.6053 15.599C15.4112 14.7998 15.8141 14.4002 16.2765 14.2543C16.6831 14.126 17.12 14.1311 17.5236 14.2687C17.9824 14.4251 18.3761 14.8339 19.1634 15.6514L20 16.4934M14.2639 15.9375L18.275 19.9565M18.275 19.9565C17.9176 20 17.4543 20 16.8 20H7.2C6.07989 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4.12796 18.7313 4.07512 18.5321 4.04409 18.2801M18.275 19.9565C18.5293 19.9256 18.7301 19.8727 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V16.4934M4.04409 18.2801C4 17.9221 4 17.4575 4 16.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.07989 4 7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.4934M17 8.99989C17 10.1045 16.1046 10.9999 15 10.9999C13.8954 10.9999 13 10.1045 13 8.99989C13 7.89532 13.8954 6.99989 15 6.99989C16.1046 6.99989 17 7.89532 17 8.99989Z"
              stroke="#000000"
            />
          </svg>
        </button>
      </div>
      {show && (
        <div
          ref={dropDownRef}
          className="absolute z-20 bg-white border p-2 flex flex-col text-sm items-start gap-2 border-gray-300 rounded"
        >
          <label htmlFor="link_url">Add Image Url</label>
          <div className="flex gap-2 items-center">
            <input
              className="focus:outline-none border border-gray-300 p-2 w-64"
              id="link_url"
              type="url"
              placeholder="https://wwww.twitter.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-2 py-1 h-fit rounded"
              onClick={addImage}
            >
              <span>{`Add`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
