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
  publicKey: string,
  poolId: string,
  commentId: string,
  operation: string,
  buttonType: string
) => {
  const scoreRecord =
    buttonType == "positive"
      ? {
          positiveScoreRecord:
            operation == "add" ? arrayUnion(publicKey) : arrayRemove(publicKey),
        }
      : {
          negativeScoreRecord:
            operation == "add" ? arrayUnion(publicKey) : arrayRemove(publicKey),
        };
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}`),
    {
      score: increment(
        (operation == "add" && buttonType == "positive") ||
          (operation != "add" && buttonType != "positive")
          ? 1
          : -1
      ),
      ...scoreRecord,
    },
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
  publicKey: string,
  poolId: string,
  commentId: string,
  replyId: string,
  operation: string,
  buttonType: string
) => {
  const scoreRecord =
    buttonType == "positive"
      ? {
          positiveScoreRecord:
            operation == "add" ? arrayUnion(publicKey) : arrayRemove(publicKey),
        }
      : {
          negativeScoreRecord:
            operation == "add" ? arrayUnion(publicKey) : arrayRemove(publicKey),
        };
  await setDoc(
    doc(db, `Pool/${poolId}/Comments/${commentId}/Replies/${replyId}`),
    {
      score: increment(
        (operation == "add" && buttonType == "positive") ||
          (operation != "add" && buttonType != "positive")
          ? 1
          : -1
      ),
      ...scoreRecord,
    },
    { merge: true }
  );
};
