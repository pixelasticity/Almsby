import type { Metadata } from "next";
import { Bricolage_Grotesque, Albert_Sans } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  // Per-page titles flow through the template; pages without their own
  // metadata fall back to `default`.
  title: {
    default: "Almsby — Every product has a story",
    template: "%s — Almsby",
  },
  description:
    "GS1 barcodes and EU Digital Product Passports, made simple for small makers.",
};

const bricolage = Bricolage_Grotesque({
  axes: ['opsz', 'wdth'],
  display: 'swap'
})

const albert = Albert_Sans({
  display: 'swap'
})

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${bricolage.className} ${albert.className}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}