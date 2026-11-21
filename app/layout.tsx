import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gilda_Display, La_Belle_Aurore } from "next/font/google";
import "./globals.css";

const display = Gilda_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const script = La_Belle_Aurore({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diana & Richard · 27 July 2027",
  description: "You are invited to celebrate the wedding of Diana & Richard in Son Bunyola, Mallorca.",
  openGraph: {
    title: "Diana & Richard · 27 July 2027",
    description: "You are invited to celebrate our wedding in Son Bunyola, Mallorca.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e9e3dc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
