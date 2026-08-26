import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { cn } from "@/lib/utils";
import localFont from "next/font/local";

const bodyFont = localFont({
  src: "../node_modules/next/dist/esm/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-body",
});

const displayFont = localFont({
  src: "../node_modules/next/dist/esm/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-heading",
});

const codeFont = localFont({
  src: "../node_modules/next/dist/esm/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: "Cognitive Sec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        bodyFont.variable,
        displayFont.variable,
        codeFont.variable,
      )}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
