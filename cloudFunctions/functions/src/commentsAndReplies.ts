import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";
import {IComment, IReply, Pool} from "./utils/types";
import {FieldValue} from "firebase-admin/firestore";

interface HandleCommentsAndReplies
  extends HandleAddComment,
    HandleReplyComment,
    HandleUpdateComment,
    HandlePinnedComment,
    HandleReplyComment,
    HandleDeleteComment,
    HandleUpdateCommentVote,
    HandleUpdateReply,
    HandleUpdateReplyVote,
    HandleDeleteReply {
  method: string;
}

interface HandleAddComment {
  poolId: string;
  newComment: IComment;
}
interface HandleReplyComment {
  poolId: string;
  newReply: IReply;
  commentId: string;
}
interface HandleUpdateComment {
  poolId: string;
  updatedCommentContent: string;
  commentId: string;
}
interface HandlePinnedComment {
  poolId: string;
  commentId: string;
  pin: boolean;
}
interface HandleDeleteComment {
  poolId: string;
  commentId: string;
}
interface HandleUpdateCommentVote {
  poolId: string;
  commentId: string;
  operation: string;
  buttonType: string;
}
interface HandleUpdateReply {
  poolId: string;
  updatedReplyContent: string;
  commentId: string;
  replyId: string;
}
interface HandleDeleteReply {
  poolId: string;
  commentId: string;
  replyId: string;
}
interface HandleUpdateReplyVote {
  poolId: string;
  commentId: string;
  replyId: string;
  operation: string;
  buttonType: string;
}

export const handleCommentsAndReplies = async (
  data: HandleCommentsAndReplies,
  context: CallableContext
) => {
  switch (data.method) {
  case "handleAddComment":
    await handleAddComment(data, context);
    break;
  case "handleDeleteComment":
    await handleDeleteComment(data, context);
    break;
  case "handleUpdateComment":
    await handleUpdateComment(data, context);
    break;
  case "handleUpdateCommentVote":
    await handleUpdateCommentVote(data, context);
    break;
  case "handleUpdatePinComment":
    await handleUpdatePinComment(data, context);
    break;
  case "handleReplyComment":
    await handleReplyComment(data, context);
    break;
  case "handleDeleteReply":
    await handleDeleteReply(data, context);
    break;
  case "handleUpdateReply":
    await handleUpdateReply(data, context);
    break;
  case "handleUpdateReplyVote":
    await handleUpdateReplyVote(data, context);
    break;
  default:
    break;
  }
};

const handleAddComment = async (
  data: HandleAddComment,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db
    .doc(`Pool/${data.poolId}/Comments/${data.newComment.id}`)
    .create(data.newComment);
};

const handleReplyComment = async (
  data: HandleReplyComment,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db
    .doc(`Pool/${data.poolId}/Comments/${data.commentId}`)
    .set({numReplies: FieldValue.increment(1)}, {merge: true});
  await db
    .doc(
      `Pool/${data.poolId}/Comments/${data.commentId}/Replies/${data.newReply.id}`
    )
    .create(data.newReply);
};

const handleUpdateComment = async (
  data: HandleUpdateComment,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db
    .doc(`Pool/${data.poolId}/Comments/${data.commentId}`)
    .set({content: data.updatedCommentContent}, {merge: true});
};

const handleUpdatePinComment = async (
  data: HandlePinnedComment,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const pool = (await db.doc(`Pool/${data.poolId}`).get()).data() as Pool;
  if (pool.authority !== context.auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "Only the pool creator is allowed to call this function"
    );
  }
  await db
    .doc(`Pool/${data.poolId}/Comments/${data.commentId}`)
    .set({pinned: data.pin}, {merge: true});
};

const handleDeleteComment = async (
  data: HandleDeleteComment,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db.doc(`Pool/${data.poolId}/Comments/${data.commentId}`).delete();
};

