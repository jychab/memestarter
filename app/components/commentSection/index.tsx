import { FC, useEffect, useState } from "react";
import InputComment from "./InputComment";
import Comment from "./Comment";
import { IComment } from "../../utils/types";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useWallet } from "@solana/wallet-adapter-react";

interface CommentsSectionProps {
  poolId: string;
  poolCreator: string;
}
export const CommentsSection: FC<CommentsSectionProps> = ({
  poolId,
  poolCreator,
}) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [numComments, setNumComments] = useState<number>(0);
  const [maxComments, setMaxComments] = useState(10);
  const { publicKey } = useWallet();

  useEffect(() => {
    const coll = collection(db, `Pool/${poolId}/Comments`);
    getCountFromServer(coll).then((result) =>
      setNumComments(result.data().count)
    );
    const unsubscribe = onSnapshot(
      query(
        collection(db, `Pool/${poolId}/Comments`),
        orderBy("score", "desc"),
        orderBy("createdAt", "desc"),
        limit(maxComments)
      ),
      (querySnapshot) => {
        setComments(querySnapshot.docs.map((doc) => doc.data() as IComment));
      }
    );
    return () => unsubscribe();
  }, [poolId, maxComments]);

  return (
    <main className="flex flex-col w-full gap-2 relative">
      {(publicKey != null || (comments && comments.length > 0)) && (
        <span className="text-gray-400 text-base">Comments</span>
      )}
      {comments.map((value: IComment) => {
        return (
          <Comment
            key={value.id}
            poolId={poolId}
            currentUser={publicKey?.toBase58()}
            comment={value}
            poolCreator={poolCreator}
          />
        );
      })}
      {publicKey && <InputComment action="send" poolId={poolId} />}
      {maxComments < numComments && (
        <button
          onClick={() => setMaxComments(maxComments + 10)}
          className="ml-8 pl-8 flex items-start"
        >
          <span className="text-blue-600 font-medium text-xs">{`Show more`}</span>
        </button>
      )}
    </main>
  );
};
