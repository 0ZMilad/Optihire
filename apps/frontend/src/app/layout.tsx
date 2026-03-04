import type { Metadata } from "next";
// Use the local geist npm package instead of next/font/google to avoid
// network requests to fonts.googleapis.com (works fully offline/dev).
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Optihire",
  description:
    "A web platform that helps job seekers improve their CVs for Applicant Tracking Systems (ATS). This platform provides automated analysis, compatibility scoring, and actionable suggestions to increase your chances of landing an interview.",
  icons: {
    icon: "/Omega.png", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:40px_40px]`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
