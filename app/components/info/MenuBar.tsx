import { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { LinkUrlBtn } from "./LinkUrlBtn";
import { ImageUrlBtn } from "./ImageUrlBtn";

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="grid grid-cols-3 divide-solid divide-x border rounded border-gray-300">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "bg-gray-400" : "" + " hover:bg-gray-300"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 7V11H13C14.1046 11 15 10.1046 15 9C15 7.89543 14.1046 7 13 7H9ZM15.9365 11.7161C16.5966 11.0028 17 10.0485 17 9C17 6.79086 15.2091 5 13 5H8.5C7.67157 5 7 5.67157 7 6.5V12V18.5C7 19.3284 7.67157 20 8.5 20H13.5C15.9853 20 18 17.9853 18 15.5C18 13.9126 17.178 12.5171 15.9365 11.7161ZM13 13H9V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H13Z"
              fill="#000000"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic")
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M8 6C8 5.44772 8.44772 5 9 5H12H15C15.5523 5 16 5.44772 16 6C16 6.55228 15.5523 7 15 7H12.8579L11.1656 18H13C13.5523 18 14 18.4477 14 19C14 19.5523 13.5523 20 13 20H10H7C6.44772 20 6 19.5523 6 19C6 18.4477 6.44772 18 7 18H9.14208L10.8344 7H9C8.44772 7 8 6.55228 8 6Z"
              fill="#000000"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike")
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
          >
            <rect x="5.77" y="12.17" width="12.46" height="1.09" />
            <path d="M16.7,13.65H12.89c.59.34,1,.6,1.18.74a3.39,3.39,0,0,1,1,1.07,2.38,2.38,0,0,1,.31,1.14,2.3,2.3,0,0,1-.82,1.76,3.18,3.18,0,0,1-2.22.74,4.7,4.7,0,0,1-2.23-.54A3.77,3.77,0,0,1,8.56,17.2a7.41,7.41,0,0,1-.79-2.46H7.36V20h.41a1.35,1.35,0,0,1,.24-.7.59.59,0,0,1,.44-.17,6.5,6.5,0,0,1,1.39.35,12.63,12.63,0,0,0,1.45.41,7.26,7.26,0,0,0,1.25.1A4.87,4.87,0,0,0,16,18.72a4,4,0,0,0,1.34-3A3.8,3.8,0,0,0,16.92,14C16.86,13.87,16.78,13.77,16.7,13.65Z" />
            <path d="M8.89,11.21c.21.17.49.36.81.57h4.87c-.48-.29-1.07-.62-1.76-1A12.49,12.49,0,0,1,9.48,8.54,1.93,1.93,0,0,1,9,7.26a2.18,2.18,0,0,1,.77-1.63,2.72,2.72,0,0,1,1.93-.71,4.14,4.14,0,0,1,2,.53,3.78,3.78,0,0,1,1.49,1.43,6.6,6.6,0,0,1,.73,2.42h.41V4h-.41a1.39,1.39,0,0,1-.3.7.67.67,0,0,1-.48.17,2.64,2.64,0,0,1-.89-.28A6.45,6.45,0,0,0,11.68,4,4.49,4.49,0,0,0,8.47,5.21,3.75,3.75,0,0,0,7.21,8a3.57,3.57,0,0,0,.43,1.73A4.72,4.72,0,0,0,8.89,11.21Z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 divide-solid divide-x text-sm px-0.5 gap-2 text-center border rounded items-center justify-center border-gray-300">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300"
          }
        >
          <span className="text-center">h1</span>
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300 "
          }
        >
          <span className="text-center">h2</span>
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300"
          }
        >
          <span>h3</span>
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 })
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300"
          }
        >
          <span>h4</span>
        </button>
      </div>

      <div className="grid grid-cols-3 divide-solid divide-x border rounded border-gray-300">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList")
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300 flex items-center justify-center"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            width="16px"
            height="16px"
            viewBox="0 0 1920 1920"
          >
            <path
              d="M559.706 1575.941h1360v-120h-1360v120Zm0-1121h1360v-120h-1360v120Zm0 561h1360v-120h-1360v120ZM169.5 565C75.888 565 0 489.112 0 395.5S75.888 226 169.5 226 339 301.888 339 395.5 263.112 565 169.5 565Zm0-84c47.22 0 85.5-38.28 85.5-85.5S216.72 310 169.5 310 84 348.28 84 395.5s38.28 85.5 85.5 85.5Zm0 1208C75.888 1689 0 1613.112 0 1519.5S75.888 1350 169.5 1350 339 1425.888 339 1519.5 263.112 1689 169.5 1689Zm0-84c47.22 0 85.5-38.279 85.5-85.5s-38.28-85.5-85.5-85.5-85.5 38.279-85.5 85.5 38.28 85.5 85.5 85.5Zm0-478C75.888 1127 0 1051.112 0 957.5S75.888 788 169.5 788 339 863.888 339 957.5 263.112 1127 169.5 1127Zm0-84c47.22 0 85.5-38.279 85.5-85.5 0-47.22-38.28-85.5-85.5-85.5S84 910.28 84 957.5c0 47.221 38.28 85.5 85.5 85.5Z"
              fillRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList")
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300 flex items-center justify-center"
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
              d="M5.99999 5.5C5.99999 5.22386 5.77613 5 5.49999 5C5.22385 5 4.99999 5.22386 4.99999 5.5V8.5C4.99999 8.77614 5.22385 9 5.49999 9C5.77613 9 5.99999 8.77614 5.99999 8.5V5.5ZM5.25046 11.2673C5.38308 11.1789 5.55766 11.1864 5.68212 11.286C5.85245 11.4223 5.86653 11.6764 5.71228 11.8306L4.39644 13.1464C4.25344 13.2894 4.21066 13.5045 4.28805 13.6913C4.36544 13.8782 4.54776 14 4.74999 14H6.49999C6.77613 14 6.99999 13.7761 6.99999 13.5C6.99999 13.2239 6.77613 13 6.49999 13H5.9571L6.41939 12.5377C6.99508 11.962 6.94256 11.0137 6.30681 10.5051C5.8423 10.1335 5.19072 10.1053 4.69576 10.4352L4.47264 10.584C4.24288 10.7372 4.18079 11.0476 4.33397 11.2773C4.48714 11.5071 4.79758 11.5692 5.02734 11.416L5.25046 11.2673ZM4.74999 15.5C4.47385 15.5 4.24999 15.7239 4.24999 16C4.24999 16.2761 4.47385 16.5 4.74999 16.5H5.29288L4.64644 17.1464C4.50344 17.2894 4.46066 17.5045 4.53805 17.6913C4.61544 17.8782 4.79776 18 4.99999 18H5.74999C5.88806 18 5.99999 18.1119 5.99999 18.25C5.99999 18.3881 5.88806 18.5 5.74999 18.5H4.74999C4.47385 18.5 4.24999 18.7239 4.24999 19C4.24999 19.2761 4.47385 19.5 4.74999 19.5H5.74999C6.44035 19.5 6.99999 18.9404 6.99999 18.25C6.99999 17.6972 6.6412 17.2283 6.1438 17.0633L6.85355 16.3536C6.99654 16.2106 7.03932 15.9955 6.96193 15.8087C6.88454 15.6218 6.70222 15.5 6.49999 15.5H4.74999ZM8.99999 6C8.44771 6 7.99999 6.44772 7.99999 7C7.99999 7.55228 8.44771 8 8.99999 8H19C19.5523 8 20 7.55228 20 7C20 6.44772 19.5523 6 19 6H8.99999ZM8.99999 11C8.44771 11 7.99999 11.4477 7.99999 12C7.99999 12.5523 8.44771 13 8.99999 13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H8.99999ZM8.99999 16C8.44771 16 7.99999 16.4477 7.99999 17C7.99999 17.5523 8.44771 18 8.99999 18H19C19.5523 18 20 17.5523 20 17C20 16.4477 19.5523 16 19 16H8.99999Z"
              fill="#000000"
            />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={
            editor.isActive("blockquote")
              ? "bg-gray-400"
              : "" + " hover:bg-gray-300 flex items-center justify-center"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
            width="24px"
            height="24px"
            viewBox="0 0 36 36"
            version="1.1"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M11.86,16.55a4.31,4.31,0,0,0-2.11.56,14.44,14.44,0,0,1,4.36-6,1.1,1.1,0,0,0-1.4-1.7c-4,3.25-5.78,7.75-5.78,10.54A5.08,5.08,0,0,0,10,24.58a4.4,4.4,0,0,0,1.88.44,4.24,4.24,0,1,0,0-8.47Z"
              className="clr-i-outline clr-i-outline-path-1"
            />
            <path
              d="M23,16.55a4.29,4.29,0,0,0-2.11.56,14.5,14.5,0,0,1,4.35-6,1.1,1.1,0,1,0-1.39-1.7c-4,3.25-5.78,7.75-5.78,10.54a5.08,5.08,0,0,0,3,4.61A4.37,4.37,0,0,0,23,25a4.24,4.24,0,1,0,0-8.47Z"
              className="clr-i-outline clr-i-outline-path-2"
            />
            <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 divide-solid divide-x border rounded border-gray-300">
        <ImageUrlBtn editor={editor} />
        <LinkUrlBtn editor={editor} />
      </div>
    </div>
  );
};
