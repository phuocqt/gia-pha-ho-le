"use client";
import Login from "./login/page";
import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/config/firebase";

export default function Home() {
  const [loggedInUser, loading, _error] = useAuthState(auth);

  return (
    <div className=" font-[family-name:var(--font-geist-sans)]">
      {loggedInUser?.photoURL}
    </div>
  );
}
