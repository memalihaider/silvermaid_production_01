import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    icon: "/favicon.svg",
    apple: "/logo.png",
    other: [
      {
        rel: "icon",
        url: "/favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        rel: "icon",
        url: "/favicon.svg",
        sizes: "16x16",
        type: "image/svg+xml",
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
        <meta name="google-site-verification" content="3ICCi_T_3ifEKoLOLLpoGS9wuvCafKGU4swNRkKi4ic" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="prefetch" href="/" />
        <link rel="prefetch" href="/services" />
        <link rel="prefetch" href="/about" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2L0YZK075C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2L0YZK075C');
          `}
        </Script>
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
