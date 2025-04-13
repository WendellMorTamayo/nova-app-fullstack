"use client";

import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import { Toaster } from "@/components/ui/toaster";
import NewsPlayer from "@/components/NewsPlayer";
import { usePathname } from "next/navigation";
import SearchBarWithSuspense from "@/components/SearchBarWithSuspense";
import { AnimatedLogo } from "@/components/magicui/animated-logo";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname();

  const isNewsActive = pathName === "/news" || pathName.startsWith(`/news`);
  const isCreationActive = pathName === "/create-news" || pathName.startsWith(`/create-news`);
  const isSubscriptionPage = pathName === "/settings/subscription" || pathName.startsWith(`/settings/subscription`);
  const isAdminPage = pathName === "/admin/stats" || pathName.startsWith(`/admin`);
  
  return (
    <div className="relative flex flex-col">
      <main className="relative flex bg-gray-100 dark:bg-black-3">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-2 sm:px-4 md:px-8 lg:px-14 text-black-1 dark:text-white-1">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col">
            <div className="flex h-16 items-center justify-between md:hidden">
              <AnimatedLogo width={60} height={60} />
              <MobileNav />
            </div>
            <div className="flex flex-col md:pb-14">
              {!isCreationActive && !isNewsActive && !isSubscriptionPage && !isAdminPage && <SearchBarWithSuspense />}
              <Toaster />
              {/* Let Next.js handle loading states with standard app router patterns */}
              {children}
            </div>
          </div>
        </section>
        {isNewsActive && <RightSidebar />}
      </main>
      <NewsPlayer />
    </div>
  );
}
