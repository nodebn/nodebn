import type { Metadata } from "next";
import localFont from "next/font/local";

import { BRAND_DESCRIPTION, BRAND_NAME } from "@/lib/brand";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: BRAND_NAME,
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
