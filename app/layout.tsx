import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curipo — Find the right AI agent",
  description: "Describe what you want to automate and get matched with the best AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f6f7f9] text-slate-900">
        {children}
      </body>
    </html>
  );
}
