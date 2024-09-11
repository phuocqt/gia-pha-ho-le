"use client";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { User } from "@/type";
import { Heading } from "../heading";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { convertFirebaseTimestamp } from "@/utils";

interface ProductsClientProps {
  data: User[];
  onChange?: () => void;
}

export const UserClient: React.FC<ProductsClientProps> = ({
  data,
  onChange,
}) => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return <div>{row.original.role || "user"}</div>;
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last login",
      cell: ({ row }) => {
        return (
          <div>{convertFirebaseTimestamp(row?.original?.lastLoginAt)}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellAction data={row.original} onSuccess={onChange} />
      ),
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Users (${data.length})`}
          description="Manage users (Client side table functionalities.)"
        />
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
