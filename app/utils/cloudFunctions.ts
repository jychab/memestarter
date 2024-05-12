import { httpsCallable } from "firebase/functions";
import { DAS, IComment, IReply, UpdateMarketDataArgs } from "./types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { functions } from "./firebase";

export async function getCurrentPrice(address: string): Promise<{
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
  };
  success: boolean;
}> {
  const getPrice = httpsCallable(functions, "getPrice");
  return (await getPrice({ address: address })).data as {
    data: {
      value: number;
      updateUnixTime: number;
      updateHumanTime: string;
    };
    success: boolean;
  };
}

export async function updateMarketData(payload: UpdateMarketDataArgs) {
  const updateMarket = httpsCallable(functions, "updateMarketDetails");
  await updateMarket(payload);
}

export async function verifyAndGetToken(
  publicKey: PublicKey,
  output: Uint8Array
) {
  const verifyResponse = httpsCallable(functions, "verifySignIn");
  return (
    await verifyResponse({
      signature: bs58.encode(output),
      publicKey: publicKey.toBase58(),
    })
  ).data as string;
}

export async function linkAsset(asset: DAS.GetAssetResponse) {
  const linkAssetFn = httpsCallable(functions, "linkAsset");
  await linkAssetFn({ nft: asset });
}

export async function unlinkAsset() {
  const unlinkAsset = httpsCallable(functions, "unlinkAsset");
  await unlinkAsset();
}

export async function saveAdditionalInfo(poolId: string, content: string) {
  const saveAdditionalInfo = httpsCallable(functions, "saveAdditionalInfo");
  await saveAdditionalInfo({
    poolId,
    content,
  });
}

//comments section
export const handleAddComment = async (
  poolId: string,
  newComment: IComment
) => {
  const addComment = httpsCallable(functions, "handleCommentsAndReplies");
  await addComment({ poolId, newComment, method: "handleAddComment" });
};

export const handleReplyComment = async (
  poolId: string,
  newReply: IReply,
  commentId: string
) => {
  const replyComment = httpsCallable(functions, "handleCommentsAndReplies");
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
  const updateComment = httpsCallable(functions, "handleCommentsAndReplies");
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
  const updatePinComment = httpsCallable(functions, "handleCommentsAndReplies");
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
  const deleteComment = httpsCallable(functions, "handleCommentsAndReplies");
  await deleteComment({ poolId, commentId, method: "handleDeleteComment" });
};

export const handleUpdateCommentVote = async (
  poolId: string,
  commentId: string,
  operation: string,
  buttonType: string
) => {
  const updateCommentVote = httpsCallable(
    functions,
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
  const updateReply = httpsCallable(functions, "handleCommentsAndReplies");
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
  const deleteReply = httpsCallable(functions, "handleCommentsAndReplies");
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
  const updateReplyVote = httpsCallable(functions, "handleCommentsAndReplies");
  await updateReplyVote({
    poolId,
    commentId,
    replyId,
    operation,
    buttonType,
    method: "handleUpdateReplyVote",
  });
};
