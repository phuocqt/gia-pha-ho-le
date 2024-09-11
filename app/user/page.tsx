"use client";
import { getAllData, getDataById } from "@/actions";
import { UserClient } from "@/components/ui/user-tables/client";
import { auth } from "@/config/firebase";
import { User } from "@/type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!loggedInUser) router.push("/");

      if (loggedInUser) {
        if (!loggedInUser) router.push("/login");
        const user = await getDataById("users", loggedInUser?.uid || "");
        if (
          window.location.pathname === "/user" &&
          user?.role !== "supperAdmin"
        )
          router.push("/");
        const usersList = await getAllData("users");
        setUsers(usersList as User[]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  return (
    <div className="space-y-2 p-10">
      <UserClient data={users as User[]} />
    </div>
  );
}
