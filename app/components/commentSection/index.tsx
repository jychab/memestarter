import { FC, useEffect, useState } from "react";
import InputComment from "./InputComment";
import Comment from "./Comment";
import { IUser, IComment, IReply } from "../../utils/types";
import { PublicKey } from "@solana/web3.js";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { getMetadata } from "../../utils/helper";
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
  }, [poolId]);

  return (
    <main className="flex flex-col w-full gap-2 relative">
      {comments?.map((value: IComment) => {
        return (
          <Comment
            key={value.id}
            poolId={poolId}
            currentUser={{ publicKey: publicKey?.toBase58() }}
            comment={value}
            poolCreator={poolCreator}
          />
        );
      })}
      {publicKey && (
        <InputComment
          currentUser={{ publicKey: publicKey?.toBase58() }}
          action="send"
          poolId={poolId}
        />
      )}
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