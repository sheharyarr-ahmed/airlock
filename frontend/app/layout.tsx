import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Airlock — Private, local PDF assistant",
  description:
    "Upload a PDF and ask questions in plain language. Answers are grounded in your document with exact page citations — and nothing ever leaves your machine.",
  applicationName: "Airlock",
  authors: [{ name: "Sheharyar Ahmed" }],
  keywords: [
    "PDF assistant",
    "local AI",
    "private",
    "RAG",
    "document Q&A",
    "LM Studio",
    "offline",
  ],
  openGraph: {
    title: "Airlock — Private, local PDF assistant",
    description:
      "Answers grounded in your document with page citations. Fully local — works with wifi off.",
    type: "website",
    siteName: "Airlock",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airlock — Private, local PDF assistant",
    description:
      "Answers grounded in your document with page citations. Fully local — works with wifi off.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#131315" },
  ],
};

// Set the theme class before first paint to avoid a flash of the wrong theme.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
