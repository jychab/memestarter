import {
  DocumentData,
  FirestoreError,
  Query,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import useSWR from "swr";
import useSWRSubscription from "swr/subscription";
import { db } from "../utils/firebase";

const useFirestoreWtihSWR = () => {
  const useCollection = <T>(
    params: Query<DocumentData, DocumentData> | null
  ): { data: T[] | undefined; error: FirestoreError | undefined } => {
    const { data, error } = useSWRSubscription(params, (_, { next }) => {
      if (params == null) {
        return;
      }
      const unsubscribe = onSnapshot(
        params,
        (querySnapshot) => {
          next(
            null,
            querySnapshot.docs.map((doc) => doc.data())
          );
        },
        (error) => next(error)
      );
      return () => unsubscribe && unsubscribe();
    });
    return { data, error };
  };

  const getDocument = (path: string | null) => {
    const { data, error, isLoading } = useSWR(path, (x: string) =>
      getDoc(doc(db, x))
    );
    return { data, error, isLoading };
  };
  return { useCollection, getDocument };
};

export default useFirestoreWtihSWR;
