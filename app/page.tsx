/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getAllData } from "@/actions";
import { ProfileDialog } from "@/components/ProfileDialog";
import { NodeItem } from "@/type";
import { getNodeStyle } from "@/utils";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactFamilyTree from "react-family-tree";
import css from "../App.module.css";
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../components/FamilyNode/FamilyNode";
import { NODE_HEIGHT, NODE_WIDTH, SOURCES } from "../constants/const";
import { useRouter } from "next/navigation";

const sourceKey = "test-tree-n1.json";

const normalizeName = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();

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
  const [searchValue, setSearchValue] = useState("");
  const [focusedId, setFocusedId] = useState<string>();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const selected = useMemo(
    () => nodes?.find((item) => item.id === selectId),
    [nodes, selectId]
  );

  const matchedNodes = useMemo(() => {
    const keyword = normalizeName(searchValue);

    if (!keyword) return [];

    return nodes
      .filter((item) => normalizeName(item.name).includes(keyword))
      .slice(0, 8);
  }, [nodes, searchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFocusedId(undefined);
    setShowSearchResults(!!value.trim());
  };

  const handleSelectSearchResult = (node: NodeItem) => {
    setRootId(node.id);
    setFocusedId(node.id);
    setSearchValue(node.name || "");
    setShowSearchResults(false);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setFocusedId(undefined);
    setShowSearchResults(false);
  };

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
        <>
          <div
            className="fixed left-1/2 top-20 z-20 w-[min(320px,calc(100vw-32px))] -translate-x-1/2"
            onMouseDown={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[42px] w-full items-center gap-2 rounded-lg border border-[#d5d7dc] bg-white px-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
              <Search className="h-4 w-4 shrink-0 text-[#687083]" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#7b8497]"
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => setShowSearchResults(!!searchValue.trim())}
                placeholder="Tìm kiếm theo tên"
                aria-label="Tìm kiếm theo tên"
              />
              {searchValue && (
                <button
                  className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f1f3f6] text-[#687083]"
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={handleClearSearch}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {showSearchResults && (
              <div className="mt-2 max-h-[280px] w-full overflow-auto rounded-lg border border-[#d5d7dc] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
                {matchedNodes.length > 0 ? (
                  matchedNodes.map((node) => (
                    <button
                      key={node.id}
                      className="flex min-h-12 w-full cursor-pointer flex-col items-start justify-center border-0 border-b border-[#eef0f3] bg-transparent px-3 py-2 text-left last:border-b-0 hover:bg-[#f6f8fb]"
                      type="button"
                      onClick={() => handleSelectSearchResult(node)}
                    >
                      <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-[1.3] text-[#111827]">
                        {node.name}
                      </span>
                      <span className="mt-0.5 text-xs leading-[1.2] text-[#687083]">
                        {node.birthday || "-"} -{" "}
                        {node.isAlive ? "nay" : node.deathday || "-"}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-[13px] text-[#687083]">Không tìm thấy tên phù hợp</div>
                )}
              </div>
            )}
          </div>
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
                  isFocused={node.id === focusedId}
                  isHover={node.id === hoverId}
                  onClick={setSelectId}
                  onSubClick={setRootId}
                  style={getNodeStyle(node)}
                />
              )}
            />
          </PinchZoomPan>
        </>
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

