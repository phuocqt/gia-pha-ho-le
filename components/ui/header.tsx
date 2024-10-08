"use client";
import Image from "next/image";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import userIcon from "../../assets/placeholder-user.jpg";
import { signOut } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDataById, syncUser } from "@/actions";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("ERROR LOGGING OUT", error);
    }
  };
  const setting = async () => {
    try {
    } catch (error) {
      console.log("ERROR", error);
    }
  };
  const [loggedInUser] = useAuthState(auth);
  const [userRole, setUserRole] = useState();
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          doc(db, "users", loggedInUser?.uid as string),
          {
            email: loggedInUser?.email,
            photoURL: loggedInUser?.photoURL,
            name: loggedInUser?.displayName,
            lastLoginAt: serverTimestamp(),
            id: loggedInUser?.uid,
          },
          { merge: true } // just update what is changed
        );
        const user = await getDataById("users", loggedInUser?.uid || "");
        setUserRole(user?.role);
        syncUser({
          id: loggedInUser?.uid,
          email: loggedInUser?.email || "",
          name: loggedInUser?.displayName || "",
          role: user?.role || "user",
        });
        if (
          window.location.pathname === "/user" &&
          user?.role !== "supperAdmin"
        )
          router.push("/");
      } catch (error) {
        console.log("ERROR SETTING USER INFO IN DB", error);
      }
    };

    if (loggedInUser) {
      setUserInDb();
      setIsLogged(true);
    } else setIsLogged(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  return (
    <header className="sticky top-0  z-30 flex h-14 items-center  gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-[#404040] sm:px-6">
      <div className="py-2 justify-between flex w-full">
        <div className="flex">
          <div className="mr-3">
            <Button>
              <Link href="/">Gia Phả</Link>
            </Button>
          </div>
          <div className="mr-3">
            <Button>
              <Link href="/map">Bản đồ phần mộ</Link>
            </Button>
          </div>
          {loggedInUser && userRole === "supperAdmin" && (
            <div className="mr-3">
              <Button>
                <Link href="/user">Quản lý User</Link>
              </Button>
            </div>
          )}
        </div>
        {!isLogged ? (
          <div className="mr-3">
            <Button>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src={loggedInUser?.photoURL || userIcon}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={setting}>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
