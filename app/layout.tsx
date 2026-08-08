import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AI Interviewer | Modern AI Candidate Assessment Platform",
  description:
    "An autonomous AI Interviewer built with ChatGPT-like streaming, real-time assessment, dynamic curriculum coverage, and instant analytical reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans bg-[#09090B] text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col relative overflow-x-hidden`}
      >
        {/* Glowing Background Orbs */}
        <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-slow" />
        <div className="fixed bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-pattern opacity-60 pointer-events-none z-0" />

        <Providers>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
