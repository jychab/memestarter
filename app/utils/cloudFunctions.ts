import { getFunctions, httpsCallable } from "firebase/functions";
import { DAS, IComment, IReply, UpdateMarketDataArgs } from "./types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import {
  setDoc,
  doc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import { NATIVE_MINT } from "@solana/spl-token";

export async function getCurrentPrice(): Promise<{
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
  };
  success: boolean;
}> {
  const getPrice = httpsCallable(getFunctions(), "getPrice");
  return (await getPrice({ address: NATIVE_MINT.toBase58() })).data as {
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

export async function linkAsset(asset: DAS.GetAssetResponse) {
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
  const addComment = httpsCallable(getFunctions(), "handleCommentsAndReplies");
  await addComment({ poolId, newComment, method: "handleAddComment" });
};

export const handleReplyComment = async (
  poolId: string,
  newReply: IReply,
  commentId: string
) => {
  const replyComment = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await replyComment({
    poolId,
    newReply,
    commentId,
    method: "handleReplyComment",
  });
};

export const handleUpdateComment = async (
  poolId: string,
  updatedCommentContent: string,
  commentId: string
) => {
  const updateComment = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await updateComment({
    poolId,
    updatedCommentContent,
    commentId,
    method: "handleUpdateComment",
  });
};

export const handleUpdatePinComment = async (
  poolId: string,
  commentId: string,
  pin: boolean
) => {
  const updatePinComment = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await updatePinComment({
    poolId,
    commentId,
    pin,
    method: "handleUpdatePinComment",
  });
};

export const handleDeleteComment = async (
  poolId: string,
  commentId: string
) => {
  const deleteComment = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await deleteComment({ poolId, commentId, method: "handleDeleteComment" });
};

export const handleUpdateCommentVote = async (
  poolId: string,
  commentId: string,
  operation: string,
  buttonType: string
) => {
  const updateCommentVote = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await updateCommentVote({
    poolId,
    commentId,
    operation,
    buttonType,
    method: "handleUpdateCommentVote",
  });
};

export const handleUpdateReply = async (
  poolId: string,
  updatedReplyContent: string,
  commentId: string,
  replyId: string
) => {
  const updateReply = httpsCallable(getFunctions(), "handleCommentsAndReplies");
  await updateReply({
    poolId,
    updatedReplyContent,
    commentId,
    replyId,
    method: "handleUpdateReply",
  });
};

export const handleDeleteReply = async (
  poolId: string,
  commentId: string,
  replyId: string
) => {
  const deleteReply = httpsCallable(getFunctions(), "handleCommentsAndReplies");
  await deleteReply({
    poolId,
    commentId,
    replyId,
    method: "handleDeleteReply",
  });
};

export const handleUpdateReplyVote = async (
  poolId: string,
  commentId: string,
  replyId: string,
  operation: string,
  buttonType: string
) => {
  const updateReplyVote = httpsCallable(
    getFunctions(),
    "handleCommentsAndReplies"
  );
  await updateReplyVote({
    poolId,
    commentId,
    replyId,
    operation,
    buttonType,
    method: "handleUpdateReplyVote",
  });
};
