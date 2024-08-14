"use client";

import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import NewsPlayer from "@/components/NewsPlayer";
import { usePathname } from "next/navigation";
import Searchbar from "@/components/SearchBar";
import { ModeToggleButton } from "@/components/ModeToggleButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname();

  const isNewsActive = pathName === "/news" || pathName.startsWith(`/news`);
  const isCreationActive =
    pathName === "/create-news" || pathName.startsWith(`/create-news`);
  return (
    <div className="relative flex flex-col">
      <main className="relative flex bg-black-3">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-14">
          <div className="mx-auto flex w-full max-w-15xl flex-col max-sm:px-4">
            <div className="flex h-16 items-center justify-between md:hidden">
              <Image src="/logo.png" width={70} height={70} alt="homeIcon" />
              <MobileNav />
            </div>
            <div className="flex flex-col md:pb-14">
              {!isCreationActive && !isNewsActive && <Searchbar />}
              <Toaster />
              {children}
            </div>
          </div>
        </section>
        <RightSidebar />
      </main>
      <NewsPlayer />
    </div>
  );
}
