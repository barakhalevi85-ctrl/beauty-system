import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlamFlow | מערכת ניהול תורים",
  description: "מערכת ניהול תורים מודרנית ודינמית למקצועות הביוטי",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
