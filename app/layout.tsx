import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/ui/header";
import { Toaster } from "@/components/ui/toaster";
import { APIProvider } from "@vis.gl/react-google-maps";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Gia phả họ Lê",
  description: "Gia Phả Họ Lê - Cẩm Phổ - Gio Linh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
      >
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Toaster />
          <Header />
          {children}
        </APIProvider>
      </body>
    </html>
  );
}
