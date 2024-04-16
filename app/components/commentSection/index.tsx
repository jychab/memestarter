import { FC, useEffect, useState } from "react";
import InputComment from "./InputComment";
import Comment from "./Comment";
import { IUser, IComment, IReply } from "../../utils/types";
import { PublicKey } from "@solana/web3.js";
import {
  collection,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

interface CommentsSectionProps {
  poolId: string;
  poolCreator: string;
  publicKey: PublicKey | null;
  image?: string;
}
export const CommentsSection: FC<CommentsSectionProps> = ({
  poolId,
  poolCreator,
  publicKey,
  image = "",
}) => {
  const [currentUser, setCurrentUser] = useState<IUser>({
    image: image,
    username: publicKey ? publicKey.toBase58() : "Anon",
  } as IUser);
  const [comments, setComments] = useState<IComment[]>([]);

  useEffect(() => {
    setCurrentUser({
      image: image,
      username: publicKey ? publicKey.toBase58() : "Anon",
    } as IUser);
  }, [publicKey, image]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, `Pool/${poolId}/Comments`),
        orderBy("score", "desc")
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
            currentUser={currentUser}
            comment={value}
            poolCreator={poolCreator}
          />
        );
      })}
      {publicKey && (
        <InputComment currentUser={currentUser} action="send" poolId={poolId} />
      )}
    </main>
  );
};
