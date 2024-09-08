"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import ReactFamilyTree from "react-family-tree";
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../components/FamilyNode/FamilyNode";
import { NODE_WIDTH, NODE_HEIGHT } from "../const";
import css from "../App.module.css";
import { getNodeStyle } from "@/utils";
import { NodeItem } from "@/type";
import { ProfileDialog } from "@/components/ProfileDialog";
import { generateQueryGetData, transformData } from "@/actions";
import { getDocs } from "firebase/firestore";

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

  const resetRootHandler = useCallback(
    () => setRootId(firstNodeId),
    [firstNodeId]
  );

  const selected = useMemo(
    () => nodes.find((item) => item.id === selectId),
    [nodes, selectId]
  );

  const getData = async () => {
    const queryData = generateQueryGetData();
    try {
      const dataSnapShot = await getDocs(queryData);
      const data = transformData(dataSnapShot);
      console.log("data", data);

      setNodes(data as unknown as NodeItem[]);
    } catch (error) {
      console.log("error", error);
    }
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
      {rootId !== firstNodeId && (
        <button className={css.reset} onClick={resetRootHandler}>
          Reset
        </button>
      )}
      {/* {selected && (
        <NodeDetails
          node={selected}
          className={css.details}
          onSelect={setSelectId}
          onHover={setHoverId}
          onClear={() => setHoverId(undefined)}
        />
      )} */}
      <ProfileDialog
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
