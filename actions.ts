import {
  collection,
  doc,
  DocumentData,
  query,
  QuerySnapshot,
  setDoc,
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
export const addData = async (
  data: NodeItem,
  callback: (type: "error" | "success") => void
) => {
  try {
    await setDoc(doc(db, "data", data.id), {
      ...data,
    });
    callback("success");
  } catch (error) {
    callback("error");
  }
};

export const editData = async (
  data: NodeItem,
  callback?: (type: "error" | "success") => void
) => {
  try {
    await setDoc(doc(db, "data", data?.id), {
      ...data,
    });
    callback?.("success");
  } catch (error) {
    callback?.("error");
  }
};
