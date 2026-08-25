"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDataById } from "@/actions";
import { DataManagement } from "@/components/ui/data-management";
import { auth } from "@/config/firebase";

export default function DataManagementPage() {
  const [loggedInUser, loading] = useAuthState(auth);
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (loading) return;

      if (!loggedInUser) {
        router.push("/login");
        return;
      }

      const user = await getDataById("users", loggedInUser.uid);
      if (user?.role !== "supperAdmin") {
        router.push("/");
        return;
      }

      setIsAllowed(true);
    })();
  }, [loading, loggedInUser, router]);

  if (!isAllowed) return null;

  return <DataManagement />;
}
