import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airlock",
  description: "Private, fully-local PDF document assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
