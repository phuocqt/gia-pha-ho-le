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
import { NODE_HEIGHT, NODE_WIDTH, SOURCES } from "../constants/const";
import { useRouter } from "next/navigation";

const sourceKey = "test-tree-n1.json";
export default function App() {
  const router = useRouter();

  const [nodes, setNodes] = useState<NodeItem[]>(
    SOURCES[sourceKey] as unknown as NodeItem[]
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const firstNodeId = useMemo(() => nodes[0]?.id, [nodes]);
  const [rootId, setRootId] = useState(firstNodeId);

  const [selectId, setSelectId] = useState<string>();
  const [hoverId] = useState<string>();

  const selected = useMemo(
    () => nodes?.find((item) => item.id === selectId),
    [nodes, selectId]
  );

  const getData = async () => {
    try {
      const data = await getAllData("data");
      setNodes(data as unknown as NodeItem[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // runFakeData(SOURCES[sourceKey] as unknown as NodeItem[]);
  }, []);

  return (
    <div className={css.root}>
      {initialLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
          <PinchZoomPan min={0.3} max={5} captureWheel className={css.wrapper}>
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
          router.push("/");
          if (success) {
            setTimeout(() => {
              getData();
            }, 1000);
          }
        }}
      />
    </div>
  );
}
