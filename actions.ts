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

  getUser() {
    return this.loggedUser;
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

  // if not is admin save data to editedData collection and set data with hasEdited flag
  async editNodeByUserRole(
    id: string,
    data: any,
    callback?: (type: "error" | "success") => void
  ) {
    try {
      if (this.loggedUser?.role !== "user") {
        await setDoc(
          doc(db, "data", id),
          {
            ...data,
            hasEditReq: false,
            editUser: this.loggedUser?.name || this.loggedUser?.id,
          },
          { merge: true }
        );
      } else {
        const historyData = await getDataById("data", id);
        await setDoc(
          doc(db, "data", id),
          {
            ...data,
            hasEditReq: true,
            editUser: this.loggedUser?.name || this.loggedUser?.id,
          },
          { merge: true }
        );
        await setDoc(
          doc(db, "historyData", id),
          {
            ...historyData,
          },
          { merge: true }
        );
      }
      console.log("edit data", data);

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

  deleteNode(allNode: NodeItem[], node: NodeItem, callback?: () => void) {
    const allNodeToObject: Record<string, NodeItem> = {};
    allNode?.forEach((node) => {
      if (node?.id) allNodeToObject[node?.id] = node;
    });
    const relatedIds: string[] = [node?.id];

    const getRelateNode = (node: NodeItem) => {
      if (node?.spouses) {
        node?.spouses?.forEach((spouse) => {
          relatedIds.push(spouse.id);
        });
      }
      const childList = node?.children;
      if (childList.length > 0)
        childList?.forEach((child) => {
          relatedIds.push(child.id);
          if (allNodeToObject[child.id]?.children)
            getRelateNode(allNodeToObject[child.id]);
        });
    };
    const singleItem = node?.parents?.length > 0;
    getRelateNode(node);
    if (this.loggedUser?.role !== "user") {
      if (!singleItem) {
        const spouseNodeId = node?.spouses.length && node?.spouses?.[0]?.id;
        if (spouseNodeId) {
          const spousesNode = allNodeToObject[spouseNodeId];
          editData("data", spouseNodeId, {
            spouses: spousesNode?.spouses?.filter(
              (item) => item?.id !== node?.id
            ),
          });
        }
        if (node?.children?.length > 0) {
          node?.children?.forEach((child) => {
            const childNode = allNodeToObject[child.id];
            editData("data", child.id, {
              parents: childNode?.parents?.filter(
                (item) => item?.id !== node?.id
              ),
            });
          });
        }
        deleteItem("data", node?.id, () => callback?.());
      }
      if (singleItem) {
        // change parent data (delete child with delete id)
        node?.parents?.forEach((parent) => {
          const parentData = allNodeToObject[parent.id];
          const childrenList = [...parentData?.children];
          if (childrenList?.length > 0) {
            editData("data", parent.id, {
              children: childrenList.filter((child) => child.id !== node?.id),
              hasDeleteReq: true,
            });
          }
        });
        deleteMultipleDocs(relatedIds, () => callback?.());
      }
      console.log("related", relatedIds);
    } else {
      if (!singleItem) {
        editData("data", node.id, {
          hasDeleteReq: true,
        });
      } else {
        relatedIds?.forEach((item) => {
          editData("data", item, {
            hasDeleteReq: true,
            deleteId: node?.id,
          });
        });
      }
      callback?.();
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

export const editNodeByUserRole = (
  id: string,
  data: any,
  callback?: (type: "error" | "success") => void
) => actions().editNodeByUserRole(id, data, callback);

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

export const deleteNode = (
  allNode: NodeItem[],
  node: NodeItem,
  callback?: () => void
) => actions().deleteNode(allNode, node, callback);

export const getUser = () => actions().getUser();
