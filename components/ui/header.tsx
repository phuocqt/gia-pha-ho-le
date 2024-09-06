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
import { auth } from "@/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";

export default function Header() {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("ERROR LOGGING OUT", error);
    }
  };
  const [loggedInUser] = useAuthState(auth);
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          doc(db, "users", loggedInUser?.email as string),
          {
            email: loggedInUser?.email,
            photoURL: loggedInUser?.photoURL,
          },
          { merge: true } // just update what is changed
        );
      } catch (error) {
        console.log("ERROR SETTING USER INFO IN DB", error);
      }
    };

    if (loggedInUser) {
      setUserInDb();
      setIsLogged(true);
    } else setIsLogged(false);
  }, [loggedInUser]);

  return (
    <header className="sticky top-0  z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-[#404040] sm:px-6">
      <div className="py-2">
        {!isLogged ? (
          <div className="mr-3">
            <Button>
              <Link href="/login">Login</Link>
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
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
