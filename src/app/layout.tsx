import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kopiser Komuta Merkezi",
  description: "Kopiser büyüme ve operasyon paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body
        className="h-full flex"
        style={{ backgroundColor: "#F7F9FC", fontFamily: "var(--font-geist-sans)" }}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
      </body>
    </html>
  );
}
