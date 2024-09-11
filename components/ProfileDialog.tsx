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
import { addData, deleteItem, editData, getDataByField } from "@/actions";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import avatarIcon from "../assets/avatar.jpg";
import { Alert } from "./ui/alert";
import ValidatedYearInput from "./ui/validateYearInput";
import { deleteNode } from "@/utils";

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
  const [openAlert, setOpenAlert] = useState<{
    messenger?: string;
    onConfirm?: () => void;
  }>({
    messenger: "",
    onConfirm: () => {},
  });

  const { toast } = useToast();
  useEffect(() => {
    if (!!node) setMode("view");
  }, [node, open]);

  const isLeader = !!node?.parents?.length;
  const isRootNode = allNode?.length === 1;
  const isMultiMarried = (node?.spouses?.length || 0) > 1;
  const spousesNode = (node?.spouses || []).map((item) => {
    const itemDetail = allNode?.find((i) => i.id === item.id);
    return {
      ...itemDetail,
    };
  });
  const childNode = (node?.children || []).map((item) => {
    const itemDetail = allNode?.find((i) => i.id === item.id);
    return {
      ...itemDetail,
    };
  });

  const itsMe = data?.userId === loggedInUser?.uid;

  const handleAddMe = () => {
    if (itsMe) {
      const removeMe = () => {
        editData("data", node?.id || "", {
          userId: "",
          photoURL: "",
          editUser: loggedInUser?.uid,
        });
        setData({ ...data, photoURL: "", userId: "" });
      };
      setOpenAlert({
        messenger: `${node?.gender === "male" ? "Ông " : "Bà "} ${
          node?.name
        } không phải là bạn đúng không?`,
        onConfirm: removeMe,
      });
    } else {
      const addMe = async () => {
        const itsMeData = await getDataByField("userId", loggedInUser?.uid);
        if (itsMeData?.[0]?.id) {
          editData("data", itsMeData?.[0]?.id, {
            userId: "",
            photoURL: "",
            editUser: loggedInUser?.uid,
          });
        }

        editData("data", node?.id || "", {
          userId: loggedInUser?.uid,
          photoURL: loggedInUser?.photoURL,
          editUser: loggedInUser?.uid,
        });
        setData({
          ...data,
          photoURL: loggedInUser?.photoURL as string,
          userId: loggedInUser?.uid,
        });
      };
      setOpenAlert({
        messenger: `${node?.gender === "male" ? "Ông " : "Bà "} ${
          node?.name
        } là bạn `,
        onConfirm: addMe,
      });
    }
  };

  const onSubmit = () => {
    if (mode === "edit") {
      editData(
        "data",
        node?.id || "",
        { ...data, editUser: loggedInUser?.uid } as NodeItem,
        (type) => {
          if (type === "error")
            toast({
              title: "Đã có lỗi, vui lòng thử lại",
            });
          if (type === "success")
            toast({
              title: "Đã cập nhật thành công",
            });
          onClose?.("success");
        }
      );
    }
    if (mode === "addChild") {
      const newId = uuidv4();
      const otherParent = data?.otherParentId
        ? { id: data?.otherParentId, type: "blood" }
        : (node?.spouses?.length || 0) > 0
        ? { id: node?.spouses?.[0].id, type: "blood" }
        : {};
      const tempData = {
        ...data,
        id: newId,
        createUser: loggedInUser?.uid,
        parents: otherParent?.id
          ? [{ id: node?.id || "", type: "blood" }, otherParent]
          : [{ id: node?.id || "", type: "blood" }],
      };
      const childData = {
        editUser: loggedInUser?.uid,
        children: [
          ...(node?.children || []),
          { id: newId, type: data?.childType },
        ],
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
        onClose?.("success");
      });
      // update parent
      editData("data", node?.id || "", childData);
      editData("data", otherParent?.id || "", childData);

      // update siblings
      if (node?.children && node?.children.length > 0) {
        childNode?.forEach((child) => {
          editData("data", child.id || "", {
            siblings: [
              ...(child?.siblings || []),
              { id: newId, type: data.childType },
            ],
          } as any);
        });
      }
    }
    if (mode === "addSpouses") {
      const newId = uuidv4();

      const tempData = {
        ...data,
        id: newId,
      };
      const nodeData = {
        ...node,
        spouses: [...(node?.spouses || []), { id: newId, type: "married" }],
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
        onClose?.("success");
      });
      editData("data", node?.id || "", nodeData as NodeItem);
    }
  };

  const initChild = {
    otherParentId: node?.spouses?.[0]?.id || "",
    gender: "male" as any,
    childType: "blood",
    isAlive: true,
    children: [],
    siblings: [],
    spouses: [],
    parents: [],
  };
  const initSpouse = {
    gender: node?.gender === "male" ? "female" : "male",
    childType: "blood",
    isAlive: true,
    siblings: [],
    children: [...(node?.children || [])],
    spouses: [{ id: node?.id, type: "married" }],
    parents: [],
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-[425px] p-0 bg-[#fafafa] text-black border-none max-h-full overflow-auto">
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
                  src={node?.photoURL || avatarIcon.src}
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
                className="w-[100px] mb-2 "
                onClick={() => {
                  setMode("edit");
                  setData({ ...(node as any) });
                }}
              >
                Chỉnh sửa
              </AuthButton>
              {loggedInUser ? (
                !isLeader || isRootNode ? (
                  <>
                    <Button
                      onClick={() => {
                        setMode("addChild");
                        setData(initChild);
                      }}
                      variant="default"
                      className="w-[100px] mb-2 "
                    >
                      Thêm Con
                    </Button>
                    <Button
                      onClick={() => {
                        if (allNode && node) deleteNode(allNode, node);
                      }}
                      variant="default"
                      className="w-[70px] mb-2 "
                    >
                      Xoá
                    </Button>
                  </>
                ) : (
                  <>
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
                            setData(initSpouse as any);
                          }}
                        >
                          Thêm {`${node?.gender === "male" ? "Vợ" : "Chồng"}`}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setMode("addChild");
                            setData(initChild);
                          }}
                        >
                          Thêm Con
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={() => {
                        if (allNode && node) deleteNode(allNode, node);
                      }}
                      variant="default"
                      className="w-[70px] mb-2 "
                    >
                      Xoá
                    </Button>
                  </>
                )
              ) : (
                <>
                  <AuthButton variant="default" className="w-[150px] mb-2  ">
                    Thêm Thành viên
                  </AuthButton>
                  <AuthButton variant="default" className="w-[150px] mb-2  ">
                    Xoá
                  </AuthButton>
                </>
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
                  {node?.gender
                    ? node?.gender === "male"
                      ? "Nam"
                      : "Nữ"
                    : "-"}
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
                  data?.gender === "male"
                    ? "border-2 border-[#a4ecff] bg-[#fff8dc]"
                    : "border-2 border-[#fdaed8] bg-[#f0ffff]"
                } mb-1 w-[120px] h-[120px] rounded-full overflow-hidden mt-2`}
              >
                <AvatarImage
                  src={data?.photoURL || avatarIcon.src}
                  alt={data?.name}
                />
              </Avatar>
              <div className="flex items-center ml-2">
                <Button className="w-full" onClick={handleAddMe}>
                  {itsMe ? "Đây không phải tôi" : "Đây là tôi"}{" "}
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
                    <RadioGroup value={data?.childType} className="flex">
                      <div
                        className="flex items-center space-x-2 "
                        onClick={() => {
                          setData({ ...data, childType: "blood" });
                        }}
                      >
                        <RadioGroupItem value="blood" id="r1" />
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
                        <RadioGroupItem value="adopted" id="r2" />
                        <Label className="w-[100px]" htmlFor="r2">
                          Con Riêng
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {(mode === "addChild" || mode === "edit") &&
                isMultiMarried &&
                isLeader && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthday" className="text-left">
                      Con của {`${node?.gender === "male" ? "bà" : "ông"}`}
                    </Label>
                    <div className="">
                      <Select
                        value={data?.otherParentId}
                        onValueChange={(value) =>
                          setData({ ...data, otherParentId: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue
                            placeholder={
                              spousesNode.find(
                                (item) => item.id === data?.otherParentId
                              )?.name
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {(spousesNode || []).map((item) => (
                              <SelectItem key={item.id} value={item.id || ""}>
                                {item?.name || ""}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-left">
                  Năm sinh:
                </Label>
                <ValidatedYearInput
                  id="birthday"
                  value={data?.birthday || ""}
                  className="col-span-3"
                  onChange={(value) => {
                    setData({ ...data, birthday: value || "" });
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
                  <ValidatedYearInput
                    id="deathday"
                    value={data?.deathday || ""}
                    className="col-span-3"
                    onChange={(value) => {
                      setData({ ...data, deathday: value });
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note" className="text-left">
                  Ghi chú
                </Label>

                <Input
                  id="note"
                  value={data?.note || ""}
                  className="col-span-3"
                  onChange={(e) => {
                    setData({ ...data, note: e.target.value });
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
      <Alert
        messenger="Vui lòng xác nhận"
        desc={openAlert?.messenger}
        open={!!openAlert?.messenger}
        onClose={() => setOpenAlert({})}
        onContinue={() => {
          openAlert.onConfirm?.();
          setOpenAlert({});
        }}
      />
    </Dialog>
  );
}
