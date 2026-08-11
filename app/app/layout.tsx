import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Almsby — Every product has a story",
  description:
    "GS1 barcodes and EU Digital Product Passports, made simple for small makers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}