const handleUpdateCommentVote = async (
  data: HandleUpdateCommentVote,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const comment = await db
    .doc(`Pool/${data.poolId}/Comments/${data.commentId}`)
    .get();

  if (comment.exists) {
    const commentData = comment.data() as IReply;
    if (
      commentData.positiveScoreRecord.includes(context.auth.uid) &&
      !(data.operation == "sub" && data.buttonType == "positive")
    ) {
      throw new HttpsError("invalid-argument", "Method not allowed");
    } else if (
      commentData.negativeScoreRecord.includes(context.auth.uid) &&
      !(data.operation == "sub" && data.buttonType == "negative")
    ) {
      throw new HttpsError("invalid-argument", "Method not allowed");
    }
  } else {
    throw new HttpsError("invalid-argument", "Comment does not exist");
  }

  const scoreRecord =
    data.buttonType == "positive" ?
      {
        positiveScoreRecord:
            data.operation == "add" ?
              FieldValue.arrayUnion(context.auth.uid) :
              FieldValue.arrayRemove(context.auth.uid),
      } :
      {
        negativeScoreRecord:
            data.operation == "add" ?
              FieldValue.arrayUnion(context.auth.uid) :
              FieldValue.arrayRemove(context.auth.uid),
      };
  await db.doc(`Pool/${data.poolId}/Comments/${data.commentId}`).set(
    {
      score: FieldValue.increment(
        (data.operation == "add" && data.buttonType == "positive") ||
          (data.operation != "add" && data.buttonType != "positive") ?
          1 :
          -1
      ),
      ...scoreRecord,
    },
    {merge: true}
  );
};

const handleUpdateReply = async (
  data: HandleUpdateReply,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db
    .doc(
      `Pool/${data.poolId}/Comments/${data.commentId}/Replies/${data.replyId}`
    )
    .set({content: data.updatedReplyContent}, {merge: true});
};

const handleDeleteReply = async (
  data: HandleDeleteReply,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db
    .doc(`Pool/${data.poolId}/Comments/${data.commentId}`)
    .set({numReplies: FieldValue.increment(-1)}, {merge: true});
  await db
    .doc(
      `Pool/${data.poolId}/Comments/${data.commentId}/Replies/${data.replyId}`
    )
    .delete();
};

const handleUpdateReplyVote = async (
  data: HandleUpdateReplyVote,
  context: CallableContext
) => {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const reply = await db
    .doc(
      `Pool/${data.poolId}/Comments/${data.commentId}/Replies/${data.replyId}`
    )
    .get();

  if (reply.exists) {
    const replyData = reply.data() as IReply;
    if (
      replyData.positiveScoreRecord.includes(context.auth.uid) &&
      !(data.operation == "sub" && data.buttonType == "positive")
    ) {
      throw new HttpsError("invalid-argument", "Method not allowed");
    } else if (
      replyData.negativeScoreRecord.includes(context.auth.uid) &&
      !(data.operation == "sub" && data.buttonType == "negative")
    ) {
      throw new HttpsError("invalid-argument", "Method not allowed");
    }
  } else {
    throw new HttpsError("invalid-argument", "Reply does not exist");
  }

  const scoreRecord =
    data.buttonType == "positive" ?
      {
        positiveScoreRecord:
            data.operation == "add" ?
              FieldValue.arrayUnion(context.auth.uid) :
              FieldValue.arrayRemove(context.auth.uid),
      } :
      {
        negativeScoreRecord:
            data.operation == "add" ?
              FieldValue.arrayUnion(context.auth.uid) :
              FieldValue.arrayRemove(context.auth.uid),
      };

  await db
    .doc(
      `Pool/${data.poolId}/Comments/${data.commentId}/Replies/${data.replyId}`
    )
    .set(
      {
        score: FieldValue.increment(
          (data.operation == "add" && data.buttonType == "positive") ||
            (data.operation != "add" && data.buttonType != "positive") ?
            1 :
            -1
        ),
        ...scoreRecord,
      },
      {merge: true}
    );
};
