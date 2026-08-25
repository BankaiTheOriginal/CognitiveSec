import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cognitive Sec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
