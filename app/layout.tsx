import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import SmoothHashScroll from "@/components/ui/SmoothHashScroll";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kinwise | Creative Designer, Motion Designer & Video Editor",
  description:
    "Portfolio of Kinwise: graphic design, motion design and video editing that makes ideas impossible to ignore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <Navbar />
        <SmoothHashScroll />
        <main>{children}</main>
      </body>
    </html>
  );
}