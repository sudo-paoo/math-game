import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Math Game",
  description: "Generated by create next app, created by @ciupaoo. A simple math game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
