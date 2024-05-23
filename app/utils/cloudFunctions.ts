import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { DAS, IComment, IReply, UpdateMarketDataArgs } from "./types";

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
  const linkAssetFn = httpsCallable(functions, "saveAsset");
  await linkAssetFn({ nft: asset });
}

export async function unlinkAsset() {
  const unlinkAsset = httpsCallable(functions, "saveAsset");
  await unlinkAsset({ delete: true });
}

export async function saveInfo(poolId: string, content: string) {
  const saveInfo = httpsCallable(functions, "saveInfo");
  await saveInfo({
    poolId,
    content,
  });
}

export async function removeInfo(poolId: string) {
  const removeInfo = httpsCallable(functions, "saveInfo");
  await removeInfo({
    poolId,
    delete: true,
  });
}

export async function purchaseReward(
  mintId: string,
  poolId: string,
  rewardId: string,
  txId: string,
  amount: number,
  quantity?: number
) {
  const purchaseReward = httpsCallable(functions, "purchaseReward");
  await purchaseReward({
    mintId,
    poolId,
    rewardId,
    txId,
    amount,
    quantity,
  });
}

export async function saveReward(
  poolId: string,
  rewardId: string,
  title: string,
  content: string,
  price?: number,
  quantity?: number,
  delivery?: {
    countries: string[];
    estimatedDate: number;
  }
) {
  const saveReward = httpsCallable(functions, "saveReward");
  await saveReward({
    poolId,
    rewardId,
    title,
    content,
    delivery,
    price,
    quantity,
  });
}

export async function removeReward(poolId: string, rewardId: string) {
  const removeReward = httpsCallable(functions, "saveReward");
  await removeReward({
    poolId,
    rewardId,
    delete: true,
  });
}

export async function saveThumbnail(
  poolId: string,
  imageUrl: string,
  title: string,
  description: string
) {
  const saveThumbnail = httpsCallable(functions, "saveThumbnail");
  await saveThumbnail({
    poolId,
    imageUrl,
    title,
    description,
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
