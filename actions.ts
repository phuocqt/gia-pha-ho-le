/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  getDoc,
  where,
  deleteDoc,
  QuerySnapshot,
  DocumentData,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { NodeItem, User } from "./type";

class actionStore {
  private loggedUser?: User | null = null;

  constructor() {}

  generateQueryGetData(collectionName: string) {
    return query(collection(db, collectionName));
  }

  transformData(snapshot: QuerySnapshot<DocumentData, DocumentData>) {
    return snapshot.docs.map((item) => ({
      id: item?.id,
      ...item?.data(),
    }));
  }

  syncUser(user: User) {
    if (user) this.loggedUser = user;
  }

  async getAllData(collectionName: string) {
    const queryData = this.generateQueryGetData(collectionName);
    try {
      const dataSnapShot = await getDocs(queryData);
      const data = this.transformData(dataSnapShot);
      return data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async addData(data: NodeItem, callback: (type: "error" | "success") => void) {
    console.log("add Data", data);
    try {
      await setDoc(doc(db, "data", data.id), {
        ...data,
        hasAddReq: this.loggedUser?.role === "user" ? true : false,
      });
      callback("success");
    } catch (error) {
      console.log("ERROR", error);
      callback("error");
    }
  }

  async editData(
    collection: string,
    id: string,
    data: any,
    callback?: (type: "error" | "success") => void
  ) {
    try {
      console.log("edit data", data, this.loggedUser);

      await setDoc(
        doc(db, collection, id),
        {
          ...data,
          hasEditReq: this.loggedUser?.role === "user" ? true : false,
          editUser: this.loggedUser?.name || this.loggedUser?.id,
        },
        { merge: true }
      );
      callback?.("success");
    } catch (error) {
      callback?.("error");
      console.log("ERROR", error);
    }
  }

  async getDataById(collection: string, id: string) {
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

  async getDataByField(fieldName: string, fieldValue: any) {
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

  async deleteItem(
    collection: string,
    id: string,
    callback?: () => void
  ): Promise<void> {
    try {
      if (this.loggedUser?.role !== "user") {
        const docRef = doc(db, collection, id);
        await deleteDoc(docRef);
        console.log(`delete success ${id} from collection ${collection}`);
        callback?.();
      } else {
        await setDoc(
          doc(db, collection, id),
          {
            hasDeleteReq: true,
            editUser: this.loggedUser?.name || this.loggedUser?.id,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("error when delete item:", error);
      throw error;
    }
  }

  async deleteMultipleDocs(ids: string[], callback?: () => void) {
    console.log("delete", this.loggedUser);

    try {
      if (this.loggedUser?.role !== "user") {
        console.log("delete admin", ids);

        const deletePromises = ids.map((id) => {
          const docRef = doc(db, "data", id);
          return deleteDoc(docRef);
        });
        await Promise.all(deletePromises);
      } else {
        const dataCollection = collection(db, "data");
        console.log("deletMultipleDocs", ids);

        const updatePromises = ids.map(async (id) => {
          if (id) {
            const itemRef = doc(dataCollection, id.toString());
            await updateDoc(itemRef, {
              hasDeleteReq: true,
              editUser: this.loggedUser?.name || this.loggedUser?.id,
            });
          }
        });
        await Promise.all(updatePromises);
      }
      callback?.();
      console.log("delete selected data!");
    } catch (error) {
      console.error("error when delete data:", error);
      throw error;
    }
  }

  async deleteAllDataFromFirestore() {
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
  }

  async runFakeData(dataArray: NodeItem[]) {
    try {
      await this.deleteAllDataFromFirestore();
      const dataCollection = collection(db, "data");

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
  }
}

// Export the class for use with 'new'
export default actionStore;

// Export standalone functions that use actionStore internally
let actionStoreInstance: actionStore | null = null;

function actions() {
  if (!actionStoreInstance) {
    actionStoreInstance = new actionStore();
  }
  return actionStoreInstance;
}

export const syncUser = (user: User) => actions().syncUser(user);

export const generateQueryGetData = (collectionName: string) =>
  actions().generateQueryGetData(collectionName);

export const transformData = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>
) => actions().transformData(snapshot);

export const getAllData = (collectionName: string) =>
  actions().getAllData(collectionName);

export const addData = (
  data: NodeItem,
  callback: (type: "error" | "success") => void
) => actions().addData(data, callback);

export const editData = (
  collection: string,
  id: string,
  data: any,
  callback?: (type: "error" | "success") => void
) => actions().editData(collection, id, data, callback);

export const getDataById = (collection: string, id: string) =>
  actions().getDataById(collection, id);

export const getDataByField = (fieldName: string, fieldValue: any) =>
  actions().getDataByField(fieldName, fieldValue);

export const deleteItem = (
  collection: string,
  id: string,
  callback?: () => void
) => actions().deleteItem(collection, id, callback);

export const deleteMultipleDocs = (ids: string[], callback?: () => void) =>
  actions().deleteMultipleDocs(ids, callback);

export const deleteAllDataFromFirestore = () =>
  actions().deleteAllDataFromFirestore();

export const runFakeData = (dataArray: NodeItem[]) =>
  actions().runFakeData(dataArray);
