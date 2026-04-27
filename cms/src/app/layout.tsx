import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Essential Bali CMS",
  description: "Headless Payload CMS for Essential Bali",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
