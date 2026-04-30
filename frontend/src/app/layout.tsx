import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Library } from "lucide-react";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cozy Library | Book Recommendations",
  description: "Discover your next great read in a cozy, minimalist environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${plusJakartaSans.variable} font-sans antialiased bg-background text-on-background flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <div className="grow flex flex-col w-full">
            {children}
          </div>
          
          
        </AuthProvider>
      </body>
    </html>
  );
}