"use client";
import { NodeItem } from "@/type";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import React, { useCallback, useEffect, useState } from "react";
import userIcon from "../../assets/avatar.jpg";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import { useSearchParams } from "next/navigation";

interface FamilyNodeProps {
  node: NodeItem;
  isRoot: boolean;
  isFocused?: boolean;
  isHover?: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export const FamilyNode = React.memo(function FamilyNode({
  node,
  isFocused,
  onClick,
  style,
}: FamilyNodeProps) {
  const clickHandler = useCallback(() => onClick(node.id), [node.id, onClick]);
  const [userId, setUserId] = useState("");
  const [loggedInUser] = useAuthState(auth);
  const searchParams = useSearchParams();
  const deleteId = searchParams.get("deleteId");
  const getBorderClass = () => {
    if (isFocused) return "border-2 border-red-500";
    if (deleteId === node?.id) return "border-2 border-[#f04c4c]";
    if (deleteId === node?.deleteId) return "border-2 border-lime-300";
    if (node?.userId && userId && node?.userId === userId) {
      return "border-2 border-blue-500";
    }
    return "border border-transparent";
  };
  const borderClass = getBorderClass();

  useEffect(() => {
    if (loggedInUser?.uid) setUserId(loggedInUser?.uid || "");
  }, [loggedInUser?.uid]);

  return (
    <div
      className={`absolute flex p-2.5`}
      data-family-node-id={node.id}
      style={style}
    >
      <div
        className={`relative flex flex-1 flex-col items-center justify-start rounded-md  cursor-pointer ${
          node.gender === "male" ? "bg-[#fff8dc]" : "bg-[#f0ffff]"
        } ${borderClass}`}
        onClick={clickHandler}
      >
        <Avatar
          className={`${
            node.gender === "male"
              ? "border-2 border-[#a4ecff] bg-[#fff8dc]"
              : "border-2 border-[#fdaed8] bg-[#f0ffff]"
          } mb-1 w-[20px] h-[20px] rounded-full overflow-hidden`}
        >
          <AvatarImage
            className="object-cover h-full w-full"
            src={node?.photoURL || userIcon.src}
            alt={node.name}
          />
        </Avatar>
        <div className="text-[7px] leading-[2] text-black">{node.name}</div>
        <div className="text-[5px] leading-[1] text-black">
          {node?.birthday || "-"} - {node?.deathday || "-"}
        </div>
      </div>
      {node.hasDeleteReq && (
        <div className="absolute top-[6px] right-[14px] w-[6px] h-[6px] border border-[rgba(0,0,0,0.2)] rounded-tr-[2px] bg-red-300 cursor-pointer"></div>
      )}
      {node.hasAddReq && (
        <div className="absolute top-[6px] right-[14px] w-[6px] h-[6px] border border-[rgba(0,0,0,0.2)] rounded-tr-[2px] bg-yellow-200 cursor-pointer"></div>
      )}
      {node.hasEditReq && (
        <div className="absolute top-[6px] right-[14px] w-[6px] h-[6px] border border-[rgba(0,0,0,0.2)] rounded-tr-[2px] bg-cyan-300	 cursor-pointer"></div>
      )}
    </div>
  );
});
