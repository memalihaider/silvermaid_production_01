import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Silver Maid - Professional Cleaning & Hygiene Services",
  description: "UAE's trusted hygiene solution provider, dedicated to creating fresh, clean, and productive environments for homes and offices.",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/logo.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ea4c8c" />
        <meta name="description" content="UAE's trusted hygiene solution provider" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="prefetch" href="/" />
        <link rel="prefetch" href="/services" />
        <link rel="prefetch" href="/about" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
