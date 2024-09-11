"use client";
import { deleteItem, editData } from "@/actions";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/type";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface CellActionProps {
  data: User;
  onSuccess?: () => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      await deleteItem("users", data?.id || "");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      setLoading(false);
    }
  };
  const setAdmin = async () => {
    console.log("data", data);

    try {
      await editData("users", data?.id || "", {
        role: "admin",
      });
      onSuccess?.();
    } catch (error) {}
  };
  const setUser = async () => {
    setLoading(true);
    try {
      await editData("users", data?.id || "", {
        role: "user",
      });
      onSuccess?.();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        {data?.role !== "supperAdmin" && (
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Xoá
            </DropdownMenuItem>
            {data?.role !== "admin" && (
              <DropdownMenuItem onClick={() => setAdmin()}>
                Set admin
              </DropdownMenuItem>
            )}
            {data?.role === "admin" && (
              <DropdownMenuItem onClick={() => setUser()}>
                set User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </>
  );
};
