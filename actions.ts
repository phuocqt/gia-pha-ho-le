/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { NodeItem } from "./type";

export const generateQueryGetData = (collectionName: string) =>
  query(collection(db, collectionName));

export const transformData = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>
) =>
  snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

export async function getAllData(collectionName: string) {
  const queryData = generateQueryGetData(collectionName);
  try {
    const dataSnapShot = await getDocs(queryData);
    const data = transformData(dataSnapShot);
    console.log("data", data);
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

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
    console.log("ERROR", error);
    callback("error");
  }
};

export const editData = async (
  id: string,
  data: any,
  callback?: (type: "error" | "success") => void
) => {
  try {
    await setDoc(
      doc(db, "data", id),
      {
        ...data,
      },
      { merge: true } // just update what is changed
    );
    callback?.("success");
  } catch (error) {
    callback?.("error");
    console.log("ERROR", error);
  }
};

export async function getDataById(id: string) {
  try {
    const docRef = doc(db, "data", id);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
}

export async function getDataByField(fieldName: string, fieldValue: any) {
  try {
    const dataCollection = collection(db, "data");

    const q = query(dataCollection, where(fieldName, "==", fieldValue));

    const querySnapshot = await getDocs(q);

    const result: any[] = [];
    querySnapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });

    if (result.length > 0) {
      console.log("Dữ liệu tìm thấy:", result);
      return result;
    } else {
      console.log("Không tìm thấy tài liệu phù hợp!");
      return [];
    }
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
}
