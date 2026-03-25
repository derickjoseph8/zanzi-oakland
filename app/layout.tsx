import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Zanzi Oakland - Premium Nightclub Experience",
    template: "%s | Zanzi Oakland",
  },
  description:
    "Oakland's premier international nightclub featuring world-class DJs, VIP bottle service, and an unforgettable nightlife experience. Reserve your table today.",
  keywords: [
    "Oakland nightclub",
    "VIP bottle service",
    "Oakland nightlife",
    "Bay Area clubs",
    "Zanzi Oakland",
    "table reservations",
    "events Oakland",
  ],
  authors: [{ name: "Zanzi Oakland" }],
  creator: "Zanzi Oakland",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zanzioakland.com",
    siteName: "Zanzi Oakland",
    title: "Zanzi Oakland - Premium Nightclub Experience",
    description:
      "Oakland's premier international nightclub featuring world-class DJs, VIP bottle service, and an unforgettable nightlife experience.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zanzi Oakland Nightclub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zanzi Oakland - Premium Nightclub Experience",
    description:
      "Oakland's premier international nightclub featuring world-class DJs, VIP bottle service, and an unforgettable nightlife experience.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-navy-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
