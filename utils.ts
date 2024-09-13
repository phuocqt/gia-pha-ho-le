import type { CSSProperties } from "react";
import type { ExtNode } from "relatives-tree/lib/types";
import { NODE_HEIGHT, NODE_WIDTH } from "./constants/const";
import { Timestamp } from "firebase/firestore";
import { NodeItem } from "./type";
import { deleteItem, deleteMultipleDocs, editData } from "./actions";

export function getNodeStyle({ left, top }: Readonly<ExtNode>): CSSProperties {
  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    transform: `translate(${left * (NODE_WIDTH / 2)}px, ${
      top * (NODE_HEIGHT / 2)
    }px)`,
  };
}

export function createYearRange(min: number, max: number): number[] {
  const arr: number[] = [];
  for (let i = min; i <= max; i++) {
    arr.push(i);
  }
  return arr;
}

export function convertFirebaseTimestamp(timestamp?: Timestamp): string {
  if (!timestamp) return "";
  const seconds: number = timestamp?.seconds;
  const nanoseconds: number = timestamp?.nanoseconds;

  const date: Date = new Date(seconds * 1000 + nanoseconds / 1000000);

  const formattedDate: string = date.toLocaleString("vi-VN", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formattedDate?.replace(/\//g, "-").replace(",", "");
}

export function convertData(nodes: NodeItem[]): NodeItem[] {
  const convertedData = nodes.map((item) => ({
    id: item?.id,
    siblings: item?.siblings || [],
    deathday: item?.deathday || "",
    spouses: item?.spouses || [],
    name: item?.name || "",
    birthday: item?.birthday,
    parents: item?.parents || [],
    children: item?.children || [],
    gender: item?.gender,
  }));
  return (convertedData as NodeItem[]) || [];
}

export function deleteNode(
  allNode: NodeItem[],
  node: NodeItem,
  callback?: () => void
) {
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

  const isLeader = node?.parents?.length > 0;
  if (!isLeader) {
    const spouseNodeId = node?.spouses.length && node?.spouses?.[0]?.id;
    if (spouseNodeId) {
      const spousesNode = allNodeToObject[spouseNodeId];
      editData("data", spouseNodeId, {
        spouses: spousesNode?.spouses?.filter((item) => item?.id !== node?.id),
      });
    }
    if (node?.children?.length > 0) {
      node?.children?.forEach((child) => {
        const childNode = allNodeToObject[child.id];
        editData("data", child.id, {
          parents: childNode?.parents?.filter((item) => item?.id !== node?.id),
        });
      });
    }
    deleteItem("data", node?.id, () => callback?.());
  }
  if (isLeader) {
    getRelateNode(node);
    // change parent data (delete child with delete id)
    node?.parents?.forEach((parent) => {
      const parentData = allNodeToObject[parent.id];
      const childrenList = [...parentData?.children];
      if (childrenList?.length > 0) {
        editData("data", parent.id, {
          children: childrenList.filter((child) => child.id !== node?.id),
        });
      }
    });
    deleteMultipleDocs(relatedIds, () => callback?.());
  }

  console.log("related", relatedIds);
}
