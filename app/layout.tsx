import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Course AI",
  description: "AI course discovery and purchase assistant",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
