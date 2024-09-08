import {
  collection,
  DocumentData,
  query,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { NodeItem } from "./type";

export const generateQueryGetData = () => query(collection(db, "data"));

export const transformData = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>
) =>
  snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      } as NodeItem)
  );
