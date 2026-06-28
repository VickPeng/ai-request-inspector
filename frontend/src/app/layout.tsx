import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n-context";
import { Sidebar } from "@/components/sidebar";
import { BackToTop } from "@/components/back-to-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Request Inspector",
  description: "Monitor and analyze AI API request metrics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.className=t;else document.documentElement.className="dark"}catch(e){}})()
`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            <Sidebar />
            <main className="pl-56 min-h-screen bg-muted/30">{children}</main>
            <BackToTop />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
