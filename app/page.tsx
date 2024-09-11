/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getAllData } from "@/actions";
import { ProfileDialog } from "@/components/ProfileDialog";
import { NodeItem } from "@/type";
import { convertData, getNodeStyle } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import ReactFamilyTree from "react-family-tree";
import css from "../App.module.css";
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../components/FamilyNode/FamilyNode";
import { NODE_HEIGHT, NODE_WIDTH } from "../constants/const";

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
    console.log("data", data);
    setNodes(
      convertData([
        {
          id: "23447f7a-0868-4d72-a096-28b7012395b2",
          name: "vợ 1",
          siblings: [],
          isAlive: true,
          gender: "female",
          editUser: "HFeLEHX7QKXNyX2QyFrR2gVxFeC2",
          spouses: [
            {
              type: "married",
              id: "32cf5179-c654-4de8-a5ba-d1fdf1590e68",
            },
          ],
          parents: [],
          children: [
            {
              id: "a854ed3c-0240-44a6-ae95-2521cf89b879",
              type: "blood",
            },
          ],
          childType: "blood",
        },
        {
          id: "240cc37f-5d77-4390-a15e-e53f46d641af",
          isAlive: true,
          gender: "female",
          siblings: [],
          spouses: [
            {
              type: "married",
              id: "a854ed3c-0240-44a6-ae95-2521cf89b879",
            },
          ],
          name: "A",
          childType: "blood",
          children: [],
          parents: [],
        },
        {
          id: "32cf5179-c654-4de8-a5ba-d1fdf1590e68",
          isAlive: true,
          createUser: "Lj78Lt6d2EYaVfpv1ROAqVcR9bm2",
          name: "Con 1",
          editUser: "HFeLEHX7QKXNyX2QyFrR2gVxFeC2",
          photoURL:
            "https://lh3.googleusercontent.com/a/ACg8ocJTCnwHjcgI86oVm4wcYT3clHTNSjDplF5Z1magqW82ZSDn3gzO=s96-c",
          gender: "male",
          otherParentId: "",
          parents: [
            {
              type: "blood",
              id: "TsyAkbF89",
            },
          ],
          spouses: [
            {
              id: "23447f7a-0868-4d72-a096-28b7012395b2",
              type: "married",
            },
          ],
          userId: "Lj78Lt6d2EYaVfpv1ROAqVcR9bm2",
          siblings: [],
          childType: "blood",
          children: [
            {
              type: "blood",
              id: "a854ed3c-0240-44a6-ae95-2521cf89b879",
            },
          ],
        },
        {
          id: "a854ed3c-0240-44a6-ae95-2521cf89b879",
          otherParentId: "23447f7a-0868-4d72-a096-28b7012395b2",
          name: "dd",
          siblings: [],
          createUser: "HFeLEHX7QKXNyX2QyFrR2gVxFeC2",
          children: [],
          isAlive: true,
          childType: "blood",
          parents: [
            {
              type: "blood",
              id: "32cf5179-c654-4de8-a5ba-d1fdf1590e68",
            },
            {
              type: "blood",
              id: "23447f7a-0868-4d72-a096-28b7012395b2",
            },
          ],
          spouses: [
            {
              type: "married",
              id: "240cc37f-5d77-4390-a15e-e53f46d641af",
            },
          ],
          gender: "male",
        },
      ])
    );
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
