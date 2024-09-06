"use client";
import Link from "next/link";
import {
  useAuthState,
  useSignInWithFacebook,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { auth } from "@/src/config/firebase";
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
            {/* <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div> */}
            {/* <Button type="submit" className="w-full">
              Login
            </Button> */}
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
          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
