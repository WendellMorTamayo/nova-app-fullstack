import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ConvexClerkProvider from "../providers/ConvexClerkProvider";
import AudioProvider from "@/providers/AudioProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalLoadingProvider } from "@/providers/GlobalLoadingProvider";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova",
  description: "AI Newscaster",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <AudioProvider>
          <body className={manrope.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SearchProvider>
                <GlobalLoadingProvider>
                  {/* Make sure children is rendered directly without any wrapping divs
                      to ensure Next.js can properly detect and apply loading states */}
                  {children}
                </GlobalLoadingProvider>
              </SearchProvider>
            </ThemeProvider>
            <Toaster />
          </body>
        </AudioProvider>
      </html>
    </ConvexClerkProvider>
  );
}
