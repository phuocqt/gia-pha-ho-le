import type { CSSProperties } from "react";
import type { ExtNode } from "relatives-tree/lib/types";
import { NODE_HEIGHT, NODE_WIDTH } from "./constants/const";
import { Timestamp } from "firebase/firestore";

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
