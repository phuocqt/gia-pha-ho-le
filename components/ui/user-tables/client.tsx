"use client";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { User } from "@/type";
import { Heading } from "../heading";
import { columns } from "./columns";

interface ProductsClientProps {
  data: User[];
}

export const UserClient: React.FC<ProductsClientProps> = ({ data }) => {
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
