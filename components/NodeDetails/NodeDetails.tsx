"use client";
import React, { memo, useCallback } from "react";
import classNames from "classnames";
import type { Node } from "relatives-tree/lib/types";
import { Relations } from "./Relations";
import css from "./NodeDetails.module.css";
import Image from "next/image";
import plusIcon from "../../assets/plus.png";

interface NodeDetailsProps {
  node: Readonly<Node>;
  className?: string;
  onSelect: (nodeId: string | undefined) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
}

export const NodeDetails = memo(function NodeDetails({
  node,
  ...props
}: NodeDetailsProps) {
  const closeHandler = useCallback(() => props.onSelect(undefined), [props]);

  return (
    <section className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-h-[50%] min-w-[50%]  p-2.5  text-[9px] bg-white border border-[#ddd] rounded-md">
      <header className="flex items-center justify-between mb-2.5">
        <h3 className="">{node.id}</h3>
        <button className={css.close} onClick={closeHandler}>
          &#10005;
        </button>
      </header>
      <Relations {...props} title="Parents" items={node.parents} />
      <Relations {...props} title="Children" items={node.children} />
      <Relations {...props} title="Siblings" items={node.siblings} />
      <Relations {...props} title="Spouses" items={node.spouses} />
      {/* <div className="border-[1px] border-[#000] absolute flex items-center justify-center h-3 w-3 left-10 top-1 bg-[#fff] rounded-full">
        <Image className="h-2 w-2" src={plusIcon} alt="plus" />
      </div> */}
    </section>
  );
});
