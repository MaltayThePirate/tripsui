// app/layout.js
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const metadata = {
  title: "Trip Planner",
  description: "Plan your trip, one day at a time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}