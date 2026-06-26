import type { Metadata } from "next";
import "./globals.css";
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import { BRANDING } from "@/config/branding";

export const metadata: Metadata = {
  title: `${BRANDING.name} | Internship Certification Platform`,
  description: "Accelerate your career with verified professional internship certificates and test scorecards.",
  icons: {
    icon: BRANDING.logoIcon,
    shortcut: BRANDING.logoIcon,
    apple: BRANDING.logoIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased light"
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-slate-50 text-zinc-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-800"
        suppressHydrationWarning
      >
        <SessionTimeoutHandler />
        {children}
      </body>
    </html>
  );
}
