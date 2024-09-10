/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getAllData } from "@/actions";
import { ProfileDialog } from "@/components/ProfileDialog";
import { NodeItem } from "@/type";
import { getNodeStyle } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import ReactFamilyTree from "react-family-tree";
import css from "../App.module.css";
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../components/FamilyNode/FamilyNode";
import { NODE_HEIGHT, NODE_WIDTH } from "../const";

export default function App() {
  const [nodes, setNodes] = useState<NodeItem[]>([
    {
      id: "TsyAkbF89",
      siblings: [],
      deathday: "1990",
      spouses: [],
      name: "Lê Văn A",
      birthday: "1800",
      parents: [],
      children: [],
      gender: "male",
    },
  ] as unknown as NodeItem[]);

  const firstNodeId = useMemo(() => nodes[0]?.id, [nodes]);
  const [rootId, setRootId] = useState(firstNodeId);

  const [selectId, setSelectId] = useState<string>();
  const [hoverId] = useState<string>();

  const selected = useMemo(
    () => nodes.find((item) => item.id === selectId),
    [nodes, selectId]
  );

  const getData = async () => {
    const data = await getAllData("data");
    setNodes(data as unknown as NodeItem[]);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className={css.root}>
      {nodes?.length > 0 && (
        <PinchZoomPan min={0.5} max={2.5} captureWheel className={css.wrapper}>
          <ReactFamilyTree
            nodes={nodes}
            rootId={rootId}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            className={css.tree}
            renderNode={(node: Readonly<NodeItem>) => (
              <FamilyNode
                key={node.id}
                node={node}
                isRoot={node.id === rootId}
                isHover={node.id === hoverId}
                onClick={setSelectId}
                onSubClick={setRootId}
                style={getNodeStyle(node)}
              />
            )}
          />
        </PinchZoomPan>
      )}

      <ProfileDialog
        allNode={nodes as NodeItem[]}
        node={selected}
        open={!!selected}
        onClose={(success) => {
          setSelectId("");
          if (success) getData();
        }}
      />
    </div>
  );
}
