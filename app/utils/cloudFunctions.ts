import { getFunctions, httpsCallable } from "firebase/functions";
import { IComment, IReply, UpdateMarketDataArgs } from "./types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { setDoc, doc, deleteDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

export async function getCurrentPrice(): Promise<{
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
  };
  success: boolean;
}> {
  const getPrice = httpsCallable(getFunctions(), "getPrice");
  return (
    await getPrice({ address: "So11111111111111111111111111111111111111112" })
  ).data as {
    data: {
      value: number;
      updateUnixTime: number;
      updateHumanTime: string;
    };
    success: boolean;
  };
}

export async function updateMarketData(payload: UpdateMarketDataArgs) {
  const updateMarket = httpsCallable(getFunctions(), "updateMarketDetails");
  await updateMarket(payload);
}

export async function verifyAndGetToken(
  publicKey: PublicKey,
  output: Uint8Array
) {
  const verifyResponse = httpsCallable(getFunctions(), "verifySignIn");
  return (
    await verifyResponse({
      signature: bs58.encode(output),
      publicKey: publicKey.toBase58(),
    })
  ).data as string;
}

export async function mintNft(publicKey: PublicKey) {
  const mintNftFn = httpsCallable(getFunctions(), "mintNft");
  const { tx, mint } = (await mintNftFn()).data as {
    tx: string;
    mint: string;
  };
  return { tx, mint };
}

export async function linkAsset(asset: DasApiAsset) {
  const linkAssetFn = httpsCallable(getFunctions(), "linkAsset");
  await linkAssetFn({ nft: asset });
}

export async function unlinkAsset() {
  const unlinkAsset = httpsCallable(getFunctions(), "unlinkAsset");
  await unlinkAsset();
}

//comments section
export const handleAddComment = async (
  poolId: string,
  newComment: IComment
) => {
  await setDoc(doc(db, `Pool/${poolId}/Comments/${newComment.id}`), newComment);
};

export const handleReplyComment = async (
  poolId: string,
  newReply: IReply,
  commentId: string
) => {
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}`),
    { numReplies: increment(1) },
    { merge: true }
  );
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}/Replies/${newReply.id}`),
    newReply
  );
};

export const handleUpdateComment = async (
  poolId: string,
  updatedCommentContent: string,
  commentId: string
) => {
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}`),
    { content: updatedCommentContent },
    { merge: true }
  );
};

export const handleDeleteComment = async (
  poolId: string,
  commentId: string
) => {
  await deleteDoc(doc(db, `Pool/${poolId}/Comments/${commentId}`));
};

export const handleUpdateCommentVote = async (
  poolId: string,
  commentId: string,
  operation: string
) => {
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}`),
    { score: increment(operation == "add" ? 1 : -1) },
    { merge: true }
  );
};

export const handleUpdateReply = async (
  poolId: string,
  updatedReplyContent: string,
  commentId: string,
  replyId: string
) => {
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}/Replies/${replyId}`),
    { content: updatedReplyContent },
    { merge: true }
  );
};

export const handleDeleteReply = async (
  poolId: string,
  commentId: string,
  replyId: string
) => {
  await deleteDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}/Replies/${replyId}`)
  );
};

export const handleUpdateReplyVote = async (
  poolId: string,
  commentId: string,
  replyId: string,
  operation: string
) => {
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}/Replies/${replyId}`),
    { score: increment(operation == "add" ? 1 : -1) },
    { merge: true }
  );
};
