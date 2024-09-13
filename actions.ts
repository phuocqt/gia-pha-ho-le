/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  deleteDoc,
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
    id: item?.id,
    ...item?.data(),
  }));

export async function getAllData(collectionName: string) {
  const queryData = generateQueryGetData(collectionName);
  try {
    const dataSnapShot = await getDocs(queryData);
    const data = transformData(dataSnapShot);
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

export const addData = async (
  data: NodeItem,
  callback: (type: "error" | "success") => void
) => {
  console.log("add Data", data);

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
  collection: string,
  id: string,
  data: any,
  callback?: (type: "error" | "success") => void
) => {
  try {
    console.log("edit data", data);

    await setDoc(
      doc(db, collection, id),
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

export async function getDataById(collection: string, id: string) {
  try {
    const docRef = doc(db, collection, id);

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
      console.log("found data:", result);
      return result;
    } else {
      console.log("data not found");
      return [];
    }
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
}

export async function deleteItem(
  collection: string,
  id: string,
  callback?: () => void
): Promise<void> {
  try {
    const docRef = doc(db, collection, id);

    await deleteDoc(docRef);

    console.log(`delete success ${id} from collection ${collection}`);
    callback?.();
  } catch (error) {
    console.error("error when delete item:", error);
    throw error;
  }
}

export async function deleteMultipleDocs(ids: string[], callback?: () => void) {
  try {
    const deletePromises = ids.map((id) => {
      const docRef = doc(db, "data", id);
      return deleteDoc(docRef);
    });

    await Promise.all(deletePromises);

    callback?.();
    console.log("delete selected data!");
  } catch (error) {
    console.error("error when delete data:", error);
    throw error;
  }
}

const deleteAllDataFromFirestore = async () => {
  try {
    const dataCollection = collection(db, "data");
    const querySnapshot = await getDocs(dataCollection);

    const deletePromises = querySnapshot.docs.map((document) => {
      return deleteDoc(doc(db, "data", document.id));
    });

    await Promise.all(deletePromises);
    console.log("all data in collection was deleted.");
  } catch (error) {
    console.error("error when delete all data:", error);
  }
};

export const runFakeData = async (dataArray: NodeItem[]) => {
  try {
    // delete all data
    await deleteAllDataFromFirestore();
    const dataCollection = collection(db, "data");
    // create new data
    const savePromises = dataArray.map(async (item) => {
      if (item.id) {
        const itemRef = doc(dataCollection, item.id.toString());
        await setDoc(itemRef, item);
      }
    });

    await Promise.all(savePromises);
    console.log("All fake data was added!");
  } catch (error) {
    console.error("error when saving fake data to Firestore:", error);
  }
};
