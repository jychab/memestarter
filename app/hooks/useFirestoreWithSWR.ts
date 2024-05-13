import {
  DocumentData,
  FirestoreError,
  Query,
  onSnapshot,
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

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
  return { useCollection };
};

export default useFirestoreWtihSWR;
