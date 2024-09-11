"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User } from "@/type";
import { convertFirebaseTimestamp } from "@/utils";

export const columns: ColumnDef<User>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
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
      return <div>{convertFirebaseTimestamp(row?.original?.lastLoginAt)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
