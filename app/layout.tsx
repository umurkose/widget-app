import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
import { AppDock } from "@/components/app-dock";
import { AppShell } from "@/components/app-shell";
import { PreferencesProvider } from "@/components/preferences-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { preferencesInitScript } from "@/lib/preferences";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Widget Board",
  description: "Role-based widget dashboard with drag-and-drop.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved accent/theme/font/text-size before first paint. */}
        <script
          dangerouslySetInnerHTML={{ __html: preferencesInitScript() }}
        />
      </head>
      <body className="flex h-full flex-col overflow-hidden font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PreferencesProvider>
            <TooltipProvider>
              <AppShell>{children}</AppShell>
              <AppDock />
            </TooltipProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
