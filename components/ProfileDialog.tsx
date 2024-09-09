/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { AuthButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NodeItem } from "@/type";
import { useEffect, useState } from "react";
import GenderSelect from "./ui/genderSelect";
import { Avatar, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { addData, editData } from "@/actions";
import { useToast } from "@/hooks/use-toast";

export function ProfileDialog({
  open,
  onClose,
  node,
  allNode,
}: {
  onClose?: (type?: "success") => void;
  open?: boolean;
  node?: NodeItem;
  allNode?: NodeItem[];
}) {
  const [data, setData] = useState({
    ...node,

    children: node?.children || [],
    siblings: node?.siblings || [],
    spouses: node?.spouses || [],
    parents: node?.parents || [],
  });
  const [loggedInUser] = useAuthState(auth);
  const [mode, setMode] = useState<"view" | "edit" | "addSpouses" | "addChild">(
    "view"
  );
  const { toast } = useToast();
  useEffect(() => {
    if (!!node) setData({ ...node });
    setMode("view");
  }, [node, open]);
  const isMultiMarried = (node?.spouses?.length || 0) > 1;
  const spousesNode = (node?.spouses || []).map((item) => {
    const itemDetail = allNode?.find((i) => i.id === item.id);
    return {
      ...itemDetail,
      ...item,
    };
  });

  const onSubmit = () => {
    if (mode === "edit") {
      editData(data as NodeItem, (type) => {
        if (type === "error")
          toast({
            title: "Đã có lỗi, vui lòng thử lại",
          });
        if (type === "success")
          toast({
            title: "Đã cập nhật thành công",
          });
        onClose?.("success");
      });
    }
    if (mode === "addChild") {
      const mom = data?.momId ? [{ id: data?.momId, type: "blood" }] : [];
      const tempData = {
        ...data,
        parents: [{ id: node?.id || "", type: "blood" }, ...mom],
      };

      addData(tempData as NodeItem, (type) => {
        if (type === "error")
          toast({
            title: "Đã có lỗi, vui lòng thử lại",
          });
        onClose?.();
        if (type === "success")
          toast({
            title: "Thêm Mới thành công",
          });
      });
    }
    if (mode === "addSpouses") {
      const tempData = {
        ...data,
        children: [...(node?.children || [])],
        spouses: [{ id: node?.id, type: "married" }],
      };

      addData(tempData as NodeItem, (type) => {
        if (type === "error")
          toast({
            title: "Đã có lỗi, vui lòng thử lại",
          });
        if (type === "success")
          toast({
            title: "Thêm Mới thành công",
          });
        onClose?.();
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-[425px] p-0 bg-[#fafafa] text-black border-none">
        {mode === "view" && (
          <div>
            <div className=" flex flex-col justify-center bg-[#a15e1f]  text-white items-center gap-1 mb-3">
              <Avatar
                className={`${
                  node?.gender === "male"
                    ? "border-2 border-[#a4ecff] bg-[#fff8dc]"
                    : "border-2 border-[#fdaed8] bg-[#f0ffff]"
                } mb-1 mt-2 w-[120px] h-[120px] rounded-full overflow-hidden `}
              >
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={node?.name}
                />
              </Avatar>
              <div className="text-[20px] font-bold">{node?.name}</div>
              {(node?.birthday || node?.deathday) && (
                <div className="text-[16px]">
                  {node?.birthday || "-"} -{" "}
                  {node?.isAlive ? "nay" : node?.deathday || "-"}
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center items-center">
              <AuthButton
                variant="default"
                className="w-[120px] mb-2 "
                onClick={() => {
                  setMode("edit");
                  setData({ ...node });
                }}
              >
                Chỉnh sửa
              </AuthButton>
              {loggedInUser ? (
                node?.gender === "female" ? (
                  <Button
                    onClick={() => {
                      setMode("addChild");
                    }}
                    variant="default"
                    className="w-[150px] mb-2 "
                  >
                    Thêm Con
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-[120px] mb-2 " variant="default">
                        Thêm thành viên
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setMode("addSpouses");
                          setData({
                            gender: "female" as any,
                            isAlive: true,
                            children: [],
                            siblings: [],
                            spouses: [],
                            parents: [],
                          });
                        }}
                      >
                        Thêm Vợ/Chồng
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setMode("addChild");
                          setData({
                            gender: "female" as any,
                            isAlive: true,
                            children: [],
                            siblings: [],
                            spouses: [],
                            parents: [],
                          });
                        }}
                      >
                        Thêm Con
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              ) : (
                <AuthButton variant="default" className="w-[150px] mb-2  ">
                  Thêm Thành viên
                </AuthButton>
              )}
            </div>
            <div className="px-4 py-5 text-[16px]">
              <div className="flex items-center">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Tên:
                </Label>
                <div className="">{node?.name}</div>
              </div>
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Giới tính:
                </Label>
                <div className="">
                  {node?.gender ? (node.gender === "male" ? "Nam" : "Nữ") : "-"}
                </div>
              </div>
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Năm sinh:
                </Label>
                <div className="">{node?.birthday || "-"}</div>
              </div>
              {node?.isAlive && (
                <div className="flex items-center ">
                  <Label
                    htmlFor="name"
                    className="text-left w-[120px] font-[500] text-[16px]"
                  >
                    Năm mất:
                  </Label>
                  <div className="">{node?.deathday || "-"}</div>
                </div>
              )}
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Nơi Sinh:
                </Label>
                <div className="">{node?.birthPlace || "-"}</div>
              </div>
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Địa chỉ:
                </Label>
                <div className="">{node?.address || "-"}</div>
              </div>
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Số điện thoại:
                </Label>
                <div className="">{node?.phoneNum || "-"}</div>
              </div>
              <div className="flex items-center ">
                <Label
                  htmlFor="name"
                  className="text-left w-[120px] font-[500] text-[16px]"
                >
                  Khác:
                </Label>
                <div className="">{node?.note || "-"}</div>
              </div>
            </div>
          </div>
        )}
        {mode !== "view" && (
          <div className="p-4">
            <DialogHeader>
              <DialogTitle>
                {mode === "edit"
                  ? "CHỈNH SỬA SAU ĐÓ BẤM LƯU"
                  : mode === "addChild"
                  ? "THÊM CON"
                  : "THÊM VỢ/CHỒNG"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <Avatar
                className={`${
                  node?.gender === "male"
                    ? "border-2 border-[#a4ecff] bg-[#fff8dc]"
                    : "border-2 border-[#fdaed8] bg-[#f0ffff]"
                } mb-1 w-[120px] h-[120px] rounded-full overflow-hidden mt-2`}
              >
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={node?.name}
                />
              </Avatar>
              <div className="flex items-center ml-2">
                <Button className="w-full">
                  {mode === "edit" ? "Thay ảnh đại diện" : "Thêm ảnh đại diện"}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-left">
                  Tên:
                </Label>

                <Input
                  id="name"
                  value={data?.name || ""}
                  className="col-span-3"
                  onChange={(e) => {
                    setData({ ...data, name: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-left">
                  Gới tính:
                </Label>

                <GenderSelect
                  value={data?.gender || ""}
                  onChange={(value) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setData({ ...data, gender: value as any })
                  }
                />
              </div>
              {mode === "addChild" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="birthday" className="text-left">
                    Quan hệ với {node?.gender === "male" ? "ông" : "bà"}{" "}
                    {node?.name}
                  </Label>
                  <div className="">
                    <RadioGroup
                      value={data?.childType ? "blood" : "adopted"}
                      className="flex"
                    >
                      <div
                        className="flex items-center space-x-2 "
                        onClick={() => {
                          setData({ ...data, childType: "blood" });
                        }}
                      >
                        <RadioGroupItem value="alive" id="r1" />
                        <Label className="w-[100px]" htmlFor="r1">
                          Con Ruột
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2"
                        onClick={() => {
                          setData({ ...data, childType: "adopted" });
                        }}
                      >
                        <RadioGroupItem value="death" id="r2" />
                        <Label className="w-[100px]" htmlFor="r2">
                          Con Riêng
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {mode === "addChild" && isMultiMarried && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="birthday" className="text-left">
                    Con của bà
                  </Label>
                  <div className="">
                    <RadioGroup value={data?.momId} className="flex">
                      {(spousesNode || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2 "
                          onClick={() => {
                            setData({ ...data, momId: item.id });
                          }}
                        >
                          <RadioGroupItem value="alive" id="r1" />
                          <Label className="w-[100px]" htmlFor="r1">
                            {item?.name || item?.id}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-left">
                  Năm sinh:
                </Label>
                <Input
                  id="birthday"
                  value={data?.birthday || ""}
                  className="col-span-3"
                  type="number"
                  onChange={(e) => {
                    setData({ ...data, birthday: e.target.value || "" });
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-left">
                  Còn sống:
                </Label>
                <RadioGroup
                  value={data?.isAlive ? "alive" : "death"}
                  className="flex"
                >
                  <div
                    className="flex items-center space-x-2 "
                    onClick={() => {
                      setData({ ...data, isAlive: true });
                    }}
                  >
                    <RadioGroupItem value="alive" id="r1" />
                    <Label className="w-[100px]" htmlFor="r1">
                      Còn sống
                    </Label>
                  </div>
                  <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setData({ ...data, isAlive: false });
                    }}
                  >
                    <RadioGroupItem value="death" id="r2" />
                    <Label className="w-[100px]" htmlFor="r2">
                      Đã mất
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {!data?.isAlive && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deathday" className="text-left">
                    Năm mất:
                  </Label>
                  <Input
                    id="deathday"
                    value={data?.deathday || ""}
                    className="col-span-3"
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, deathday: e.target.value });
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthPlace" className="text-left">
                  Nơi sinh:
                </Label>

                <Input
                  id="birthPlace"
                  value={data?.birthPlace || ""}
                  className="col-span-3"
                  onChange={(e) => {
                    setData({ ...data, birthPlace: e.target.value });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-left">
                  Địa chỉ:
                </Label>

                <Input
                  id="address"
                  value={data?.address || ""}
                  className="col-span-3"
                  onChange={(e) => {
                    setData({ ...data, address: e.target.value });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNum" className="text-left">
                  Số điện thoại:
                </Label>

                <Input
                  id="phoneNum"
                  value={data?.phoneNum || ""}
                  className="col-span-3"
                  onChange={(e) => {
                    setData({ ...data, phoneNum: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {mode !== "view" && (
          <DialogFooter className="p-4">
            <Button onClick={onSubmit}>Lưu</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
