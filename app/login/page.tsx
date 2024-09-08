"use client";
import {
  useAuthState,
  useSignInWithFacebook,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/config/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const description =
  "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.";

export default function Login() {
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [signInWithFacebook] = useSignInWithFacebook(auth);
  const [loggedInUser] = useAuthState(auth);
  const router = useRouter();

  const signInGoogle = () => {
    signInWithGoogle();
  };
  const signInFacebook = () => {
    signInWithFacebook();
  };
  useEffect(() => {
    if (loggedInUser) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  return (
    <div className="h-full flex items-center">
      <Card className="mx-auto max-w-sm ">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Chọn đăng nhập bằng gmail hoặc facebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={signInGoogle}>
              Đăng nhập bằng Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={signInFacebook}
            >
              Đăng nhập bằng Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
