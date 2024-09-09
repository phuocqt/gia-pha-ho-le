"use client";
import { NodeItem } from "@/type";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import React, { useCallback } from "react";

interface FamilyNodeProps {
  node: NodeItem;
  isRoot: boolean;
  isHover?: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export const FamilyNode = React.memo(function FamilyNode({
  node,
  onClick,
  style,
}: FamilyNodeProps) {
  const clickHandler = useCallback(() => onClick(node.id), [node.id, onClick]);

  return (
    <div className="absolute flex p-2.5" style={style}>
      <div
        className={`relative flex flex-1 flex-col items-center justify-start rounded-md  cursor-pointer ${
          node.gender === "male"
            ? "border-2  bg-[#fff8dc]"
            : "border  bg-[#f0ffff]"
        }`}
        onClick={clickHandler}
      >
        <Avatar
          className={`${
            node.gender === "male"
              ? "border-2 border-[#a4ecff] bg-[#fff8dc]"
              : "border-2 border-[#fdaed8] bg-[#f0ffff]"
          } mb-1 w-[20px] h-[20px] rounded-full overflow-hidden`}
        >
          <AvatarImage src="https://github.com/shadcn.png" alt={node.name} />
        </Avatar>
        <div className="text-[7px] leading-[2] text-black">{node.name}</div>
        <div className="text-[5px] leading-[1] text-black">
          {node?.birthday || "-"} -{" "}
          {node?.isAlive ? "nay" : node?.deathday || "-"}
        </div>
      </div>
    </div>
  );
});
