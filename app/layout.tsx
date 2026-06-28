import type { Metadata } from "next";
import Script from "next/script";
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
  verification: {
    google: "TZ6-qTsG5N28OpBI5m0m10TbW48IrPgU1N6Icy8Nxzc",
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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WLKRD5V6');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body 
        className="min-h-full flex flex-col bg-slate-50 text-zinc-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-800"
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WLKRD5V6"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SessionTimeoutHandler />
        {children}
      </body>
    </html>
  );
}
